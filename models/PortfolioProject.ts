import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { imageSchema, publishableFields } from "./shared";

const portfolioProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    ...publishableFields,
    category: { type: String, maxlength: 80, default: "" },
    description: { type: String, maxlength: 600, default: "" },
    image: { type: imageSchema, default: null },
    projectUrl: { type: String, maxlength: 300, default: "" },
    // Concept pieces are labelled as such on the public site so they are never mistaken for client work.
    isConcept: { type: Boolean, default: true },
  },
  { timestamps: true },
);

portfolioProjectSchema.index({ status: 1, order: 1, createdAt: -1 });

export type PortfolioProjectDoc = InferSchemaType<typeof portfolioProjectSchema>;

export const PortfolioProject: Model<PortfolioProjectDoc> =
  (mongoose.models.PortfolioProject as Model<PortfolioProjectDoc>) ||
  mongoose.model<PortfolioProjectDoc>("PortfolioProject", portfolioProjectSchema);
