import mongoose, { Schema, type Model } from "mongoose";
import type { Settings } from "@/lib/admin/schemas";

/** Business settings (validated with `settingsSchema`). Secrets never live here — only in environment variables. */
type SiteSettingsDoc = { key: string; values: Settings };

const siteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    values: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export const SiteSettings: Model<SiteSettingsDoc> =
  (mongoose.models.SiteSettings as Model<SiteSettingsDoc>) || mongoose.model<SiteSettingsDoc>("SiteSettings", siteSettingsSchema);
