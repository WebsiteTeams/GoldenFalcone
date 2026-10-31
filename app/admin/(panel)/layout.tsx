import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteConfig } from "@/lib/cms";
import { CandidateApplication } from "@/models/CandidateApplication";
import { DigitalEnquiry } from "@/models/DigitalEnquiry";
import { Enquiry } from "@/models/Enquiry";
import { SpiceOrder } from "@/models/SpiceOrder";
import { StaffingRequest } from "@/models/StaffingRequest";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [enquiries, digitalEnquiries, staffing, candidates, orders, config] = await Promise.all([
    Enquiry.countDocuments({ status: "new" }),
    DigitalEnquiry.countDocuments({ status: "new" }),
    StaffingRequest.countDocuments({ status: { $in: ["new", "reviewing"] } }),
    CandidateApplication.countDocuments({ status: { $in: ["new", "reviewing"] } }),
    SpiceOrder.countDocuments({ status: { $in: ["pending-whatsapp", "enquiry-received"] } }),
    getSiteConfig(),
  ]);

  return (
    <AdminShell
      admin={{ name: admin.name, email: admin.email, role: admin.role }}
      badges={{ enquiries, digitalEnquiries, staffing, candidates, orders }}
      logo={config.logo}
    >
      {children}
    </AdminShell>
  );
}
