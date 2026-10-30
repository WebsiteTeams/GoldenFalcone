import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText, Image, Mail, MessageSquare, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { candidateStatuses } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { CandidateApplication } from "@/models/CandidateApplication";

export const metadata: Metadata = { title: "Candidate" };

type StoredFileMeta = { storageKey?: string; originalName?: string; mimeType?: string; size?: number };

type Candidate = {
  _id: string;
  // Personal
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  location: string;
  preferredWorkLocation?: string;
  // Professional
  professionalCategory: string;
  additionalSkills?: string[];
  customSkills?: string;
  experience: string;
  previousWorkplace?: string;
  previousJobRole?: string;
  about?: string;
  employmentPreference?: string;
  expectedSalary?: string;
  availability?: string;
  // Documents (meta only — storageKeys fetched separately)
  cv?: { originalName?: string; mimeType?: string; size?: number };
  consent: boolean;
  consentAt?: string;
  status: string;
  internalNotes?: Note[];
  createdAt: string;
  updatedAt: string;
};

const kb = (bytes?: number) => (bytes ? `${Math.max(1, Math.round(bytes / 1024))} KB` : "");

function FileDownloadRow({ label, file, href }: { label: string; file: StoredFileMeta; href: string }) {
  const isImage = file.mimeType?.startsWith("image/");
  const Icon = isImage ? Image : FileText;
  return (
    <div className="flex flex-col gap-3 border-b border-line py-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-3 text-sm text-ink">
        <Icon aria-hidden className="h-4 w-4 shrink-0 text-emerald" />
        <span>
          {file.originalName} <span className="text-muted">{kb(file.size)}</span>
        </span>
      </p>
      <a
        href={href}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50"
      >
        <Download aria-hidden className="h-3.5 w-3.5" /> Download
      </a>
    </div>
  );
}

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();

  // Fetch the standard record (no hidden doc fields)
  const c = await getRecord<Candidate>(resources.candidates, id);
  if (!c) notFound();

  // Fetch document metadata (storage keys included for download link generation — never exposed to browser)
  await connectToDatabase();
  const docData = await CandidateApplication.findById(id)
    .select("cv.storageKey certificates trainingCertificates portfolioImages")
    .lean<{
      cv?: StoredFileMeta;
      certificates?: StoredFileMeta[];
      trainingCertificates?: StoredFileMeta[];
      portfolioImages?: StoredFileMeta[];
    }>();

  const allSkills = [
    ...(c.additionalSkills ?? []),
    ...(c.customSkills ? c.customSkills.split(",").map((s) => s.trim()).filter(Boolean) : []),
  ];

  const waPhone = (c.whatsapp || c.phone).replace(/\s/g, "");

  const fileDownloadHref = (key: string) =>
    `/api/admin/candidates/${c._id}/files/${encodeURIComponent(key)}`;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/candidates", label: "All candidates" }}
        title={c.fullName}
        description={`${c.professionalCategory} · ${c.experience} · ${c.location}`}
        actions={<StatusBadge status={c.status} className="text-sm" />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <Card
            title="Personal Information"
            actions={
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${c.email}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                  <Mail aria-hidden className="h-4 w-4" /> Email
                </a>
                <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                  <Phone aria-hidden className="h-4 w-4" /> Call
                </a>
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                  <MessageSquare aria-hidden className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            }
          >
            <DetailList
              items={[
                { label: "Full Name", value: c.fullName },
                { label: "Email Address", value: c.email },
                { label: "Mobile Number", value: c.phone },
                { label: "WhatsApp Number", value: c.whatsapp },
                { label: "Current Location", value: c.location },
                { label: "Preferred Work Location", value: c.preferredWorkLocation },
              ]}
            />
          </Card>

          {/* Professional Profile */}
          <Card title="Professional Profile">
            <DetailList
              items={[
                { label: "Primary Job Role", value: c.professionalCategory },
                { label: "Total Experience", value: c.experience },
                { label: "Previous Workplace", value: c.previousWorkplace },
                { label: "Previous Job Role", value: c.previousJobRole },
                { label: "Employment Preference", value: c.employmentPreference },
                { label: "Expected Salary", value: c.expectedSalary },
                { label: "Availability / Joining Date", value: c.availability },
                { label: "Professional Introduction", value: c.about, wide: true },
              ]}
            />
            {allSkills.length > 0 && (
              <div className="mt-5 border-t border-line pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill) => (
                    <span key={skill} className="rounded-full border border-line bg-ivory px-3 py-1 text-xs text-ink">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card title="Documents">
            {/* CV / Resume */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Resume / CV</p>
              {docData?.cv?.storageKey ? (
                <FileDownloadRow
                  label="CV"
                  file={{ ...c.cv, storageKey: docData.cv.storageKey }}
                  href={fileDownloadHref(docData.cv.storageKey)}
                />
              ) : (
                <p className="text-sm text-muted">No CV was attached.</p>
              )}
            </div>

            {/* Professional Certificates */}
            {(docData?.certificates?.length ?? 0) > 0 && (
              <div className="mb-4 border-t border-line pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Professional Certificates</p>
                {docData!.certificates!.map((f, i) =>
                  f.storageKey ? (
                    <FileDownloadRow key={i} label={f.originalName ?? `Certificate ${i + 1}`} file={f} href={fileDownloadHref(f.storageKey)} />
                  ) : null,
                )}
              </div>
            )}

            {/* Training Certificates */}
            {(docData?.trainingCertificates?.length ?? 0) > 0 && (
              <div className="mb-4 border-t border-line pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Training Certificates</p>
                {docData!.trainingCertificates!.map((f, i) =>
                  f.storageKey ? (
                    <FileDownloadRow key={i} label={f.originalName ?? `Training ${i + 1}`} file={f} href={fileDownloadHref(f.storageKey)} />
                  ) : null,
                )}
              </div>
            )}

            {/* Portfolio Images */}
            {(docData?.portfolioImages?.length ?? 0) > 0 && (
              <div className="border-t border-line pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">Portfolio Images</p>
                {docData!.portfolioImages!.map((f, i) =>
                  f.storageKey ? (
                    <FileDownloadRow key={i} label={f.originalName ?? `Portfolio ${i + 1}`} file={f} href={fileDownloadHref(f.storageKey)} />
                  ) : null,
                )}
              </div>
            )}

            {!docData?.cv?.storageKey &&
              !docData?.certificates?.length &&
              !docData?.trainingCertificates?.length &&
              !docData?.portfolioImages?.length && (
                <p className="text-sm text-muted">No documents were uploaded with this application.</p>
              )}
          </Card>

          <Card title="Internal Notes">
            <NotesPanel endpoint={`/api/admin/candidates/${c._id}`} initialNotes={c.internalNotes ?? []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Review">
            <RecordActions
              endpoint={`/api/admin/candidates/${c._id}`}
              status={c.status}
              statuses={candidateStatuses}
              canDelete={admin.role === "admin"}
              entity="candidate"
              listHref="/admin/candidates"
              deleteWarning="This permanently deletes the candidate's personal data, internal notes and any uploaded documents. Use this when the retention period ends or the candidate asks to be removed."
            />
          </Card>
          <Card title="Consent & Record">
            <DetailList
              items={[
                {
                  label: "Consent to store and share",
                  value: c.consent ? `Given ${formatDate(c.consentAt, true)}` : "Not recorded",
                  wide: true,
                },
                { label: "Applied", value: formatDate(c.createdAt, true), wide: true },
                { label: "Last Updated", value: formatDate(c.updatedAt, true), wide: true },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
