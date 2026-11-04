import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { contactMethods, enquiryStatuses, tradingMarketValues } from "@/lib/admin/constants";
import { noteSchema } from "./shared";

const tradingSoftwareEnquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    company: { type: String, trim: true, maxlength: 120, default: "" },
    software: { type: Schema.Types.ObjectId, ref: "TradingSoftware", default: null },
    // Name at the time of the request, so the enquiry still reads correctly if the product is renamed or removed.
    softwareName: { type: String, trim: true, maxlength: 100, default: "" },
    tradingMarket: { type: String, enum: [...tradingMarketValues, ""], default: "" },
    message: { type: String, required: true, maxlength: 3000 },
    preferredContactMethod: { type: String, enum: contactMethods, default: "Email" },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: enquiryStatuses, default: "new" },
    internalNotes: { type: [noteSchema], default: [], select: false },
    source: { type: String, maxlength: 200 },
  },
  { timestamps: true },
);

tradingSoftwareEnquirySchema.index({ status: 1, createdAt: -1 });
tradingSoftwareEnquirySchema.index({ software: 1, createdAt: -1 });
tradingSoftwareEnquirySchema.index({ email: 1 });

export type TradingSoftwareEnquiryDoc = InferSchemaType<typeof tradingSoftwareEnquirySchema>;

export const TradingSoftwareEnquiry: Model<TradingSoftwareEnquiryDoc> =
  (mongoose.models.TradingSoftwareEnquiry as Model<TradingSoftwareEnquiryDoc>) ||
  mongoose.model<TradingSoftwareEnquiryDoc>("TradingSoftwareEnquiry", tradingSoftwareEnquirySchema);
