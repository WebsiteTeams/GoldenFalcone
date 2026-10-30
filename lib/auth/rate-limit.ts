import "server-only";
import { createHash } from "crypto";
import { LoginAttempt } from "@/models/LoginAttempt";

const WINDOW_MS = 15 * 60 * 1000;

export type LimitKey = { key: string; limit: number };

// Identifiers (emails, IPs) are hashed so the counters collection holds no personal data.
const hash = (key: string) => createHash("sha256").update(key).digest("hex");

/** True when any of the keys has reached its failure limit within the current window. */
export async function isLoginBlocked(keys: LimitKey[]) {
  const docs = await LoginAttempt.find({ key: { $in: keys.map((k) => hash(k.key)) }, expiresAt: { $gt: new Date() } }).lean();
  return keys.some((k) => (docs.find((d) => d.key === hash(k.key))?.count ?? 0) >= k.limit);
}

export async function recordLoginFailure(keys: LimitKey[]) {
  const expiresAt = new Date(Date.now() + WINDOW_MS);
  await Promise.all(
    keys.map((k) =>
      LoginAttempt.updateOne({ key: hash(k.key) }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true }),
    ),
  );
}

export async function clearLoginFailures(key: string) {
  await LoginAttempt.deleteOne({ key: hash(key) });
}
