import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { CandidateApplication } from "@/models/CandidateApplication";
import { DigitalService } from "@/models/DigitalService";
import { Enquiry } from "@/models/Enquiry";
import { MentorshipProgram } from "@/models/MentorshipProgram";
import { PortfolioProject } from "@/models/PortfolioProject";
import { SiteContent } from "@/models/SiteContent";
import { SpiceCategory } from "@/models/SpiceCategory";
import { SpiceOrder } from "@/models/SpiceOrder";
import { SpiceProduct } from "@/models/SpiceProduct";
import { StaffingRequest } from "@/models/StaffingRequest";
import { toPlain } from "./api";

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

const OPEN_STAFFING = ["new", "reviewing", "shortlisted", "contacted"];

/** Every figure on the dashboard comes from these live queries — nothing is hardcoded. */
export async function getDashboardStats() {
  await connectToDatabase();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const published = { status: "published" };
  const draft = { status: "draft" };

  const [
    totalEnquiries,
    newEnquiries,
    totalOrders,
    pendingOrders,
    publishedSpices,
    draftSpices,
    activePrograms,
    draftPrograms,
    publishedServices,
    draftServices,
    publishedProjects,
    totalStaffing,
    openStaffing,
    newStaffing,
    staffingAwaitingReview,
    staffingLast30,
    openVacanciesResult,
    totalCandidates,
    newCandidates,
    reviewingCandidates,
    shortlistedCandidates,
    candidatesLast30,
    recentEnquiries,
    recentOrders,
    recentCandidates,
    recentActivity,
    content,
  ] = await Promise.all([
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    SpiceOrder.countDocuments(),
    SpiceOrder.countDocuments({ status: { $in: ["pending-whatsapp", "enquiry-received"] } }),
    SpiceProduct.countDocuments(published),
    SpiceProduct.countDocuments(draft),
    MentorshipProgram.countDocuments(published),
    MentorshipProgram.countDocuments(draft),
    DigitalService.countDocuments(published),
    DigitalService.countDocuments(draft),
    PortfolioProject.countDocuments(published),
    StaffingRequest.countDocuments(),
    StaffingRequest.countDocuments({ status: { $in: OPEN_STAFFING } }),
    StaffingRequest.countDocuments({ status: "new" }),
    StaffingRequest.countDocuments({ status: { $in: ["new", "reviewing"] } }),
    StaffingRequest.countDocuments({ createdAt: { $gte: since } }),
    StaffingRequest.aggregate<{ _id: null; total: number }>([
      { $match: { status: { $in: OPEN_STAFFING } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]),
    CandidateApplication.countDocuments(),
    CandidateApplication.countDocuments({ status: "new" }),
    CandidateApplication.countDocuments({ status: "reviewing" }),
    CandidateApplication.countDocuments({ status: "shortlisted" }),
    CandidateApplication.countDocuments({ createdAt: { $gte: since } }),
    Enquiry.find().sort({ createdAt: -1 }).limit(6).select("name email serviceType status createdAt").lean(),
    SpiceOrder.find().sort({ createdAt: -1 }).limit(5).select("orderNumber customer items totalAmount currency status createdAt").lean(),
    CandidateApplication.find().sort({ createdAt: -1 }).limit(5).select("fullName professionalCategory location status createdAt").lean(),
    ActivityLog.find().sort({ createdAt: -1 }).limit(8).lean(),
    SiteContent.findOne({ key: "main" }).select("publishedAt draftUpdatedAt").lean(),
  ]);

  const openVacancies = openVacanciesResult[0]?.total ?? 0;

  return toPlain<{
    enquiries: { total: number; new: number };
    orders: { total: number; pending: number };
    spices: { published: number; draft: number };
    mentorship: { published: number; draft: number };
    digital: { published: number; draft: number; projects: number };
    staffing: { total: number; open: number; new: number; awaitingReview: number; last30: number; openVacancies: number };
    candidates: { total: number; new: number; reviewing: number; shortlisted: number; last30: number };
    content: { published: boolean; unpublishedChanges: boolean };
    recentEnquiries: { _id: string; name: string; email: string; serviceType: string; status: string; createdAt: string }[];
    recentOrders: {
      _id: string;
      orderNumber: string;
      customer: { name: string; phone: string };
      items: Array<{ name: string; quantity: number }>;
      totalAmount: number;
      currency: string;
      status: string;
      createdAt: string;
    }[];
    recentCandidates: { _id: string; fullName: string; professionalCategory: string; location: string; status: string; createdAt: string }[];
    recentActivity: { _id: string; adminName?: string; action: string; entity: string; entityId?: string; summary?: string; createdAt: string }[];
  }>({
    enquiries: { total: totalEnquiries, new: newEnquiries },
    orders: { total: totalOrders, pending: pendingOrders },
    spices: { published: publishedSpices, draft: draftSpices },
    mentorship: { published: activePrograms, draft: draftPrograms },
    digital: { published: publishedServices, draft: draftServices, projects: publishedProjects },
    staffing: { total: totalStaffing, open: openStaffing, new: newStaffing, awaitingReview: staffingAwaitingReview, last30: staffingLast30, openVacancies },
    candidates: { total: totalCandidates, new: newCandidates, reviewing: reviewingCandidates, shortlisted: shortlistedCandidates, last30: candidatesLast30 },
    content: {
      published: Boolean(content?.publishedAt),
      unpublishedChanges: Boolean(content?.draftUpdatedAt && (!content.publishedAt || content.draftUpdatedAt > content.publishedAt)),
    },
    recentEnquiries,
    recentOrders: recentOrders as never,
    recentCandidates,
    recentActivity,
  });
}
