import { notesRoute } from "@/lib/admin/handlers";
import { resources } from "@/lib/admin/resources";

export const runtime = "nodejs";

export const { POST } = notesRoute(resources.staffing);
