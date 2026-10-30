import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StaffingMatchWorkbench } from "@/components/admin/StaffingMatchWorkbench";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { staffingStatuses } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Staffing Request" };

type StaffingRequest = {
  _id: string;
  // Business
  salonName: string;
  contactName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  location: string;
  businessType?: string;
  websiteOrSocial?: string;
  // Requirement
  professionalCategory: string;
  quantity: number;
  requiredSkills?: string;
  experienceRequired?: string;
  employmentType?: string;
  salaryRange?: string;
  preferredJoiningDate?: string;
  jobDescription?: string;
  // Meta
  referenceNumber?: string;
  consent: boolean;
  status: string;
  internalNotes?: Note[];
  createdAt: string;
  updatedAt: string;
};

export default async function StaffingRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const r = await getRecord<StaffingRequest>(resources.staffing, id);
  if (!r) notFound();

  const waPhone = (r.whatsapp || r.phone).replace(/\s/g, "");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/staffing", label: "All staffing requests" }}
        title={r.salonName}
        description={`${r.quantity} × ${r.professionalCategory} · ${r.location} · ${formatDate(r.createdAt)}`}
        actions={<StatusBadge status={r.status} className="text-sm" />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Business Information */}
          <Card
            title="Business Information"
            actions={
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                  <Phone aria-hidden className="h-4 w-4" /> Call
                </a>
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                  <MessageSquare aria-hidden className="h-4 w-4" /> WhatsApp
                </a>
                {r.email && (
                  <a href={`mailto:${r.email}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                    <Mail aria-hidden className="h-4 w-4" /> Email
                  </a>
                )}
              </div>
            }
          >
            <DetailList
              items={[
                { label: "Business / Salon Name", value: r.salonName },
                { label: "Contact Person", value: r.contactName },
                { label: "Business Location", value: r.location },
                { label: "Business Type", value: r.businessType },
                { label: "Mobile Number", value: r.phone },
                { label: "WhatsApp Number", value: r.whatsapp },
                { label: "Email Address", value: r.email },
                { label: "Website / Social Media", value: r.websiteOrSocial, wide: true },
              ]}
            />
          </Card>

          {/* Staffing Requirement */}
          <Card title="Staffing Requirement">
            <DetailList
              items={[
                { label: "Required Job Role", value: r.professionalCategory },
                { label: "Number of Vacancies", value: r.quantity },
                { label: "Experience Required", value: r.experienceRequired },
                { label: "Employment Type", value: r.employmentType },
                { label: "Expected Salary Range", value: r.salaryRange },
                { label: "Preferred Joining Date", value: r.preferredJoiningDate },
                { label: "Required Skills", value: r.requiredSkills, wide: true },
                { label: "Job Description", value: r.jobDescription, wide: true },
              ]}
            />
          </Card>

          <Card title="Internal Notes">
            <NotesPanel endpoint={`/api/admin/staffing/${r._id}`} initialNotes={r.internalNotes ?? []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Manage">
            <RecordActions
              endpoint={`/api/admin/staffing/${r._id}`}
              status={r.status}
              statuses={staffingStatuses}
              canDelete={admin.role === "admin"}
              entity="request"
              listHref="/admin/staffing"
            />
          </Card>
          <Card title="Record">
            <DetailList
              items={[
                { label: "Reference Number", value: r.referenceNumber, wide: true },
                { label: "Privacy Consent", value: r.consent ? "Given" : "Not recorded", wide: true },
                { label: "Submitted", value: formatDate(r.createdAt, true), wide: true },
                { label: "Last Updated", value: formatDate(r.updatedAt, true), wide: true },
              ]}
            />
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card title="Candidate Matching">
          <StaffingMatchWorkbench staffingId={r._id} compact />
        </Card>
      </div>
    </>
  );
}
