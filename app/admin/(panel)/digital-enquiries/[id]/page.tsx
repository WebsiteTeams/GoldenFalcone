import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { isObjectId } from "@/lib/admin/api";
import { enquiryStatuses, digitalEnquiryStatuses, toOptions } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Digital Enquiry Detail" };

type DigitalEnquiryDetail = {
  _id: string;
  referenceNumber: string;
  fullName: string;
  companyName: string;
  email: string;
  mobile: string;
  whatsapp: string;
  location: string;
  projectType: string;
  projectName: string;
  industry: string;
  projectDescription: string;
  problemToSolve: string;
  requiredFeatures: string;
  targetUsers: string;
  referenceUrls: string;
  existingWebsite: string;
  estimatedBudget: string;
  expectedTimeline: string;
  preferredContactMethod: string;
  additionalNotes: string;
  status: string;
  assignedTo: { adminId?: string; adminName?: string } | null;
  internalNotes?: Note[];
  consent?: boolean;
  contactHistory: { channel: string; date: Date; notes: string; contactedBy: string }[];
  createdAt: string;
  updatedAt: string;
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "requirement-discussion", label: "Requirement Discussion" },
  { value: "proposal-preparation", label: "Proposal Preparation" },
  { value: "proposal-sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "approved", label: "Approved" },
  { value: "in-development", label: "In Development" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
  { value: "not-proceeding", label: "Not Proceeding" },
  { value: "rejected", label: "Rejected" },
];

const contactChannels = ["call", "whatsapp", "email", "meeting"];

const detailLabels: Record<string, string> = {
  referenceNumber: "Reference Number",
  fullName: "Full Name",
  companyName: "Company / Business Name",
  email: "Email",
  mobile: "Mobile",
  whatsapp: "WhatsApp",
  location: "Business Location",
  projectType: "Project Type",
  projectName: "Project Name",
  industry: "Industry",
  projectDescription: "Project Description",
  problemToSolve: "Problem to Solve",
  requiredFeatures: "Main Features Required",
  targetUsers: "Target Users",
  referenceUrls: "Reference Websites / Apps",
  existingWebsite: " Existing Website URL",
  estimatedBudget: "Estimated Budget",
  expectedTimeline: "Expected Timeline",
  preferredContactMethod: "Preferred Contact Method",
  additionalNotes: "Additional Notes",
};

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const e = await getRecord<DigitalEnquiryDetail>(resources.digitalEnquiries, id);
  if (!e) notFound();

  const statusOptionsList = statusOptions.map((s) => ({
    value: s.value,
    label: s.label,
    default: s.value === e.status,
  }));

  return (
    <>
      <PageHeader
        back={{ href: "/admin/digital-enquiries", label: "Digital Enquiries" }}
        title={e.referenceNumber}
        description={`${e.fullName} — ${e.projectType} · ${formatDate(e.createdAt, true)}`}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Enquiry Details">
            <DetailList
              items={[
                { label: "Reference Number", value: e.referenceNumber, wide: true },
                { label: "Full Name", value: e.fullName, wide: true },
                { label: "Company / Business Name", value: e.companyName },
                { label: "Email", value: e.email, wide: true },
                { label: "Mobile", value: e.mobile },
                { label: "WhatsApp", value: e.whatsapp || "—" },
                { label: "Business Location", value: e.location },
                { label: "Project Type", value: e.projectType },
                { label: "Project Name", value: e.projectName || "—" },
                { label: "Industry", value: e.industry },
                { label: "Project Description", value: e.projectDescription, wide: true },
                { label: "Problem to Solve", value: e.problemToSolve },
                { label: "Main Features Required", value: e.requiredFeatures },
                { label: "Target Users", value: e.targetUsers },
                { label: "Reference Websites / Apps", value: e.referenceUrls || "—" },
                { label: "Existing Website URL", value: e.existingWebsite || "—" },
                { label: "Estimated Budget", value: e.estimatedBudget },
                { label: "Expected Timeline", value: e.expectedTimeline },
                { label: "Preferred Contact Method", value: e.preferredContactMethod },
                { label: "Additional Notes", value: e.additionalNotes || "—" },
              ]}
            />
          </Card>

          <Card title="Status & Assignment">
            <StatusBadge status={e.status} className="text-sm" />
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-forest" />
                <span className="text-sm text-forest">Status: {e.status}</span>
              </div>
              {e.assignedTo ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-sm text-forest">Assigned to: {e.assignedTo.adminName || "Team Member"}</span>
                </div>
              ) : null}
            </div>
          </Card>

          <Card title="Internal Notes">
            <NotesPanel endpoint={`/api/admin/digital-enquiries/${e._id}`} initialNotes={e.internalNotes ?? []} />
          </Card>
        </div>

        <div>
          <Card title="Quick Actions">
            <RecordActions
              endpoint={`/api/admin/digital-enquiries/${e._id}`}
              status={e.status}
              statuses={digitalEnquiryStatuses}
              canDelete={false}
              entity="digital enquiry"
              listHref="/admin/digital-enquiries"
            />
          </Card>

          <Card title="Record">
            <DetailList
              items={[
                { label: "Received", value: formatDate(e.createdAt, true), wide: true },
                { label: "Last updated", value: formatDate(e.updatedAt, true), wide: true },
                { label: "Contact History", value: e.contactHistory.length > 0 ? `${e.contactHistory.length} contacts` : "No contacts yet" },
                { label: "Privacy consent", value: e.consent ? "Given" : "Not recorded", wide: true },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
}