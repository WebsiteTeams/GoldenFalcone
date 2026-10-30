import mongoose, { Schema, type Model } from "mongoose";
import type { SiteContent as Content } from "@/lib/admin/schemas";

/**
 * Editable website copy. One document holds a working `draft` and the live `published` version;
 * both are validated with `siteContentSchema` before being written.
 */
type SiteContentDoc = {
  key: string;
  draft?: Content;
  published?: Content;
  draftUpdatedAt?: Date;
  publishedAt?: Date;
  publishedBy?: string;
};

const siteContentSchema = new Schema<SiteContentDoc>(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    draft: { type: Schema.Types.Mixed },
    published: { type: Schema.Types.Mixed },
    draftUpdatedAt: { type: Date },
    publishedAt: { type: Date },
    publishedBy: { type: String, maxlength: 80 },
  },
  { timestamps: true, minimize: false },
);

export const SiteContent: Model<SiteContentDoc> =
  (mongoose.models.SiteContent as Model<SiteContentDoc>) || mongoose.model<SiteContentDoc>("SiteContent", siteContentSchema);
