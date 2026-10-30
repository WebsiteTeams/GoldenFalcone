import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const activityLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "Admin" },
    adminName: { type: String, maxlength: 80 },
    action: { type: String, required: true, maxlength: 40 },
    entity: { type: String, required: true, maxlength: 40 },
    entityId: { type: String, maxlength: 40 },
    summary: { type: String, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Activity is kept for one year.
activityLogSchema.index({ createdAt: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export type ActivityLogDoc = InferSchemaType<typeof activityLogSchema>;

export const ActivityLog: Model<ActivityLogDoc> =
  (mongoose.models.ActivityLog as Model<ActivityLogDoc>) || mongoose.model<ActivityLogDoc>("ActivityLog", activityLogSchema);
