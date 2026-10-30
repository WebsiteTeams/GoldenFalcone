import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { staffingStatuses } from "@/lib/admin/constants";
import { salonRoles } from "@/lib/content";
import { noteSchema } from "./shared";

const staffingRequestSchema = new Schema(
  {
    // Business information
    salonName: { type: String, required: true, trim: true, maxlength: 120 },
    contactName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    whatsapp: { type: String, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    businessType: { type: String, trim: true, maxlength: 80 },
    websiteOrSocial: { type: String, trim: true, maxlength: 300 },

    // Staffing requirement
    professionalCategory: { type: String, required: true, enum: salonRoles },
    quantity: { type: Number, required: true, min: 1, max: 100 },
    requiredSkills: { type: String, maxlength: 1000 },
    experienceRequired: { type: String, maxlength: 60 },
    employmentType: { type: String, maxlength: 60 },
    salaryRange: { type: String, maxlength: 120 },
    preferredJoiningDate: { type: String, maxlength: 80 },
    jobDescription: { type: String, maxlength: 3000 },

    // Meta
    referenceNumber: { type: String, trim: true, maxlength: 30, index: true },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: staffingStatuses, default: "new" },
    internalNotes: { type: [noteSchema], default: [], select: false },
  },
  { timestamps: true },
);

staffingRequestSchema.index({ status: 1, createdAt: -1 });
staffingRequestSchema.index({ professionalCategory: 1, location: 1 });

export type StaffingRequestDoc = InferSchemaType<typeof staffingRequestSchema>;

export const StaffingRequest: Model<StaffingRequestDoc> =
  (mongoose.models.StaffingRequest as Model<StaffingRequestDoc>) ||
  mongoose.model<StaffingRequestDoc>("StaffingRequest", staffingRequestSchema);
