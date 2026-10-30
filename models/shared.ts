import { Schema } from "mongoose";
import { publishStatuses } from "@/lib/admin/constants";

/** Private admin notes. `select: false` on the parent field keeps them out of every query unless explicitly requested. */
export const noteSchema = new Schema(
  {
    body: { type: String, required: true, maxlength: 2000 },
    authorId: { type: Schema.Types.ObjectId, ref: "Admin" },
    authorName: { type: String, maxlength: 80 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const imageSchema = new Schema(
  {
    mediaId: { type: String, required: true, trim: true, maxlength: 500 },
    alt: { type: String, maxlength: 160, default: "" },
  },
  { _id: false },
);

export const seoSchema = new Schema(
  {
    title: { type: String, maxlength: 70, default: "" },
    description: { type: String, maxlength: 170, default: "" },
  },
  { _id: false },
);

/** Fields shared by every publishable catalogue model. */
export const publishableFields = {
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
  status: { type: String, enum: publishStatuses, default: "draft", index: true },
  order: { type: Number, default: 0, min: 0, max: 9999 },
} as const;
