import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { imageSchema, publishableFields, seoSchema } from "./shared";

const spiceProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ...publishableFields,
    category: {
      type: Schema.Types.Mixed,
      required: [true, "Category is required"],
      ref: "SpiceCategory",
      validate: {
        validator: async function (v: unknown) {
          if (!v) return false;
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
    highlights: { type: [String], default: [] },
    minimumOrderQuantity: { type: Number, min: 0, default: null },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

spiceProductSchema.index({ status: 1, order: 1, createdAt: -1 });
spiceProductSchema.index({ category: 1 });

export type SpiceProductDoc = InferSchemaType<typeof spiceProductSchema>;

export const SpiceProduct: Model<SpiceProductDoc> =
  (mongoose.models.SpiceProduct as Model<SpiceProductDoc>) ||
  mongoose.model<SpiceProductDoc>("SpiceProduct", spiceProductSchema);
