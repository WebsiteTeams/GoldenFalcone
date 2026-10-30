import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { enquiryStatuses } from "@/lib/admin/constants";
import { serviceTypes } from "@/lib/validations";
import { noteSchema } from "./shared";

const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 20 },
    company: { type: String, trim: true, maxlength: 120 },
    country: { type: String, trim: true, maxlength: 80 },
    serviceType: { type: String, required: true, enum: serviceTypes },
    details: {
      product: { type: String, maxlength: 80 },
      quantity: { type: String, maxlength: 80 },
      experienceLevel: { type: String, maxlength: 60 },
      projectType: { type: String, maxlength: 80 },
      budget: { type: String, maxlength: 60 },
      timeline: { type: String, maxlength: 60 },
    },
    message: { type: String, required: true, maxlength: 3000 },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: enquiryStatuses, default: "new" },
    internalNotes: { type: [noteSchema], default: [], select: false },
    source: { type: String, maxlength: 200 },
  },
  { timestamps: true },
);

enquirySchema.index({ serviceType: 1, status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ createdAt: -1 });

export type EnquiryDoc = InferSchemaType<typeof enquirySchema>;

export const Enquiry: Model<EnquiryDoc> =
  (mongoose.models.Enquiry as Model<EnquiryDoc>) || mongoose.model<EnquiryDoc>("Enquiry", enquirySchema);
