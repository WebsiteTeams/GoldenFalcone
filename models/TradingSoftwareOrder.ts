import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { allOrderStatusValues, deliveryMethodValues, deliveryStatuses, paymentStatuses } from "@/lib/admin/constants";
import { noteSchema } from "./shared";

/** Snapshot of the product and licence at the time of the request. Later edits never change it. */
const itemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "TradingSoftware" },
    licenceId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true, maxlength: 100 },
    category: { type: String, maxlength: 60, default: "" },
    licenceName: { type: String, required: true, maxlength: 80 },
    licenceType: { type: String, maxlength: 20, default: "" },
    quantity: { type: Number, required: true, min: 1, max: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", maxlength: 8 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 160 },
    phone: { type: String, required: true, maxlength: 30 },
    company: { type: String, maxlength: 120, default: "" },
    country: { type: String, maxlength: 80, default: "" },
  },
  { _id: false },
);

const tradingSoftwareOrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, maxlength: 30 },
    customer: { type: customerSchema, required: true },
    items: { type: [itemSchema], required: true, validate: [(v: unknown[]) => v.length > 0, "Order must have at least one item"] },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", maxlength: 8 },
    notes: { type: String, maxlength: 2000, default: "" },
    // The order stays "pending" until an admin confirms it. No payment is taken on the website.
    status: { type: String, enum: allOrderStatusValues, default: "pending" },
    paymentStatus: { type: String, enum: paymentStatuses, default: "unpaid" },
    deliveryMethod: { type: String, enum: [...deliveryMethodValues, ""], default: "" },
    deliveryStatus: { type: String, enum: deliveryStatuses, default: "pending" },
    // Recorded by an admin and shared with the customer directly. Never exposed by a public route.
    licenceKey: { type: String, maxlength: 500, default: "" },
    activationInstructions: { type: String, maxlength: 3000, default: "" },
    downloadUrl: { type: String, maxlength: 500, default: "" },
    deliveredAt: { type: Date, default: null },
    whatsappOpenedAt: { type: Date, default: null },
    internalNotes: { type: [noteSchema], select: false, default: [] },
  },
  { timestamps: true },
);

tradingSoftwareOrderSchema.index({ status: 1, createdAt: -1 });
tradingSoftwareOrderSchema.index({ deliveryStatus: 1, createdAt: -1 });
tradingSoftwareOrderSchema.index({ "customer.email": 1 });
tradingSoftwareOrderSchema.index({ createdAt: -1 });

export type TradingSoftwareOrderDoc = InferSchemaType<typeof tradingSoftwareOrderSchema>;

export const TradingSoftwareOrder: Model<TradingSoftwareOrderDoc> =
  (mongoose.models.TradingSoftwareOrder as Model<TradingSoftwareOrderDoc>) ||
  mongoose.model<TradingSoftwareOrderDoc>("TradingSoftwareOrder", tradingSoftwareOrderSchema);
