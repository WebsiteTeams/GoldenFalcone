import { itemRoute } from "@/lib/admin/handlers";
import { resources } from "@/lib/admin/resources";

export const runtime = "nodejs";

export const { GET, PATCH, DELETE } = itemRoute(resources["digital-services"]);
