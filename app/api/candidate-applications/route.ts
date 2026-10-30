import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { saveCertificate, saveCv, UploadError, type StoredFile } from "@/lib/storage";
import { candidateApplicationSchema, CERT_MAX_COUNT, IMG_MAX_COUNT } from "@/lib/validations";
import { CandidateApplication } from "@/models/CandidateApplication";

export const runtime = "nodejs";

/** Generates a short reference number: CA-YYYYMMDD-XXXXXX */
function createReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0");
  return `CA-${date}-${suffix}`;
}

async function uniqueReference() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceNumber = createReference();
    const exists = await CandidateApplication.exists({ referenceNumber });
    if (!exists) return referenceNumber;
  }
  return `CA-${Date.now().toString(36).toUpperCase()}`;
}

// Accepts multipart/form-data so CV, certificates, portfolio and profile photo can be attached.
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

  const { website, startedAt, customSkills: rawCustomSkills, ...data } = parsed.data;
  const customSkills = String(rawCustomSkills ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 30);
  if (looksLikeSpam({ website, startedAt })) {
    return json(201, { ok: true, message: "Thank you — your profile has been received." });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    return serverError(error, "candidate");
  }

  try {
    // Guard against double clicks and refreshes before storing any files.
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await CandidateApplication.findOne({
      createdAt: { $gte: since },
      $or: [{ phone: data.phone }, { email: data.email }],
    })
      .select("referenceNumber")
      .lean();

    if (duplicate?.referenceNumber) {
      return json(200, {
        ok: true,
        message: "Your profile has already been received. Our team will review it and contact you if a suitable opportunity is identified.",
        referenceNumber: duplicate.referenceNumber,
        duplicate: true,
      });
    }

    let cv: StoredFile | undefined;
    let profilePhoto: StoredFile | undefined;
    const certificates: StoredFile[] = [];
    const trainingCertificates: StoredFile[] = [];
    const portfolioImages: StoredFile[] = [];

    // Profile photo (optional)
    const photoFile = form.get("profilePhoto");
    if (photoFile instanceof File && photoFile.size > 0) {
      try {
        profilePhoto = await saveCertificate(photoFile, "profile");
      } catch (error) {
        if (error instanceof UploadError) {
          return json(422, { ok: false, message: error.message, errors: { profilePhoto: error.message } });
        }
        return serverError(error, "candidate:photo");
      }
    }

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

    const referenceNumber = await uniqueReference();
    await CandidateApplication.create({
      ...data,
      customSkills,
      profilePhoto,
      cv,
      certificates,
      trainingCertificates,
      portfolioImages,
      referenceNumber,
      consentAt: new Date(),
    });
    return json(201, {
      ok: true,
      message:
        "Your professional profile has been received. Our team will review your experience, skills and documents. If a suitable opportunity is identified, we will contact you using the details provided.",
      referenceNumber,
    });
  } catch (error) {
    return serverError(error, "candidate");
  }
}
