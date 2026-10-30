import "server-only";
import { defaultContent, defaultSettings } from "@/lib/cms/defaults";
import { connectToDatabase } from "@/lib/mongodb";
import { SiteContent } from "@/models/SiteContent";
import { SiteSettings } from "@/models/SiteSettings";
import { toPlain } from "./api";
import { settingsSchema, siteContentSchema, type Settings, type SiteContent as Content } from "./schemas";

export type ContentState = {
  draft: Content;
  published: Content;
  isPublished: boolean;
  hasUnpublishedChanges: boolean;
  draftUpdatedAt?: string;
  publishedAt?: string;
  publishedBy?: string;
};

/** Draft and published website copy for the editor (built-in defaults until something is saved). */
export async function getContentState(): Promise<ContentState> {
  await connectToDatabase();
  const doc = await SiteContent.findOne({ key: "main" }).lean();
  const published = siteContentSchema.safeParse(doc?.published);
  const draft = siteContentSchema.safeParse(doc?.draft);
  const live = published.success ? published.data : defaultContent;
  return toPlain({
    draft: draft.success ? draft.data : live,
    published: live,
    isPublished: published.success,
    hasUnpublishedChanges: Boolean(doc?.draftUpdatedAt && (!doc.publishedAt || doc.draftUpdatedAt > doc.publishedAt)),
    draftUpdatedAt: doc?.draftUpdatedAt,
    publishedAt: doc?.publishedAt,
    publishedBy: doc?.publishedBy,
  });
}

export async function getStoredSettings(): Promise<Settings> {
  await connectToDatabase();
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  const parsed = settingsSchema.safeParse(doc?.values);
  return toPlain(parsed.success ? parsed.data : defaultSettings);
}
