import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import {
  availabilityValues,
  licenceTypeValues,
  softwareCategoryValues,
  softwarePlatformValues,
  tradingMarketValues,
} from "@/lib/admin/constants";
import { imageSchema, publishableFields, seoSchema } from "./shared";

/** One purchasable licence. `_id` is the id orders refer to, so it stays stable across edits. */
const licenceOptionSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  licenceType: { type: String, required: true, enum: licenceTypeValues },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, maxlength: 300, default: "" },
  active: { type: Boolean, default: true },
});

const faqSchema = new Schema(
  { question: { type: String, required: true, maxlength: 200 }, answer: { type: String, required: true, maxlength: 1500 } },
  { _id: false },
);

const tradingSoftwareSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ...publishableFields,
    category: { type: String, required: true, enum: softwareCategoryValues },
    markets: { type: [{ type: String, enum: tradingMarketValues }], default: [] },
    shortDescription: { type: String, required: true, trim: true, maxlength: 400 },
    description: { type: String, maxlength: 6000, default: "" },
    thumbnail: { type: imageSchema, default: null },
    screenshots: {
      type: [imageSchema],
      default: [],
      validate: [(v: unknown[]) => v.length <= 8, "A product can have at most eight screenshots"],
    },
    demoVideo: { type: String, maxlength: 300, default: "" },
    features: { type: [String], default: [] },
    supportedPlatforms: { type: [{ type: String, enum: softwarePlatformValues }], default: [] },
    systemRequirements: { type: String, maxlength: 2000, default: "" },
    installationNotes: { type: String, maxlength: 3000, default: "" },
    supportInfo: { type: String, maxlength: 1500, default: "" },
    licenceTerms: { type: String, maxlength: 3000, default: "" },
    faqs: { type: [faqSchema], default: [] },
    licenceOptions: { type: [licenceOptionSchema], default: [] },
    currency: { type: String, maxlength: 8, default: "INR" },
    // Lowest active licence price, kept in sync on save so listings can filter and sort on it. Checkout always reads the licence.
    startingPrice: { type: Number, min: 0, default: null },
    availability: { type: String, enum: availabilityValues, default: "available" },
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, min: 0, max: 9999, default: 0 },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

tradingSoftwareSchema.index({ status: 1, category: 1, order: 1 });
tradingSoftwareSchema.index({ status: 1, featured: 1, featuredOrder: 1 });
tradingSoftwareSchema.index({ status: 1, startingPrice: 1 });
tradingSoftwareSchema.index({ "licenceOptions._id": 1 });

export type TradingSoftwareDoc = InferSchemaType<typeof tradingSoftwareSchema>;

export const TradingSoftware: Model<TradingSoftwareDoc> =
  (mongoose.models.TradingSoftware as Model<TradingSoftwareDoc>) ||
  mongoose.model<TradingSoftwareDoc>("TradingSoftware", tradingSoftwareSchema);
