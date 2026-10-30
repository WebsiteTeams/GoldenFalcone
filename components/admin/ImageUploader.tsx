"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, X } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { IMAGE_MAX_BYTES, IMAGE_TYPES } from "@/lib/admin/constants";
import { useToast } from "./ToastNotification";

export type UploadedImage = { mediaId: string; alt?: string };

type ImageUploaderProps = {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
  label?: string;
  hint?: string;
};

const src = (mediaId: string) =>
  mediaId.startsWith("http://") || mediaId.startsWith("https://") || mediaId.startsWith("/")
    ? mediaId
    : `/api/media/${mediaId}`;

/**
 * Uploads images as soon as they are chosen and previews them. The record only references an image once the form
 * is saved; replaced or removed images are deleted from storage by the server at that point.
 */
export function ImageUploader({ value, onChange, max = 1, label = "Images", hint }: ImageUploaderProps) {
  const id = useId();
  const toast = useToast();
  const [uploading, setUploading] = useState<{ name: string; preview: string }[]>([]);
  const full = value.length + uploading.length >= max;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = Array.from(files).slice(0, max - value.length);
    for (const file of chosen) {
      const isAllowedType =
        file.type.startsWith("image/") ||
        (IMAGE_TYPES as readonly string[]).includes(file.type) ||
        /\.(jpe?g|png|webp|avif|gif|svg|bmp|tiff?|ico|heic|heif)$/i.test(file.name);

      if (!isAllowedType) {
        toast.error(`${file.name}: please upload a valid image file.`);
        continue;
      }
      if (file.size > IMAGE_MAX_BYTES) {
        toast.error(`${file.name}: images must be 4 MB or smaller.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      setUploading((u) => [...u, { name: file.name, preview }]);
      const form = new FormData();
      form.append("file", file);
      const result = await adminRequest<{ mediaId: string }>("/api/admin/media", { form });
      setUploading((u) => u.filter((x) => x.preview !== preview));
      URL.revokeObjectURL(preview);
      if (result.ok && result.data) {
        value = [...value, { mediaId: result.data.mediaId, alt: "" }];
        onChange(value);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">
        {label} <span className="font-normal text-muted">(optional{max > 1 ? `, up to ${max}` : ""})</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AnimatePresence initial={false}>
          {value.map((img, i) => (
            <motion.div
              key={img.mediaId}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <div className="relative aspect-[4/3] bg-ivory">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a freshly uploaded file */}
                <img src={src(img.mediaId)} alt={img.alt || "Uploaded image"} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label="Remove image"
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest/80 text-ivory hover:bg-forest"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
              <input
                value={img.alt ?? ""}
                onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, alt: e.target.value.slice(0, 160) } : v)))}
                placeholder="Alt text (describe the image)"
                aria-label="Image alt text"
                className="w-full border-t border-line px-3 py-2 text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold/40"
              />
            </motion.div>
          ))}
          {uploading.map((u) => (
            <div key={u.preview} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object-URL preview */}
              <img src={u.preview} alt="" className="h-full w-full object-cover opacity-50" />
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 aria-label={`Uploading ${u.name}`} className="h-6 w-6 animate-spin text-forest" />
              </span>
            </div>
          ))}
        </AnimatePresence>
        {!full ? (
          <label
            htmlFor={id}
            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-ivory/50 text-sm text-muted transition-colors hover:border-gold hover:text-forest focus-within:border-gold"
          >
            <ImagePlus aria-hidden className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
            <span>{value.length ? "Add image" : "Upload image"}</span>
            <input
              id={id}
              type="file"
              accept="image/*"
              multiple={max > 1}
              className="sr-only"
              onChange={(e) => {
                void onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted">{hint ?? "All image formats supported (JPEG, PNG, WebP, AVIF, SVG, etc.), up to 4 MB each."}</p>
    </div>
  );
}
