"use client";

import { useId, useState } from "react";
import { ExternalLink, FileCheck2, Loader2, Upload, X } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { LAB_REPORT_MAX_BYTES, LAB_REPORT_TYPES } from "@/lib/admin/constants";
import type { LabReportValue } from "@/lib/admin/schemas";
import { useToast } from "../ToastNotification";

type LabReportUploaderProps = {
  label: string;
  value: LabReportValue | null | undefined;
  onChange: (report: LabReportValue | null) => void;
  error?: string;
};

const sizeLabel = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Uploads one quality's lab report. The server checks the file's real contents; these checks only give quicker feedback. */
export function LabReportUploader({ label, value, onChange, error }: LabReportUploaderProps) {
  const id = useId();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!(LAB_REPORT_TYPES as readonly string[]).includes(file.type)) {
      toast.error(`${file.name}: lab reports must be a PDF, JPEG, PNG or WebP file.`);
      return;
    }
    if (file.size > LAB_REPORT_MAX_BYTES) {
      toast.error(`${file.name}: lab reports must be 8 MB or smaller.`);
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const result = await adminRequest<LabReportValue>("/api/admin/lab-reports", { form });
    setUploading(false);
    if (result.ok && result.data) onChange(result.data);
    else toast.error(result.message);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ivory/50 px-4 py-3">
          <FileCheck2 aria-hidden className="h-5 w-5 shrink-0 text-emerald" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{value.fileName}</p>
            <p className="text-xs text-muted">{sizeLabel(value.size)}</p>
          </div>
          <a
            href={`/api/admin/lab-reports/${value.fileId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-gold-dark"
          >
            Preview <ExternalLink aria-hidden className="h-3.5 w-3.5" />
          </a>
          <label htmlFor={id} className="cursor-pointer text-sm font-medium text-forest hover:text-gold-dark focus-within:text-gold-dark">
            Replace
          </label>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-red-800"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-ivory/50 px-4 py-4 text-sm transition-colors hover:border-gold hover:text-forest focus-within:border-gold ${
            error ? "border-red-400 text-red-800" : "border-line text-muted"
          }`}
        >
          {uploading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Upload aria-hidden className="h-4 w-4 text-gold-dark" />}
          {uploading ? "Uploading…" : "Upload lab report"}
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={uploading}
        aria-label={value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <p className={error ? "mt-1.5 text-xs font-medium text-red-800" : "mt-1.5 text-xs text-muted"} role={error ? "alert" : undefined}>
        {error ?? "PDF, JPEG, PNG or WebP, up to 8 MB. Replacing or removing a report takes effect when the product is saved."}
      </p>
    </div>
  );
}
