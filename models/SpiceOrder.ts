import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { allOrderStatusValues, orderSources } from "@/lib/admin/constants";
import { noteSchema } from "./shared";

/** Snapshot of a single product at the time the order was placed. Later price or product edits never change it. */
const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "SpiceProduct" },
    variantId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true, maxlength: 100 },
    image: { type: String, default: "" },
    category: { type: String, maxlength: 40, default: "" },
    quality: { type: String, maxlength: 40, default: "" },
    qualityPercent: { type: Number, min: 0, max: 100, default: null },
    importArea: { type: String, maxlength: 200, default: "" },
    unit: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, max: 10000 },
    unitPrice: { type: Number, required: true, min: 0 },
    marketPrice: { type: Number, min: 0, default: null },
    currency: { type: String, default: "INR", maxlength: 8 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    phone: { type: String, required: true, maxlength: 30 },
    email: { type: String, maxlength: 160, default: "" },
    country: { type: String, maxlength: 80, default: "" },
    state: { type: String, maxlength: 80, default: "" },
    city: { type: String, maxlength: 80, default: "" },
    address: { type: String, maxlength: 500, default: "" },
    postalCode: { type: String, maxlength: 20, default: "" },
  },
  { _id: false },
);

const spiceOrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, maxlength: 30 },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v: unknown[]) => v.length > 0, "Order must have at least one item"],
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingAmount: { type: Number, default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", maxlength: 8 },
    notes: { type: String, maxlength: 2000, default: "" },
    source: { type: String, enum: orderSources, default: "website" },
    status: { type: String, enum: allOrderStatusValues, default: "pending" },
    whatsappOpenedAt: { type: Date, default: null },
    internalNotes: { type: [noteSchema], select: false, default: [] },
  },
  { timestamps: true },
);

spiceOrderSchema.index({ status: 1, createdAt: -1 });
spiceOrderSchema.index({ source: 1, createdAt: -1 });
spiceOrderSchema.index({ createdAt: -1 });
spiceOrderSchema.index({ "customer.phone": 1 });

export type SpiceOrderDoc = InferSchemaType<typeof spiceOrderSchema>;

export const SpiceOrder: Model<SpiceOrderDoc> =
  (mongoose.models.SpiceOrder as Model<SpiceOrderDoc>) ||
  mongoose.model<SpiceOrderDoc>("SpiceOrder", spiceOrderSchema);
