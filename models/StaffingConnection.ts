import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { communicationChannels, communicationParties, connectionStatuses, interviewStatuses } from "@/lib/admin/constants";

/**
 * A single candidate-to-hiring-requirement relationship.
 *
 * The connection is deliberately stored separately from both records: one candidate
 * may be considered for several salon requirements, and one requirement may have
 * several candidate matches. All coordination history lives on this record.
 *
 * The collection name is kept as `candidatematches` so existing matches created
 * before the workflow was expanded continue to load.
 */

const communicationSchema = new Schema(
  {
    channel: { type: String, enum: communicationChannels, required: true },
    party: { type: String, enum: communicationParties, required: true },
    contactedAt: { type: Date, required: true },
    outcome: { type: String, maxlength: 1000 },
    followUpAt: { type: Date },
    notes: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    createdByName: { type: String, maxlength: 80 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const statusChangeSchema = new Schema(
  {
    status: { type: String, enum: connectionStatuses, required: true },
    note: { type: String, maxlength: 500 },
    changedAt: { type: Date, default: Date.now },
    changedByName: { type: String, maxlength: 80 },
  },
  { _id: false },
);

const staffingConnectionSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "CandidateApplication", required: true, index: true },
    staffingRequestId: { type: Schema.Types.ObjectId, ref: "StaffingRequest", required: true, index: true },

    // Matching
    matchScore: { type: Number, min: 0, max: 100 },
    matchNotes: { type: String, maxlength: 3000 },
    adminNotes: { type: String, maxlength: 3000 },

    // Coordination milestones
    shortlistedAt: { type: Date },
    sharedWithSalonAt: { type: Date },
    salonFeedback: { type: String, maxlength: 3000 },
    interviewDate: { type: Date },
    interviewStatus: { type: String, enum: interviewStatuses, default: "not-scheduled" },
    candidateResponse: { type: String, maxlength: 1000 },
    finalOutcome: { type: String, maxlength: 2000 },

    // Current relationship status
    connectionStatus: { type: String, enum: connectionStatuses, default: "suggested", index: true },

    communications: { type: [communicationSchema], default: [] },
    statusHistory: { type: [statusChangeSchema], default: [] },

    /** Legacy field from the first matching implementation — read-only fallback. */
    applicationStatus: { type: String },
  },
  { timestamps: true },
);

// One connection per candidate/requirement pair.
staffingConnectionSchema.index({ candidateId: 1, staffingRequestId: 1 }, { unique: true });
staffingConnectionSchema.index({ staffingRequestId: 1, connectionStatus: 1 });
staffingConnectionSchema.index({ candidateId: 1, connectionStatus: 1 });
staffingConnectionSchema.index({ "communications.followUpAt": 1 });

export type StaffingConnectionDoc = InferSchemaType<typeof staffingConnectionSchema>;

export const StaffingConnection: Model<StaffingConnectionDoc> =
  (mongoose.models.StaffingConnection as Model<StaffingConnectionDoc>) ||
  mongoose.model<StaffingConnectionDoc>("StaffingConnection", staffingConnectionSchema, "candidatematches");
