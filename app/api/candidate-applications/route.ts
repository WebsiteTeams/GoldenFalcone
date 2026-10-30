import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { saveCertificate, saveCv, UploadError, type StoredFile } from "@/lib/storage";
import { candidateApplicationSchema, CERT_MAX_COUNT, IMG_MAX_COUNT } from "@/lib/validations";
import { CandidateApplication } from "@/models/CandidateApplication";

export const runtime = "nodejs";

/** Generates a short reference number: CA-YYYYMMDD-XXXX */
function generateRef() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CA-${d}-${r}`;
}

// Accepts multipart/form-data so CV and optional certificates can be attached.
export async function POST(request: Request) {
  const blocked = guardRequest(request, "candidate");
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const field = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value : undefined;
  };

  // Parse additionalSkills from JSON array string
  let additionalSkills: string[] = [];
  try {
    const raw = field("additionalSkills");
    if (raw) additionalSkills = JSON.parse(raw);
    if (!Array.isArray(additionalSkills)) additionalSkills = [];
  } catch {
    additionalSkills = [];
  }

  const parsed = candidateApplicationSchema.safeParse({
    fullName: field("fullName"),
    email: field("email"),
    phone: field("phone"),
    whatsapp: field("whatsapp") ?? "",
    location: field("location"),
    preferredWorkLocation: field("preferredWorkLocation") ?? "",
    professionalCategory: field("professionalCategory"),
    additionalSkills,
    customSkills: field("customSkills") ?? "",
    experience: field("experience"),
    previousWorkplace: field("previousWorkplace") ?? "",
    previousJobRole: field("previousJobRole") ?? "",
    about: field("about") ?? "",
    employmentPreference: field("employmentPreference") ?? "",
    expectedSalary: field("expectedSalary") ?? "",
    availability: field("availability") ?? "",
    consent: field("consent") === "true",
    website: field("website") ?? "",
    startedAt: Number(field("startedAt")),
  });
  if (!parsed.success) {
    return json(422, { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error) });
  }

  const { website, startedAt, ...data } = parsed.data;
  if (looksLikeSpam({ website, startedAt })) return json(201, { ok: true, message: "Thank you — your profile has been received." });

  try {
    // Connect first so no files are stored without a matching application record.
    await connectToDatabase();
  } catch (error) {
    return serverError(error, "candidate");
  }

  let cv: StoredFile | undefined;
  let certificates: StoredFile[] = [];
  let trainingCertificates: StoredFile[] = [];
  let portfolioImages: StoredFile[] = [];

  // CV upload
  const cvFile = form.get("cv");
  if (cvFile instanceof File && cvFile.size > 0) {
    try {
      cv = await saveCv(cvFile);
    } catch (error) {
      if (error instanceof UploadError) {
        return json(422, { ok: false, message: error.message, errors: { cv: error.message } });
      }
      return serverError(error, "candidate:cv");
    }
  }

  // Certificate uploads
  const certFiles = form.getAll("certificates").filter((f): f is File => f instanceof File && f.size > 0);
  if (certFiles.length > CERT_MAX_COUNT) {
    return json(422, { ok: false, message: `Upload a maximum of ${CERT_MAX_COUNT} certificates.` });
  }
  for (const f of certFiles) {
    try {
      certificates.push(await saveCertificate(f, "cert"));
    } catch (error) {
      if (error instanceof UploadError) {
        return json(422, { ok: false, message: error.message, errors: { certificates: error.message } });
      }
      return serverError(error, "candidate:cert");
    }
  }

  // Training certificate uploads
  const trainingFiles = form.getAll("trainingCertificates").filter((f): f is File => f instanceof File && f.size > 0);
  if (trainingFiles.length > CERT_MAX_COUNT) {
    return json(422, { ok: false, message: `Upload a maximum of ${CERT_MAX_COUNT} training certificates.` });
  }
  for (const f of trainingFiles) {
    try {
      trainingCertificates.push(await saveCertificate(f, "training"));
    } catch (error) {
      if (error instanceof UploadError) {
        return json(422, { ok: false, message: error.message, errors: { trainingCertificates: error.message } });
      }
      return serverError(error, "candidate:training");
    }
  }

  // Portfolio image uploads
  const portfolioFiles = form.getAll("portfolioImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (portfolioFiles.length > IMG_MAX_COUNT) {
    return json(422, { ok: false, message: `Upload a maximum of ${IMG_MAX_COUNT} portfolio images.` });
  }
  for (const f of portfolioFiles) {
    try {
      portfolioImages.push(await saveCertificate(f, "portfolio"));
    } catch (error) {
      if (error instanceof UploadError) {
        return json(422, { ok: false, message: error.message, errors: { portfolioImages: error.message } });
      }
      return serverError(error, "candidate:portfolio");
    }
  }

  try {
    const referenceNumber = generateRef();
    await CandidateApplication.create({
      ...data,
      cv,
      certificates,
      trainingCertificates,
      portfolioImages,
      referenceNumber,
      consentAt: new Date(),
    });
    return json(201, {
      ok: true,
      message: `Thank you — your professional profile has been received. We will contact you if a suitable opportunity arises. Your reference number is ${referenceNumber}.`,
    });
  } catch (error) {
    return serverError(error, "candidate");
  }
}
