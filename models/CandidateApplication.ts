import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { candidateStatuses } from "@/lib/admin/constants";
import { salonRoles } from "@/lib/content";
import { experienceOptions } from "@/lib/validations";
import { noteSchema } from "./shared";

/** Schema for a privately stored uploaded file (CV, certificate, portfolio image). */
const storedFileSchema = new Schema(
  {
    storageKey: { type: String, required: true },
    originalName: { type: String, maxlength: 200 },
    mimeType: { type: String, maxlength: 100 },
    size: { type: Number },
    label: { type: String, maxlength: 200 }, // e.g. original filename or certificate title
  },
  { _id: false },
);

const candidateApplicationSchema = new Schema(
  {
    // Personal
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    whatsapp: { type: String, trim: true, maxlength: 20 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    preferredWorkLocation: { type: String, trim: true, maxlength: 120 },
    profilePhoto: {
      storageKey: { type: String },
      originalName: { type: String, maxlength: 200 },
      mimeType: { type: String, maxlength: 100 },
      size: { type: Number },
    },

    // Professional
    professionalCategory: { type: String, required: true, enum: salonRoles },
    additionalSkills: { type: [String], default: [] },
    customSkills: { type: [String], default: [] },
    experience: { type: String, required: true, enum: experienceOptions },
    previousWorkplace: { type: String, trim: true, maxlength: 200 },
    previousJobRole: { type: String, trim: true, maxlength: 120 },
    about: { type: String, maxlength: 2000 },
    employmentPreference: { type: String, maxlength: 60 },
    expectedSalary: { type: String, maxlength: 120 },
    availability: { type: String, maxlength: 120 },

    // Documents — storage keys are never exposed via public URLs
    cv: {
      storageKey: { type: String },
      originalName: { type: String, maxlength: 200 },
      mimeType: { type: String, maxlength: 100 },
      size: { type: Number },
    },
    certificates: { type: [storedFileSchema], default: [], select: false },
    trainingCertificates: { type: [storedFileSchema], default: [], select: false },
    portfolioImages: { type: [storedFileSchema], default: [], select: false },

    consent: { type: Boolean, required: true },
    consentAt: { type: Date, required: true },
    referenceNumber: { type: String, trim: true, maxlength: 30 },
    status: { type: String, enum: candidateStatuses, default: "new" },
    internalNotes: { type: [noteSchema], default: [], select: false },
  },
  { timestamps: true },
);

candidateApplicationSchema.index({ professionalCategory: 1, location: 1, createdAt: -1 });
candidateApplicationSchema.index({ email: 1 });
candidateApplicationSchema.index({ phone: 1 });
candidateApplicationSchema.index({ status: 1 });
candidateApplicationSchema.index({ referenceNumber: 1 }, { unique: true, sparse: true });

export type CandidateApplicationDoc = InferSchemaType<typeof candidateApplicationSchema>;

export const CandidateApplication: Model<CandidateApplicationDoc> =
  (mongoose.models.CandidateApplication as Model<CandidateApplicationDoc>) ||
  mongoose.model<CandidateApplicationDoc>("CandidateApplication", candidateApplicationSchema);
