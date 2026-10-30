import "server-only";
import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { CERT_MAX_BYTES, CV_MAX_BYTES, IMG_MAX_BYTES } from "./validations";

/**
 * Pluggable private storage for candidate CVs and documents.
 * - "none"  : uploads disabled (default)
 * - "local" : writes to ./private-uploads, outside /public so files are never served directly.
 *             Suitable for a self-hosted Node server only — serverless filesystems are ephemeral.
 * To use cloud storage (S3, R2, Azure Blob, etc.), add a provider branch in `saveFile`
 * that uploads to a PRIVATE bucket and returns its object key.
 */
export type StoredFile = { storageKey: string; originalName: string; mimeType: string; size: number };

export class UploadError extends Error {}

type FileSpec = {
  ext: string;
  magic: (b: Buffer) => boolean;
};

const DOC_TYPES: Record<string, FileSpec> = {
  "application/pdf": { ext: "pdf", magic: (b) => b.subarray(0, 4).toString("latin1") === "%PDF" },
  "application/msword": { ext: "doc", magic: (b) => b.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0])) },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: "docx",
    magic: (b) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
  },
};

const IMG_TYPES: Record<string, FileSpec> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  "image/png": { ext: "png", magic: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  "image/webp": { ext: "webp", magic: (b) => b.subarray(8, 12).toString("ascii") === "WEBP" },
};

const CERT_TYPES: Record<string, FileSpec> = { ...DOC_TYPES, ...IMG_TYPES };

export function cvStorageProvider() {
  return (process.env.CV_STORAGE_PROVIDER ?? "none").toLowerCase();
}

async function saveToProvider(buffer: Buffer, storageKey: string): Promise<void> {
  const provider = cvStorageProvider();

  if (provider === "local") {
    const target = path.join(process.cwd(), "private-uploads", storageKey);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer, { flag: "wx" });
    return;
  }

  if (provider === "cloudinary") {
    const { uploadToCloudinary } = await import("./cloudinary");
    const folder = `goldenfalcone/${storageKey.split("/")[0]}`;
    const publicId = storageKey.split("/").slice(1).join("/").replace(/\.[^.]+$/, "");
    await uploadToCloudinary(buffer, { folder, publicId });
    return;
  }

  throw new Error(`Unknown CV_STORAGE_PROVIDER "${provider}"`);
}

export async function saveCv(file: File): Promise<StoredFile> {
  const provider = cvStorageProvider();
  if (provider === "none") throw new UploadError("CV uploads are not currently accepted.");

  if (file.size === 0) throw new UploadError("The selected file is empty.");
  if (file.size > CV_MAX_BYTES) throw new UploadError("CV must be 5 MB or smaller.");

  const type = DOC_TYPES[file.type];
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!type || !type.magic(buffer)) throw new UploadError("CV must be a PDF or Word document.");

  const storageKey = `cv/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${type.ext}`;
  const meta: StoredFile = {
    storageKey,
    originalName: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 200),
    mimeType: file.type,
    size: file.size,
  };

  if (provider === "cloudinary") {
    const { uploadToCloudinary } = await import("./cloudinary");
    const res = await uploadToCloudinary(buffer, {
      folder: "goldenfalcone/cv",
      publicId: `${new Date().toISOString().slice(0, 7)}/${randomUUID()}`,
    });
    return { ...meta, storageKey: res.secure_url };
  }

  await saveToProvider(buffer, storageKey);
  return meta;
}

/** Save a certificate or training document (PDF, Word, or image). */
export async function saveCertificate(file: File, prefix: "cert" | "training" | "portfolio"): Promise<StoredFile> {
  const provider = cvStorageProvider();
  if (provider === "none") throw new UploadError("Document uploads are not currently accepted.");

  if (file.size === 0) throw new UploadError("The selected file is empty.");

  const allowedTypes = prefix === "portfolio" ? IMG_TYPES : CERT_TYPES;
  const maxBytes = prefix === "portfolio" ? IMG_MAX_BYTES : CERT_MAX_BYTES;

  if (file.size > maxBytes) throw new UploadError(`File must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`);

  const type = allowedTypes[file.type];
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!type || !type.magic(buffer)) {
    if (prefix === "portfolio") throw new UploadError("Portfolio images must be JPEG, PNG or WebP.");
    throw new UploadError("Certificates must be PDF, Word or image files.");
  }

  const storageKey = `${prefix}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${type.ext}`;
  const meta: StoredFile = {
    storageKey,
    originalName: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 200),
    mimeType: file.type,
    size: file.size,
  };

  if (provider === "cloudinary") {
    const { uploadToCloudinary } = await import("./cloudinary");
    const res = await uploadToCloudinary(buffer, {
      folder: `goldenfalcone/${prefix}`,
      publicId: `${new Date().toISOString().slice(0, 7)}/${randomUUID()}`,
    });
    return { ...meta, storageKey: res.secure_url };
  }

  await saveToProvider(buffer, storageKey);
  return meta;
}

// Accept any key from saveCv or saveCertificate
const STORAGE_KEY = /^(cv|cert|training|portfolio)\/\d{4}-\d{2}\/[0-9a-f-]{36}\.(pdf|docx?|jpg|png|webp)$/;

const localPath = (storageKey: string) => {
  if (!STORAGE_KEY.test(storageKey)) throw new UploadError("Invalid file reference.");
  return path.join(process.cwd(), "private-uploads", storageKey);
};

/** Reads a stored file for an authorised admin download. Returns null if the file no longer exists. */
export async function readCv(storageKey: string): Promise<Buffer | null> {
  const provider = cvStorageProvider();
  if (provider === "local") {
    try {
      return await readFile(localPath(storageKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  if (provider === "cloudinary") {
    try {
      if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
        const resp = await fetch(storageKey);
        if (!resp.ok) return null;
        return Buffer.from(await resp.arrayBuffer());
      }
    } catch {
      return null;
    }
  }
  return null;
}

/** Read any stored file — delegates to readCv (same logic). */
export const readFile_ = readCv;

export async function deleteCv(storageKey: string) {
  if (cvStorageProvider() === "local") {
    await unlink(localPath(storageKey)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  if (cvStorageProvider() === "cloudinary") {
    const { deleteFromCloudinary } = await import("./cloudinary");
    await deleteFromCloudinary(storageKey).catch(() => undefined);
  }
}

/** Delete multiple stored files; errors are logged but do not throw. */
export async function deleteFiles(keys: (string | undefined | null)[]) {
  await Promise.allSettled(keys.filter(Boolean).map((k) => deleteCv(k!)));
}

