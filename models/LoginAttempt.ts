import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** Failed-login counters stored in MongoDB so brute-force limits hold across serverless instances. */
const loginAttemptSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type LoginAttemptDoc = InferSchemaType<typeof loginAttemptSchema>;

export const LoginAttempt: Model<LoginAttemptDoc> =
  (mongoose.models.LoginAttempt as Model<LoginAttemptDoc>) ||
  mongoose.model<LoginAttemptDoc>("LoginAttempt", loginAttemptSchema);
