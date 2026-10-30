import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { enquiryStatuses, serviceTypeLabels } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Enquiry" };

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  serviceType: string;
  details?: Record<string, string | undefined>;
  message: string;
  status: string;
  source?: string;
  consent: boolean;
  internalNotes?: Note[];
  createdAt: string;
  updatedAt: string;
};

const detailLabels: Record<string, string> = {
  product: "Spice of interest",
  quantity: "Approximate quantity",
  experienceLevel: "Experience level",
  projectType: "Project type",
  budget: "Budget",
  timeline: "Timeline",
};

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const e = await getRecord<Enquiry>(resources.enquiries, id);
  if (!e) notFound();

  const details = Object.entries(e.details ?? {}).filter(([, v]) => v);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/enquiries", label: "All enquiries" }}
        title={e.name}
        description={`${serviceTypeLabels[e.serviceType] ?? e.serviceType} · received ${formatDate(e.createdAt, true)}`}
        actions={<StatusBadge status={e.status} className="text-sm" />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card
            title="Enquiry"
            actions={
              <div className="flex gap-2">
                <a href={`mailto:${e.email}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                  <Mail aria-hidden className="h-4 w-4" /> Email
                </a>
                {e.phone ? (
                  <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-forest hover:border-gold/50">
                    <Phone aria-hidden className="h-4 w-4" /> Call
                  </a>
                ) : null}
              </div>
            }
          >
            <DetailList
              items={[
                { label: "Name", value: e.name },
                { label: "Email", value: e.email },
                { label: "Phone", value: e.phone },
                { label: "Company", value: e.company },
                { label: "Country / region", value: e.country },
                { label: "Service", value: serviceTypeLabels[e.serviceType] ?? e.serviceType },
                ...details.map(([k, v]) => ({ label: detailLabels[k] ?? k, value: v })),
                { label: "Message", value: e.message, wide: true },
              ]}
            />
          </Card>
          <Card title="Internal notes">
            <NotesPanel endpoint={`/api/admin/enquiries/${e._id}`} initialNotes={e.internalNotes ?? []} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Manage">
            <RecordActions
              endpoint={`/api/admin/enquiries/${e._id}`}
              status={e.status}
              statuses={enquiryStatuses}
              canDelete={admin.role === "admin"}
              entity="enquiry"
              listHref="/admin/enquiries"
            />
          </Card>
          <Card title="Record">
            <DetailList
              items={[
                { label: "Received", value: formatDate(e.createdAt, true), wide: true },
                { label: "Last updated", value: formatDate(e.updatedAt, true), wide: true },
                { label: "Source page", value: e.source, wide: true },
                { label: "Privacy consent", value: e.consent ? "Given" : "Not recorded", wide: true },
              ]}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
