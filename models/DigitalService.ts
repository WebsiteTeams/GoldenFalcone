import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { imageSchema, publishableFields, seoSchema } from "./shared";

const digitalServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    ...publishableFields,
    category: { type: String, maxlength: 60, default: "" },
    description: { type: String, required: true, maxlength: 1000 },
    image: { type: imageSchema, default: null },
    // Free text so it can carry a currency and qualifier. Leave blank to hide pricing on the site.
    startingPrice: { type: String, maxlength: 60, default: "" },
    features: { type: [String], default: [] },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

digitalServiceSchema.index({ status: 1, order: 1, createdAt: -1 });

export type DigitalServiceDoc = InferSchemaType<typeof digitalServiceSchema>;

export const DigitalService: Model<DigitalServiceDoc> =
  (mongoose.models.DigitalService as Model<DigitalServiceDoc>) ||
  mongoose.model<DigitalServiceDoc>("DigitalService", digitalServiceSchema);
