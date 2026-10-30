import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { publishableFields, seoSchema } from "./shared";

const mentorshipProgramSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    ...publishableFields,
    description: { type: String, required: true, maxlength: 2000 },
    topics: { type: [String], default: [] },
    format: { type: String, maxlength: 120, default: "" },
    duration: { type: String, maxlength: 80, default: "" },
    availability: { type: String, maxlength: 120, default: "" },
    ctaLabel: { type: String, maxlength: 40, default: "" },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true },
);

mentorshipProgramSchema.index({ status: 1, order: 1, createdAt: -1 });

export type MentorshipProgramDoc = InferSchemaType<typeof mentorshipProgramSchema>;

export const MentorshipProgram: Model<MentorshipProgramDoc> =
  (mongoose.models.MentorshipProgram as Model<MentorshipProgramDoc>) ||
  mongoose.model<MentorshipProgramDoc>("MentorshipProgram", mentorshipProgramSchema);
