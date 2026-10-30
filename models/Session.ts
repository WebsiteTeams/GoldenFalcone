import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** Server-side session record. The browser only holds an encrypted reference, so deleting a row revokes access. */
const sessionSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    userAgent: { type: String, maxlength: 300 },
    ip: { type: String, maxlength: 64 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDoc = InferSchemaType<typeof sessionSchema>;

export const Session: Model<SessionDoc> =
  (mongoose.models.Session as Model<SessionDoc>) || mongoose.model<SessionDoc>("Session", sessionSchema);
