import "server-only";
import type { CurrentAdmin } from "@/lib/auth/session";
import { ActivityLog } from "@/models/ActivityLog";

/** Records an administrator action. Logging failures never block the action itself. */
export async function logActivity(
  admin: Pick<CurrentAdmin, "id" | "name">,
  action: string,
  entity: string,
  entityId?: string,
  summary?: string,
) {
  try {
    await ActivityLog.create({ admin: admin.id, adminName: admin.name, action, entity, entityId, summary: summary?.slice(0, 300) });
  } catch (error) {
    console.error("[activity] failed to record", error);
  }
}
