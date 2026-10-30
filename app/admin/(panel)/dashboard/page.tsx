import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Inbox,
  Leaf,
  MailOpen,
  MonitorSmartphone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { serviceTypeLabels } from "@/lib/admin/constants";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/cart/price";

export const metadata: Metadata = { title: "Dashboard" };

function Panel({ title, href, linkLabel, children }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-serif text-2xl text-forest">{title}</h2>
        {href ? (
          <Link href={href} className="text-sm font-medium text-gold-dark hover:text-forest">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Metric({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-ivory">
      <span className="text-muted">{label}</span>
      <span className="font-semibold tabular-nums text-ink">{value}</span>
    </Link>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdmin();
  const { denied } = await searchParams;
  const s = await getDashboardStats();
  const firstName = admin.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description="Live overview of enquiries, catalogue content and staffing activity." />

      {denied ? (
        <p role="alert" className="mb-6 rounded-xl border border-gold/40 bg-champagne/25 px-4 py-3 text-sm text-ink/80">
          That area is limited to full administrators.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Spice Orders" value={s.orders.total} hint={`${s.orders.pending} pending confirmation`} href="/admin/orders" icon={ShoppingBag} />
        <StatCard label="Total Enquiries" value={s.enquiries.total} hint="All website enquiries" href="/admin/enquiries" icon={Inbox} />
        <StatCard label="New Enquiries" value={s.enquiries.new} hint="Awaiting a first response" href="/admin/enquiries?status=new" icon={MailOpen} />
        <StatCard label="Published Spices" value={s.spices.published} hint={`${s.spices.draft} in draft`} href="/admin/spices" icon={Leaf} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <Panel title="Recent Spice Orders" href="/admin/orders" linkLabel="View all">
            {s.recentOrders.length ? (
              <ul className="-my-2 divide-y divide-line">
                {s.recentOrders.map((o) => (
                  <li key={o._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/admin/orders/${o._id}`} className="font-mono font-medium text-forest hover:text-gold-dark">
                        {o.orderNumber}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {o.customer.name} · {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""} · {formatDate(o.createdAt, true)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-forest">
                        {formatPrice(o.totalAmount, o.currency)}
                      </span>
                      <StatusBadge status={o.status} />
                      <Link href={`/admin/orders/${o._id}`} className="text-sm font-medium text-gold-dark hover:text-forest">
                        View<span className="sr-only"> order {o.orderNumber}</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No orders yet" description="Orders placed through the spices store will appear here." />
            )}
          </Panel>

          <Panel title="Recent Enquiries" href="/admin/enquiries" linkLabel="View all">
            {s.recentEnquiries.length ? (
              <ul className="-my-2 divide-y divide-line">
                {s.recentEnquiries.map((e) => (
                  <li key={e._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/admin/enquiries/${e._id}`} className="font-medium text-forest hover:text-gold-dark">
                        {e.name}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {serviceTypeLabels[e.serviceType] ?? e.serviceType} · {formatDate(e.createdAt, true)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={e.status} />
                      <Link href={`/admin/enquiries/${e._id}`} className="text-sm font-medium text-gold-dark hover:text-forest">
                        View<span className="sr-only"> enquiry from {e.name}</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No enquiries yet" description="Enquiries submitted on the website will appear here." />
            )}
          </Panel>

          <Panel title="Recent Candidate Profiles" href="/admin/candidates" linkLabel="View all">
            {s.recentCandidates?.length ? (
              <ul className="-my-2 divide-y divide-line">
                {s.recentCandidates.map((c) => (
                  <li key={c._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/admin/candidates/${c._id}`} className="font-medium text-forest hover:text-gold-dark">
                        {c.fullName}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {c.professionalCategory} · {c.location} · {formatDate(c.createdAt, true)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <Link href={`/admin/candidates/${c._id}`} className="text-sm font-medium text-gold-dark hover:text-forest">
                        View<span className="sr-only"> candidate {c.fullName}</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No candidate profiles yet" description="Profiles submitted on the salon staffing page will appear here." />
            )}
          </Panel>
        </div>

        <Panel title="Staffing Overview" href="/admin/staffing" linkLabel="Manage">
          <div className="-mx-3 space-y-0.5">
            <Metric label="Total hiring requirements" value={s.staffing.total} href="/admin/staffing" />
            <Metric label="New requirements" value={s.staffing.new} href="/admin/staffing?status=new" />
            <Metric label="Open vacancies" value={s.staffing.openVacancies} href="/admin/staffing" />
            <Metric label="Total candidates" value={s.candidates.total} href="/admin/candidates" />
            <Metric label="Candidates under review" value={s.candidates.reviewing} href="/admin/candidates?status=reviewing" />
            <Metric label="Shortlisted candidates" value={s.candidates.shortlisted} href="/admin/candidates?status=shortlisted" />
          </div>
        </Panel>

        <Panel title="Service Overview">
          <ul className="space-y-4 text-sm">
            {[
              { icon: Leaf, label: "Spices catalogue", href: "/admin/spices", text: `${s.spices.published} published · ${s.spices.draft} draft` },
              { icon: GraduationCap, label: "Mentorship programmes", href: "/admin/mentorship", text: `${s.mentorship.published} published · ${s.mentorship.draft} draft` },
              { icon: MonitorSmartphone, label: "Digital services", href: "/admin/digital-services", text: `${s.digital.published} published · ${s.digital.draft} draft · ${s.digital.projects} portfolio` },
              { icon: BriefcaseBusiness, label: "Salon staffing", href: "/admin/staffing", text: `${s.staffing.open} open requests · ${s.candidates.new} new candidates` },
              {
                icon: FileText,
                label: "Website content",
                href: "/admin/pages",
                text: s.content.unpublishedChanges ? "Unpublished changes waiting" : s.content.published ? "Published and up to date" : "Using built-in default copy",
              },
            ].map(({ icon: Icon, label, href, text }) => (
              <li key={label}>
                <Link href={href} className="group flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/5 text-emerald">
                    <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block font-medium text-ink group-hover:text-gold-dark">{label}</span>
                    <span className="block text-xs text-muted">{text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="xl:col-span-2">
          <Panel title="Recent Activity">
            {s.recentActivity.length ? (
              <ol className="space-y-4">
                {s.recentActivity.map((a) => (
                  <li key={a._id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-ink">
                        <span className="font-medium">{a.adminName ?? "An administrator"}</span> {a.action} {a.entity}
                        {a.summary ? <span className="text-muted"> — {a.summary}</span> : null}
                      </p>
                      <p className="text-xs text-muted">{formatDate(a.createdAt, true)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState icon={Activity} title="No activity recorded yet" description="Administrator actions such as edits, status changes and publishing are logged here." />
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
