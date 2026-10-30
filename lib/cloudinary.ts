import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

/**
 * Checks if Cloudinary credentials are provided via environment variables.
 * Supports CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET.
 */
export function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.trim() !== "") {
    return true;
  }
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function initCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
      secure: true,
    });
  }
}

initCloudinary();

/**
 * Uploads a buffer directly to Cloudinary.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    filename?: string;
    tags?: string[];
  }
): Promise<UploadApiResponse> {
  initCloudinary();
  const folder = options?.folder || process.env.CLOUDINARY_FOLDER || "goldenfalcone";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options?.publicId,
        resource_type: "auto",
        tags: options?.tags,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed with empty response."));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Extracts the Cloudinary public_id from a URL or raw public ID.
 */
export function extractPublicId(publicIdOrUrl: string): string | null {
  if (!publicIdOrUrl) return null;
  if (!publicIdOrUrl.startsWith("http://") && !publicIdOrUrl.startsWith("https://")) {
    return publicIdOrUrl;
  }
  try {
    const url = new URL(publicIdOrUrl);
    const parts = url.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    let pathAfterUpload = parts.slice(uploadIndex + 1);
    // Skip version segment like v1712345678
    if (pathAfterUpload[0]?.startsWith("v") && /^\d+$/.test(pathAfterUpload[0].slice(1))) {
      pathAfterUpload = pathAfterUpload.slice(1);
    }
    const fullPath = pathAfterUpload.join("/");
    // Strip file extension
    return fullPath.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using its URL or public ID.
 */
export async function deleteFromCloudinary(publicIdOrUrl: string): Promise<void> {
  try {
    initCloudinary();
    const publicId = extractPublicId(publicIdOrUrl);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("[cloudinary] delete error:", error);
  }
}

export { cloudinary };
