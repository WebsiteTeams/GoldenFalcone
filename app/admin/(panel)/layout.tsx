import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { orderStatusValues } from "@/lib/admin/constants";
import { getSiteConfig } from "@/lib/cms";
import { connectToDatabase } from "@/lib/mongodb";
import { CandidateApplication } from "@/models/CandidateApplication";
import { Enquiry } from "@/models/Enquiry";
import { SpiceOrder } from "@/models/SpiceOrder";
import { StaffingRequest } from "@/models/StaffingRequest";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  await connectToDatabase();
  const [enquiries, staffing, candidates, orders, config] = await Promise.all([
    Enquiry.countDocuments({ status: "new" }),
    StaffingRequest.countDocuments({ status: { $in: ["new", "reviewing"] } }),
    CandidateApplication.countDocuments({ status: { $in: ["new", "reviewing"] } }),
    SpiceOrder.countDocuments({ status: { $in: orderStatusValues("pending") } }),
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
