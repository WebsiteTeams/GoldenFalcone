import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { LAB_REPORT_TYPES, productTypes, qualityLevels } from "@/lib/admin/constants";
import { imageSchema, publishableFields, seoSchema } from "./shared";

const labReportSchema = new Schema(
  {
    fileId: { type: String, required: true, maxlength: 24 },
    fileName: { type: String, required: true, maxlength: 200 },
    contentType: { type: String, required: true, enum: LAB_REPORT_TYPES },
    size: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

/** One purchasable quality of a product. `_id` is the variant id that carts and orders refer to. */
const qualityVariantSchema = new Schema({
  level: { type: String, required: true, enum: qualityLevels },
  qualityPercent: { type: Number, required: true, min: 0, max: 100, default: 0 },
  marketPrice: { type: Number, required: true, min: 0, default: 0 },
  sellingPrice: { type: Number, required: true, min: 0, default: 0 },
  importArea: { type: String, trim: true, maxlength: 200, default: "" },
  specifications: { type: String, maxlength: 1000, default: "" },
  labReport: { type: labReportSchema, default: null },
  active: { type: Boolean, default: true },
});

const spiceProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ...publishableFields,
    // Null only on products created before the Powder / Solid catalogue.
    productType: { type: String, enum: [...productTypes, null], default: null },
    // Optional admin-managed collection, separate from Powder / Solid.
    category: {
      type: Schema.Types.Mixed,
      default: null,
      ref: "SpiceCategory",
      validate: {
        validator: async function (v: unknown) {
          if (!v) return true;
          const SpiceCategoryModel = mongoose.models.SpiceCategory;
          if (!SpiceCategoryModel) return true;
          const strVal = String(v);
          if (/^[a-f0-9]{24}$/i.test(strVal)) {
            const exists = await SpiceCategoryModel.exists({ _id: strVal });
            return Boolean(exists);
          }
          const existsBySlug = await SpiceCategoryModel.exists({ slug: strVal });
          return Boolean(existsBySlug);
        },
        message: "The assigned category does not exist.",
      },
    },
    images: {
      type: [imageSchema],
      default: [],
      validate: [
        (v: unknown[]) => v.length <= 4,
        "A spice product can have at most four images",
      ],
    },
    variants: {
      type: [qualityVariantSchema],
      default: [],
      validate: [
        (v: { level: string }[]) => v.length <= qualityLevels.length && new Set(v.map((x) => x.level)).size === v.length,
        "A product can have one variant per quality level",
      ],
    },
    // Homepage placement. The selected variant decides the quality and price the featured card shows.
    isFeatured: { type: Boolean, default: false },
    featuredOrder: { type: Number, min: 0, max: 9999, default: 0 },
    featuredVariantId: { type: Schema.Types.ObjectId, default: null },
    // Lowest active variant's prices, kept in sync on save. The variant is always the source of truth at checkout.
    marketPrice: { type: Number, required: true, min: 0, default: 0 },
    ourPrice: { type: Number, required: true, min: 0, default: 0 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 500 },
    // Technical & backward-compatibility fields (not shown on business CRUD)
    description: { type: String, maxlength: 2000, default: "" },
    sku: { type: String, trim: true, maxlength: 60, default: "" },
    currency: { type: String, maxlength: 8, default: "INR" },
    unit: { type: String, maxlength: 60, default: "" },
    availability: { type: String, default: "available" },
    packaging: { type: String, maxlength: 300, default: "" },
    origin: { type: String, maxlength: 300, default: "" },
    // Shown to customers as the product's benefits.
    highlights: { type: [String], default: [] },
    minimumOrderQuantity: { type: Number, min: 0, default: null },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

spiceProductSchema.index({ status: 1, order: 1, createdAt: -1 });
spiceProductSchema.index({ status: 1, productType: 1, order: 1 });
spiceProductSchema.index({ status: 1, productType: 1, isFeatured: 1, featuredOrder: 1 });
spiceProductSchema.index({ category: 1 });
spiceProductSchema.index({ "variants._id": 1 });

export type SpiceProductDoc = InferSchemaType<typeof spiceProductSchema>;

export const SpiceProduct: Model<SpiceProductDoc> =
  (mongoose.models.SpiceProduct as Model<SpiceProductDoc>) ||
  mongoose.model<SpiceProductDoc>("SpiceProduct", spiceProductSchema);
