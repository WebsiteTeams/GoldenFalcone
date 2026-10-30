import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { deleteMedia } from "@/lib/media";
import { deleteCv, deleteFiles } from "@/lib/storage";
import { logActivity } from "./activity";
import { authorize, dbError, invalid, isObjectId, notFound, readJson, respond, toPlain } from "./api";
import { listQuerySchema, noteSchema, toSlug } from "./schemas";
import { getRecord, listRecords, resources, type CatalogueResource, type Resource } from "./resources";

/* eslint-disable @typescript-eslint/no-explicit-any -- generic over every resource model */

type Ctx = { params: Promise<{ id: string }> };

const queryFrom = (request: Request) =>
  listQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

function refreshPublic(res: Resource) {
  if (res.kind !== "catalogue") return;
  revalidateTag(res.revalidate.tag);
  for (const path of res.revalidate.paths) revalidatePath(path);
}

/** Generates a unique slug, appending -2, -3… when needed. */
async function uniqueSlug(res: CatalogueResource, base: string, excludeId?: string) {
  const root = toSlug(base) || res.key;
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const clash = await res.model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

const withoutUndefined = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

/** GET (list) and POST (create, catalogue only) for /api/admin/<resource>. */
export function collectionRoute(res: Resource) {
  return {
    async GET(request: Request) {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      try {
        return respond(200, { ok: true, data: await listRecords(res, queryFrom(request)) });
      } catch (error) {
        return dbError(error, `admin:${res.key}:list`);
      }
    },

    async POST(request: Request) {
      if (res.kind !== "catalogue") return respond(405, { ok: false, message: "Method not allowed." });
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const json = await readJson(request);
      if ("response" in json) return json.response;
      const parsed = res.schema.safeParse(json.body);
      if (!parsed.success) return invalid(parsed.error);

      try {
        await connectToDatabase();
        const data = parsed.data as Record<string, any>;
        data.slug = await uniqueSlug(res, data.slug || data[res.slugSource]);
        const doc = await res.model.create(data);
        await logActivity(auth.admin, "created", res.entity, String(doc._id), res.label(data));
        refreshPublic(res);
        return respond(201, { ok: true, message: `${capital(res.entity)} created.`, data: toPlain(doc.toObject()) });
      } catch (error) {
        return dbError(error, `admin:${res.key}:create`);
      }
    },
  };
}

/** GET, PATCH and DELETE for /api/admin/<resource>/[id]. */
export function itemRoute(res: Resource) {
  return {
    async GET(request: Request, { params }: Ctx) {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { id } = await params;
      if (!isObjectId(id)) return notFound(capital(res.entity));
      try {
        const doc = await getRecord(res, id);
        return doc ? respond(200, { ok: true, data: doc }) : notFound(capital(res.entity));
      } catch (error) {
        return dbError(error, `admin:${res.key}:get`);
      }
    },

    async PATCH(request: Request, { params }: Ctx) {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { id } = await params;
      if (!isObjectId(id)) return notFound(capital(res.entity));
      const json = await readJson(request);
      if ("response" in json) return json.response;

      // Partial updates allow quick actions (e.g. publish / status change) as well as full edits.
      const schema = res.kind === "catalogue" ? res.schema.partial() : res.updateSchema;
      const parsed = schema.safeParse(json.body);
      if (!parsed.success) return invalid(parsed.error);
      const data = withoutUndefined(parsed.data as Record<string, unknown>);
      if (!Object.keys(data).length) return respond(400, { ok: false, message: "Nothing to update." });

      try {
        await connectToDatabase();
        const before = await res.model.findById(id).lean<Record<string, any>>();
        if (!before) return notFound(capital(res.entity));

        if (res.kind === "catalogue" && "slug" in data) {
          data.slug = await uniqueSlug(res, (data.slug as string) || (data[res.slugSource] as string) || before[res.slugSource], id);
        }
        const after = await res.model
          .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
          .select(res.hidden ?? "")
          .lean<Record<string, any>>();

        if (res.kind === "catalogue") {
          const kept = new Set(res.mediaIds(after ?? {}));
          await deleteMedia(res.mediaIds(before).filter((m) => !kept.has(m)));
          refreshPublic(res);
        }

        const action = Object.keys(data).length === 1 && "status" in data ? `marked ${data.status}` : "updated";
        await logActivity(auth.admin, action, res.entity, id, res.label(after ?? before));
        return respond(200, { ok: true, message: "Changes saved.", data: toPlain(after) });
      } catch (error) {
        return dbError(error, `admin:${res.key}:update`);
      }
    },

    async DELETE(request: Request, { params }: Ctx) {
      // Deleting records is restricted to full administrators.
      const auth = await authorize(request, "admin");
      if (auth.response) return auth.response;
      const { id } = await params;
      if (!isObjectId(id)) return notFound(capital(res.entity));

      try {
        await connectToDatabase();
        const doc = await res.model.findByIdAndDelete(id).lean<Record<string, any>>();
        if (!doc) return notFound(capital(res.entity));
        if (res.kind === "catalogue") {
          await deleteMedia(res.mediaIds(doc));
          refreshPublic(res);
        }
        if (res.key === resources.candidates.key) {
          if (doc.cv?.storageKey) await deleteCv(doc.cv.storageKey);
          const fileKeys = [
            ...(doc.certificates ?? []).map((f: Record<string, any>) => f.storageKey),
            ...(doc.trainingCertificates ?? []).map((f: Record<string, any>) => f.storageKey),
            ...(doc.portfolioImages ?? []).map((f: Record<string, any>) => f.storageKey),
          ];
          if (fileKeys.length) await deleteFiles(fileKeys);
        }
        await logActivity(auth.admin, "deleted", res.entity, id, res.label(doc));
        return respond(200, { ok: true, message: `${capital(res.entity)} deleted.` });
      } catch (error) {
        return dbError(error, `admin:${res.key}:delete`);
      }
    },
  };
}

/** POST /api/admin/<resource>/[id]/notes — appends a private internal note. */
export function notesRoute(res: Resource) {
  return {
    async POST(request: Request, { params }: Ctx) {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { id } = await params;
      if (!isObjectId(id)) return notFound(capital(res.entity));
      const json = await readJson(request);
      if ("response" in json) return json.response;
      const parsed = noteSchema.safeParse(json.body);
      if (!parsed.success) return invalid(parsed.error);

      try {
        await connectToDatabase();
        const note = { body: parsed.data.body, authorId: auth.admin.id, authorName: auth.admin.name };
        const updated = await res.model
          .findByIdAndUpdate(id, { $push: { internalNotes: note } }, { new: true })
          .select("+internalNotes")
          .lean<Record<string, any>>();
        if (!updated) return notFound(capital(res.entity));
        await logActivity(auth.admin, "added a note to", res.entity, id, res.label(updated));
        return respond(201, { ok: true, message: "Note added.", data: toPlain(updated.internalNotes) });
      } catch (error) {
        return dbError(error, `admin:${res.key}:note`);
      }
    },
  };
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
