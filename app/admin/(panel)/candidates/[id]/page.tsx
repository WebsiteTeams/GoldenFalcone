import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileText, Image, Mail, MessageSquare, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { candidateStatuses, statusLabel } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { CandidateApplication } from "@/models/CandidateApplication";
import { StaffingConnection } from "@/models/StaffingConnection";

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
  profilePhoto?: StoredFileMeta;
  // Professional
  professionalCategory: string;
  additionalSkills?: string[];
  customSkills?: string[];
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

function FileDownloadRow({ file, href }: { file: StoredFileMeta; href: string }) {
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
    .select("cv.storageKey profilePhoto.storageKey certificates trainingCertificates portfolioImages")
    .lean<{
      cv?: StoredFileMeta;
      profilePhoto?: StoredFileMeta;
      certificates?: StoredFileMeta[];
      trainingCertificates?: StoredFileMeta[];
      portfolioImages?: StoredFileMeta[];
    }>();

  const connections = await StaffingConnection.find({ candidateId: id })
    .populate({ path: "staffingRequestId", select: "salonName professionalCategory location quantity status referenceNumber" })
    .sort({ updatedAt: -1 })
    .lean<
      {
        _id: string;
        connectionStatus: string;
        sharedWithSalonAt?: string;
        interviewDate?: string;
        interviewStatus?: string;
        matchNotes?: string;
        salonFeedback?: string;
        finalOutcome?: string;
        staffingRequestId?: { _id: string; salonName: string; professionalCategory: string; location: string; quantity: number; status: string; referenceNumber?: string };
      }[]
    >();

  const allSkills = [...(c.additionalSkills ?? []), ...(c.customSkills ?? [])];

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
            {docData?.profilePhoto?.storageKey ? (
              <div className="mb-5 flex items-center gap-4 border-b border-line pb-5">
                {/* eslint-disable-next-line @next/next/no-img-element -- authenticated admin file route */}
                <img
                  src={fileDownloadHref(docData.profilePhoto.storageKey)}
                  alt={`Profile photo of ${c.fullName}`}
                  className="h-20 w-20 border border-line object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-dark">Profile photo</p>
                  <p className="mt-1 text-xs text-muted">Stored privately. Visible only to signed-in administrators.</p>
                </div>
              </div>
            ) : null}
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
                    <FileDownloadRow key={i} file={f} href={fileDownloadHref(f.storageKey)} />
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
                    <FileDownloadRow key={i} file={f} href={fileDownloadHref(f.storageKey)} />
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
                    <FileDownloadRow key={i} file={f} href={fileDownloadHref(f.storageKey)} />
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

          <Card title="Salon Connections">
            {connections.length ? (
              <ul className="divide-y divide-line">
                {connections.map((connection) => {
                  const salon = connection.staffingRequestId;
                  return (
                    <li key={connection._id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          {salon ? (
                            <Link href={`/admin/staffing/${salon._id}`} className="font-medium text-forest hover:text-gold-dark">
                              {salon.salonName}
                            </Link>
                          ) : (
                            <span className="font-medium text-ink">Requirement removed</span>
                          )}
                          <p className="mt-0.5 text-xs text-muted">
                            {salon ? `${salon.quantity} × ${salon.professionalCategory} · ${salon.location}` : "No requirement details"}
                          </p>
                        </div>
                        <StatusBadge status={connection.connectionStatus} />
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        {connection.sharedWithSalonAt ? `Shared ${formatDate(connection.sharedWithSalonAt)} · ` : ""}
                        {connection.interviewDate ? `Interview ${formatDate(connection.interviewDate, true)} (${statusLabel(connection.interviewStatus ?? "scheduled")})` : "No interview scheduled"}
                      </p>
                      {connection.matchNotes ? <p className="mt-1.5 text-xs text-ink/80">{connection.matchNotes}</p> : null}
                      {connection.salonFeedback ? (
                        <p className="mt-1 text-xs text-muted">Salon feedback: {connection.salonFeedback}</p>
                      ) : null}
                      {connection.finalOutcome ? (
                        <p className="mt-1 text-xs text-muted">Outcome: {connection.finalOutcome}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                This candidate has not been attached to a hiring requirement yet.{" "}
                <Link href="/admin/matching" className="font-medium text-forest underline decoration-gold/60 underline-offset-2">
                  Open candidate matching
                </Link>
                .
              </p>
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
