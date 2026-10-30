import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { adminRoles } from "@/lib/admin/constants";

// Admins are created only via `npm run admin:create` — there is no public registration endpoint.
const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 160 },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: adminRoles, default: "admin" },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof adminSchema>;

export const Admin: Model<AdminDoc> =
  (mongoose.models.Admin as Model<AdminDoc>) || mongoose.model<AdminDoc>("Admin", adminSchema);
