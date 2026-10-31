import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  ChartColumn,
  Code2,
  Compass,
  Database,
  FlaskConical,
  LayoutTemplate,
  LifeBuoy,
  MessagesSquare,
  MonitorSmartphone,
  PackageSearch,
  PenTool,
  Plug,
  Puzzle,
  Rocket,
  Server,
  Target,
  UserCog,
  Users,
  Workflow,
} from "lucide-react";
import type { DigitalProjectType } from "@/lib/admin/constants";

export type ServiceKey = "website" | "mobile" | "webapp" | "custom";

export const serviceProjectType: Record<ServiceKey, DigitalProjectType> = {
  website: "Website Development",
  mobile: "Mobile App Development",
  webapp: "Web Application Development",
  custom: "Custom Software Development",
};

/** Opens the enquiry form with the matching project type already selected. */
export const enquiryHref = (service: ServiceKey) => `/digital-solutions?service=${service}#project-enquiry`;

export const services: Record<ServiceKey, { id: string; title: string; description: string; capabilities: string[]; cta: string }> = {
  website: {
    id: "website-development",
    title: "Website Development",
    description: "Professional, responsive websites that establish your digital presence and help convert visitors into customers.",
    capabilities: [
      "Business and corporate websites",
      "Landing pages and portfolio websites",
      "E-commerce websites",
      "School, resort and real-estate websites",
      "Booking and enquiry websites",
      "Website maintenance and improvements",
    ],
    cta: "Explore Website Development",
  },
  mobile: {
    id: "mobile-app-development",
    title: "Mobile App Development",
    description: "Mobile applications that help businesses connect with customers and deliver services through convenient digital experiences.",
    capabilities: [
      "Android application development",
      "Customer and business applications",
      "Booking and service applications",
      "User authentication and profiles",
      "API and backend integration",
      "Application deployment and maintenance",
    ],
    cta: "Explore Mobile App Development",
  },
  webapp: {
    id: "web-application-development",
    title: "Web Application Development",
    description: "Custom web-based platforms that simplify business operations, manage information and connect teams through a central system.",
    capabilities: [
      "Admin dashboards",
      "Customer and employee portals",
      "Booking and reservation platforms",
      "CRM and lead management systems",
      "Inventory and business management",
      "Attendance and task management",
      "Reports and analytics dashboards",
    ],
    cta: "Explore Web Application Development",
  },
  custom: {
    id: "custom-software-development",
    title: "Custom Software Development",
    description: "Purpose-built software solutions designed around your organisation's workflows, business requirements and operational needs.",
    capabilities: [
      "Business management systems",
      "Billing and invoicing software",
      "Employee and task management",
      "CRM and inventory solutions",
      "Booking and reservation systems",
      "Custom admin panels",
      "Third-party API integrations",
    ],
    cta: "Discuss Custom Software",
  },
};

export const solutions: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Customer Management", text: "Manage customer information and enquiries.", icon: Users },
  { title: "Booking Management", text: "Organise appointments, reservations and service requests.", icon: CalendarCheck },
  { title: "Employee Management", text: "Manage employee information, attendance and tasks.", icon: UserCog },
  { title: "Sales & Inventory", text: "Organise products, inventory and business operations.", icon: PackageSearch },
  { title: "Business Automation", text: "Reduce repetitive manual work through digital workflows.", icon: Workflow },
  { title: "Analytics & Reporting", text: "Understand business performance through organised data.", icon: ChartColumn },
];

export const processSteps: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Discovery & Consultation", text: "Understand the business, objectives, users and requirements.", icon: MessagesSquare },
  { title: "Planning & Architecture", text: "Define project scope, features, workflows and technical approach.", icon: Compass },
  { title: "UI/UX Design", text: "Create clear, user-friendly, responsive interface designs.", icon: PenTool },
  { title: "Development", text: "Build the frontend, backend, database and integrations.", icon: Code2 },
  { title: "Testing & Quality Assurance", text: "Test functionality, responsiveness, validation and reliability.", icon: FlaskConical },
  { title: "Deployment & Support", text: "Deploy the completed solution and provide agreed maintenance and support.", icon: Rocket },
];

/**
 * Only technologies verified in this codebase are listed. Add others here (for example Express.js,
 * MySQL or a payment gateway) once the team confirms it delivers them.
 */
export const technologies: { group: string; icon: LucideIcon; items: string[] }[] = [
  { group: "Frontend", icon: LayoutTemplate, items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { group: "Backend", icon: Server, items: ["Node.js", "REST APIs"] },
  { group: "Database", icon: Database, items: ["MongoDB"] },
  { group: "Integrations", icon: Plug, items: ["WhatsApp integrations", "Third-party API integrations"] },
];

export const benefits: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Business-Focused Approach", text: "Solutions designed around actual business requirements.", icon: Target },
  { title: "Custom-Built Experiences", text: "Features and workflows tailored to each project.", icon: Puzzle },
  { title: "Responsive & User-Friendly", text: "Experiences designed for desktop, tablet and mobile.", icon: MonitorSmartphone },
  { title: "Continued Support", text: "Assistance based on the agreed maintenance and support scope.", icon: LifeBuoy },
];

export const faqs = [
  {
    q: "What types of digital solutions do you develop?",
    a: "We develop websites, mobile applications, web applications and custom business software, each planned around your requirements.",
  },
  {
    q: "Can you develop a website according to my business requirements?",
    a: "Yes. The structure, content, design and features are planned around your business and the customers you want to reach.",
  },
  {
    q: "Do you develop Android mobile applications?",
    a: "Yes. We develop Android applications for customers and businesses, including booking, service and account features with backend integration.",
  },
  {
    q: "What is the difference between a website and a web application?",
    a: "A website mainly presents information about your business. A web application is an interactive system people sign in to and work in, such as a dashboard, portal or booking platform.",
  },
  {
    q: "Can you build custom admin dashboards and management systems?",
    a: "Yes. We build dashboards and systems for managing customers, bookings, employees, inventory, tasks and reports, based on how your organisation works.",
  },
  {
    q: "Can you integrate payment gateways and third-party APIs?",
    a: "Yes, where a project needs them. The services to integrate are confirmed during planning, based on your requirements and each provider's availability.",
  },
  {
    q: "How do I start a digital development project?",
    a: "Share your requirements through the project enquiry form on this page. Our team will review them and contact you to discuss the next steps.",
  },
  {
    q: "Do you provide website and application maintenance?",
    a: "Yes. Maintenance and support are available after deployment, based on the scope agreed for your project.",
  },
];
