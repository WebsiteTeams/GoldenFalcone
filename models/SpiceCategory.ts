import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { imageSchema, publishableFields } from "./shared";

const spiceCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ...publishableFields,
    image: { type: imageSchema, required: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

spiceCategorySchema.index({ status: 1, order: 1, createdAt: -1 });

export type SpiceCategoryDoc = InferSchemaType<typeof spiceCategorySchema>;

export const SpiceCategory: Model<SpiceCategoryDoc> =
  (mongoose.models.SpiceCategory as Model<SpiceCategoryDoc>) ||
  mongoose.model<SpiceCategoryDoc>("SpiceCategory", spiceCategorySchema);
