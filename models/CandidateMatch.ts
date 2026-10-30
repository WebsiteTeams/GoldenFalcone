import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const candidateMatchSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "CandidateApplication", required: true, index: true },
    staffingRequestId: { type: Schema.Types.ObjectId, ref: "StaffingRequest", required: true, index: true },
    matchNotes: { type: String, maxlength: 2000 },
    applicationStatus: {
      type: String,
      enum: ["suggested", "reviewed", "shortlisted", "introduced", "selected", "not-selected"],
      default: "suggested",
    },
    adminNotes: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);

// Prevent duplicate matches
candidateMatchSchema.index({ candidateId: 1, staffingRequestId: 1 }, { unique: true });

export type CandidateMatchDoc = InferSchemaType<typeof candidateMatchSchema>;

export const CandidateMatch: Model<CandidateMatchDoc> =
  (mongoose.models.CandidateMatch as Model<CandidateMatchDoc>) ||
  mongoose.model<CandidateMatchDoc>("CandidateMatch", candidateMatchSchema);

