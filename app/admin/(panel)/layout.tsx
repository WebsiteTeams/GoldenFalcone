import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteConfig } from "@/lib/cms";
import { CandidateApplication } from "@/models/CandidateApplication";
import { Enquiry } from "@/models/Enquiry";
import { SpiceOrder } from "@/models/SpiceOrder";
import { StaffingRequest } from "@/models/StaffingRequest";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [enquiries, staffing, candidates, orders, config] = await Promise.all([
    Enquiry.countDocuments({ status: "new" }),
    StaffingRequest.countDocuments({ status: "new" }),
    CandidateApplication.countDocuments({ status: "new" }),
    SpiceOrder.countDocuments({ status: { $in: ["pending-whatsapp", "enquiry-received"] } }),
    getSiteConfig(),
  ]);

  return (
    <AdminShell
      admin={{ name: admin.name, email: admin.email, role: admin.role }}
      badges={{ enquiries, staffing, candidates, orders }}
      logo={config.logo}
    >
      {children}
    </AdminShell>
  );
}
