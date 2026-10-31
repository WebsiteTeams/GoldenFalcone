import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { digitalEnquiryStatuses, digitalIndustries, digitalProjectTypes } from "@/lib/admin/constants";
import { noteSchema } from "./shared";

const contactHistorySchema = new Schema(
  {
    channel: { type: String, enum: ["call", "whatsapp", "email", "meeting"], required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String, maxlength: 1000 },
    contactedBy: { type: String, maxlength: 100 },
  },
  { _id: false },
);

const digitalEnquirySchema = new Schema(
  {
    referenceNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // Step 1: Contact details
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    companyName: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },
    whatsapp: { type: String, trim: true, maxlength: 20 },
    location: { type: String, trim: true, maxlength: 120 },

    // Step 2: Project information
    projectType: { type: String, required: true, enum: digitalProjectTypes },
    projectName: { type: String, trim: true, maxlength: 120 },
    industry: { type: String, required: true, enum: digitalIndustries },

    // Step 3: Requirements
    projectDescription: { type: String, required: true, maxlength: 4000 },
    problemToSolve: { type: String, maxlength: 2000 },
    requiredFeatures: { type: String, maxlength: 2000 },
    targetUsers: { type: String, maxlength: 1000 },
    referenceUrls: { type: String, maxlength: 1000 },
    existingWebsite: { type: String, maxlength: 300 },

    // Step 4: Project planning
    estimatedBudget: { type: String, maxlength: 100 },
    expectedTimeline: { type: String, maxlength: 100 },
    preferredContactMethod: { type: String, enum: ["Email", "Phone", "WhatsApp", "Any"], default: "Any" },
    additionalNotes: { type: String, maxlength: 2000 },

    // Management & workflow
    status: { type: String, enum: digitalEnquiryStatuses, default: "new", index: true },
    assignedTo: {
      adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
      adminName: { type: String, maxlength: 100 },
    },
    followUpDate: { type: Date },
    contactHistory: { type: [contactHistorySchema], default: [] },
    internalNotes: { type: [noteSchema], default: [], select: false },

    consent: { type: Boolean, required: true },
    source: { type: String, maxlength: 200 },
  },
  { timestamps: true },
);

digitalEnquirySchema.index({ status: 1, createdAt: -1 });
digitalEnquirySchema.index({ email: 1 });
digitalEnquirySchema.index({ projectType: 1, industry: 1 });

export type DigitalEnquiryDoc = InferSchemaType<typeof digitalEnquirySchema>;

export const DigitalEnquiry: Model<DigitalEnquiryDoc> =
  (mongoose.models.DigitalEnquiry as Model<DigitalEnquiryDoc>) ||
  mongoose.model<DigitalEnquiryDoc>("DigitalEnquiry", digitalEnquirySchema);

