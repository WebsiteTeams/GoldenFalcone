import {
  BriefcaseBusiness,
  FileText,
  GitCompareArrows,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Leaf,
  MonitorSmartphone,
  Settings,
  ShoppingBag,
  Tags,
  UserRound,
} from "lucide-react";

export type BadgeKey = "enquiries" | "staffing" | "candidates" | "orders";

export type AdminNavItem = { label: string; href: string; icon: typeof Inbox; badge?: BadgeKey };

export const adminNav: { group: string; items: AdminNavItem[] }[] = [
  { group: "Overview", items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }] },
  {
    group: "Inbox & Orders",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "orders" },
      { label: "Enquiries", href: "/admin/enquiries", icon: Inbox, badge: "enquiries" },
      { label: "Staffing Requests", href: "/admin/staffing", icon: BriefcaseBusiness, badge: "staffing" },
      { label: "Candidates", href: "/admin/candidates", icon: UserRound, badge: "candidates" },
      { label: "Candidate Matching", href: "/admin/matching", icon: GitCompareArrows },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Spices", href: "/admin/spices", icon: Leaf },
      { label: "Mentorship", href: "/admin/mentorship", icon: GraduationCap },
      { label: "Digital Services", href: "/admin/digital-services", icon: MonitorSmartphone },
    ],
  },
  {
    group: "Website",
    items: [
      { label: "Pages & Content", href: "/admin/pages", icon: FileText },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
