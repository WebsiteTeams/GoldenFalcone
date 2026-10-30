import "server-only";
import { Readable } from "stream";
import mongoose from "mongoose";
import { IMAGE_MAX_BYTES } from "@/lib/admin/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { UploadError } from "@/lib/storage";
import { deleteFromCloudinary, isCloudinaryConfigured, uploadToCloudinary } from "./cloudinary";

/**
 * Public website images (product photos, portfolio images, logo) stored in MongoDB GridFS,
 * so uploads work on any host — including serverless platforms with no persistent disk.
 * Candidate CVs are NOT stored here; they use the private storage in `lib/storage.ts`.
 */

const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (b) => b.length >= 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  "image/gif": (b) => b.length >= 4 && b.subarray(0, 4).toString("latin1") === "GIF8",
  "image/avif": (b) =>
    b.length >= 12 &&
    b.subarray(4, 8).toString("latin1") === "ftyp" &&
    ["avif", "avis"].includes(b.subarray(8, 12).toString("latin1")),
  "image/bmp": (b) => b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d,
  "image/tiff": (b) =>
    b.length >= 4 &&
    ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
      (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)),
  "image/x-icon": (b) =>
    b.length >= 4 && b[0] === 0x00 && b[1] === 0x00 && (b[2] === 0x01 || b[2] === 0x02) && b[3] === 0x00,
  "image/svg+xml": (b) => {
    const s = b.subarray(0, Math.min(b.length, 1024)).toString("utf8").trim().toLowerCase();
    return s.includes("<svg") || (s.includes("<?xml") && s.includes("<svg"));
  },
  "image/heic": (b) =>
    b.length >= 12 &&
    b.subarray(4, 8).toString("latin1") === "ftyp" &&
    ["heic", "heix", "hevc", "heim", "heis", "mif1"].includes(b.subarray(8, 12).toString("latin1")),
};

async function bucket() {
  const conn = await connectToDatabase();
  return new mongoose.mongo.GridFSBucket(conn.connection.db!, { bucketName: "media" });
}

export const mediaUrl = (mediaId: string) => {
  if (!mediaId) return "";
  if (mediaId.startsWith("http://") || mediaId.startsWith("https://") || mediaId.startsWith("/")) {
    return mediaId;
  }
  return `/api/media/${mediaId}`;
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
};

export async function saveImage(file: File, uploadedBy: string) {
  if (file.size === 0) throw new UploadError("The selected file is empty.");
  if (file.size > IMAGE_MAX_BYTES) throw new UploadError("Images must be 4 MB or smaller.");
  const buffer = Buffer.from(await file.arrayBuffer());

  // Detect image type by magic bytes first, then fall back to declared type or extension
  let type = Object.keys(SIGNATURES).find((t) => SIGNATURES[t](buffer));
  if (!type && file.type && file.type.startsWith("image/")) {
    type = file.type;
  }
  if (!type) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext && EXT_TO_MIME[ext]) {
      type = EXT_TO_MIME[ext];
    }
  }
  if (!type) throw new UploadError("Upload a valid image (JPEG, PNG, WebP, AVIF, SVG, GIF, etc.).");

  // If Cloudinary is configured, upload directly to Cloudinary CDN
  if (isCloudinaryConfigured()) {
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^\w\-]/g, "_").slice(0, 80);
      const res = await uploadToCloudinary(buffer, {
        filename: cleanName,
        tags: ["goldenfalcone", uploadedBy],
      });
      return res.secure_url;
    } catch (error) {
      console.error("[media] Cloudinary upload failed, falling back to GridFS:", error);
    }
  }

  // Fallback to MongoDB GridFS
  const store = await bucket();
  const id = new mongoose.Types.ObjectId();
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(
        store.openUploadStreamWithId(id, file.name.replace(/[^\w.\- ]/g, "_").slice(0, 120) || "image", {
          metadata: { contentType: type, uploadedBy },
        }),
      )
      .on("finish", () => resolve())
      .on("error", reject);
  });
  return String(id);
}

export async function openImage(mediaId: string) {
  if (!/^[a-f0-9]{24}$/i.test(mediaId)) return null;
  const store = await bucket();
  const id = new mongoose.Types.ObjectId(mediaId);
  const file = await store.find({ _id: id }).next();
  if (!file) return null;
  return {
    stream: store.openDownloadStream(id),
    contentType: (file.metadata?.contentType as string | undefined) ?? "application/octet-stream",
    length: file.length,
  };
}

export async function deleteMedia(mediaIds: string[]) {
  if (!mediaIds.length) return;
  const store = await bucket().catch(() => null);

  await Promise.all(
    mediaIds.map(async (id) => {
      if (!id) return;
      if (id.startsWith("http://") || id.startsWith("https://") || !/^[a-f0-9]{24}$/i.test(id)) {
        if (isCloudinaryConfigured()) {
          await deleteFromCloudinary(id).catch(() => undefined);
        }
        return;
      }
      if (store) {
        await store.delete(new mongoose.Types.ObjectId(id)).catch(() => undefined);
      }
    }),
  );
}
