import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { enquiryStatuses, labelFor, tradingMarkets } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Demo Request" };

type EnquiryDoc = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  softwareName?: string;
  tradingMarket?: string;
  message: string;
  preferredContactMethod?: string;
  status: string;
  source?: string;
  internalNotes?: Note[];
  createdAt: string;
};

export default async function SoftwareEnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const enquiry = await getRecord<EnquiryDoc>(resources.softwareEnquiries, id);
  if (!enquiry) notFound();

  const digits = enquiry.phone.replace(/\D/g, "");
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hello ${enquiry.name}, thank you for your interest in ${enquiry.softwareName || "Goldenfalcone trading software"}.`)}`
    : null;
  const link = "inline-flex items-center gap-1.5 text-forest underline hover:text-gold";

  return (
    <>
      <PageHeader
        back={{ href: "/admin/trading-software/enquiries", label: "All demo requests" }}
        title={enquiry.name}
        description={`Received ${formatDate(enquiry.createdAt, true)}`}
        actions={<StatusBadge status={enquiry.status} className="text-sm" />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Request">
            <DetailList
              items={[
                { label: "Software of interest", value: enquiry.softwareName || "General enquiry" },
                { label: "Intended market", value: enquiry.tradingMarket ? labelFor(enquiry.tradingMarket, tradingMarkets) : "" },
                { label: "Preferred contact", value: enquiry.preferredContactMethod },
                { label: "Company", value: enquiry.company },
                { label: "Message", value: enquiry.message, wide: true },
              ]}
            />
          </Card>
          <Card title="Contact">
            <DetailList
              items={[
                {
                  label: "Email",
                  value: (
                    <a href={`mailto:${enquiry.email}`} className={link}>
                      <Mail className="h-3.5 w-3.5 text-gold-dark" />
                      {enquiry.email}
                    </a>
                  ),
                },
                {
                  label: "Phone / WhatsApp",
                  value: (
                    <div className="flex flex-wrap items-center gap-3">
                      <a href={`tel:${enquiry.phone}`} className={link}>
                        <Phone className="h-3.5 w-3.5 text-gold-dark" />
                        {enquiry.phone}
                      </a>
                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-semibold text-[#1EBE5D] transition-colors hover:bg-[#25D366]/25"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Chat on WhatsApp
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Status">
            <RecordActions
              endpoint={`/api/admin/trading-software/enquiries/${id}`}
              status={enquiry.status}
              statuses={enquiryStatuses}
              canDelete={admin.role === "admin"}
              entity="request"
              listHref="/admin/trading-software/enquiries"
            />
          </Card>
          <Card title="Internal notes">
            <NotesPanel initialNotes={enquiry.internalNotes ?? []} endpoint={`/api/admin/trading-software/enquiries/${id}/notes`} />
          </Card>
        </div>
      </div>
    </>
  );
}
