import { collectionRoute } from "@/lib/admin/handlers";
import { resources } from "@/lib/admin/resources";

export const runtime = "nodejs";

export const { GET } = collectionRoute(resources.orders);