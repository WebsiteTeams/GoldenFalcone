import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import { openStaffingStatuses } from "./constants";
import { ActivityLog } from "@/models/ActivityLog";
import { CandidateApplication } from "@/models/CandidateApplication";
import { DigitalService } from "@/models/DigitalService";
import { Enquiry } from "@/models/Enquiry";
import { MentorshipProgram } from "@/models/MentorshipProgram";
import { PortfolioProject } from "@/models/PortfolioProject";
import { SiteContent } from "@/models/SiteContent";
import { SpiceOrder } from "@/models/SpiceOrder";
import { SpiceProduct } from "@/models/SpiceProduct";
import { StaffingConnection } from "@/models/StaffingConnection";
import { StaffingRequest } from "@/models/StaffingRequest";
import { toPlain } from "./api";

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

/** Relationships still being worked on — anything before a final decision. */
const ACTIVE_CONNECTIONS = ["suggested", "shortlisted", "shared-with-salon", "interview-scheduled", "interview-completed"] as const;
const CLOSED_CONNECTIONS = ["selected", "not-selected", "withdrawn"] as const;

/** Every figure on the dashboard comes from these live queries — nothing is hardcoded. */
export async function getDashboardStats() {
  await connectToDatabase();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const published = { status: "published" };
  const draft = { status: "draft" };
  const dueFollowUp = { "communications.followUpAt": { $lte: endOfToday } };
  const openFollowUp = { ...dueFollowUp, connectionStatus: { $nin: CLOSED_CONNECTIONS } };

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
    activeMatches,
    interviewsScheduled,
    placements,
    pendingFollowUps,
    followUpConnections,
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
    StaffingRequest.countDocuments({ status: { $in: openStaffingStatuses } }),
    StaffingRequest.countDocuments({ status: "new" }),
    StaffingRequest.countDocuments({ status: { $in: ["new", "reviewing"] } }),
    StaffingRequest.countDocuments({ createdAt: { $gte: since } }),
    StaffingRequest.aggregate<{ _id: null; total: number }>([
      { $match: { status: { $in: openStaffingStatuses } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]),
    CandidateApplication.countDocuments(),
    CandidateApplication.countDocuments({ status: "new" }),
    CandidateApplication.countDocuments({ status: "reviewing" }),
    CandidateApplication.countDocuments({ status: "shortlisted" }),
    CandidateApplication.countDocuments({ createdAt: { $gte: since } }),
    StaffingConnection.countDocuments({ connectionStatus: { $in: ACTIVE_CONNECTIONS } }),
    StaffingConnection.countDocuments({
      $or: [{ connectionStatus: "interview-scheduled" }, { interviewStatus: "scheduled" }],
    }),
    StaffingConnection.countDocuments({ connectionStatus: "selected" }),
    StaffingConnection.countDocuments(openFollowUp),
    StaffingConnection.find(openFollowUp)
      .sort({ "communications.followUpAt": 1 })
      .limit(6)
      .select("candidateId staffingRequestId connectionStatus communications")
      .lean(),
    Enquiry.find().sort({ createdAt: -1 }).limit(6).select("name email serviceType status createdAt").lean(),
    SpiceOrder.find().sort({ createdAt: -1 }).limit(5).select("orderNumber customer items totalAmount currency status createdAt").lean(),
    CandidateApplication.find().sort({ createdAt: -1 }).limit(5).select("fullName professionalCategory location status createdAt").lean(),
    ActivityLog.find().sort({ createdAt: -1 }).limit(8).lean(),
    SiteContent.findOne({ key: "main" }).select("publishedAt draftUpdatedAt").lean(),
  ]);

  const openVacancies = openVacanciesResult[0]?.total ?? 0;

  // Resolve names for the follow-up list without exposing full records.
  const followUpCandidateIds = [...new Set(followUpConnections.map((c) => String(c.candidateId)))];
  const followUpStaffingIds = [...new Set(followUpConnections.map((c) => String(c.staffingRequestId)))];
  const [followUpCandidates, followUpStaffing] = await Promise.all([
    CandidateApplication.find({ _id: { $in: followUpCandidateIds } }).select("fullName").lean(),
    StaffingRequest.find({ _id: { $in: followUpStaffingIds } }).select("salonName").lean(),
  ]);
  const candidateNames = new Map(followUpCandidates.map((c) => [String(c._id), c.fullName as string]));
  const salonNames = new Map(followUpStaffing.map((s) => [String(s._id), s.salonName as string]));

  const followUps = followUpConnections.map((connection) => {
    const due = (connection.communications ?? [])
      .map((c) => c.followUpAt)
      .filter((d): d is Date => d instanceof Date && d.getTime() <= endOfToday.getTime())
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return {
      _id: String(connection._id),
      candidateId: String(connection.candidateId),
      candidateName: candidateNames.get(String(connection.candidateId)) ?? "Candidate",
      salonName: salonNames.get(String(connection.staffingRequestId)) ?? "Hiring request",
      connectionStatus: connection.connectionStatus as string,
      followUpAt: (due ? new Date(due) : new Date()).toISOString(),
    };
  });

  return toPlain<{
    enquiries: { total: number; new: number };
    orders: { total: number; pending: number };
    spices: { published: number; draft: number };
    mentorship: { published: number; draft: number };
    digital: { published: number; draft: number; projects: number };
    staffing: { total: number; open: number; new: number; awaitingReview: number; last30: number; openVacancies: number };
    candidates: { total: number; new: number; reviewing: number; shortlisted: number; last30: number };
    matching: { active: number; interviews: number; placements: number; pendingFollowUps: number };
    followUps: { _id: string; candidateId: string; candidateName: string; salonName: string; connectionStatus: string; followUpAt: string }[];
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
    matching: { active: activeMatches, interviews: interviewsScheduled, placements, pendingFollowUps },
    followUps,
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
