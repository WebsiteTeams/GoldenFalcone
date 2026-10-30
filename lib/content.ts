/**
 * Static marketing content. Copy intentionally avoids unverified claims
 * (certifications, volumes, client names, results). Update once the client confirms details.
 */

export const unsplash = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const images = {
  spicesMarket: unsplash("1532336414038-cf19250c5757"),
  spicesFlatlay: unsplash("1596040033229-a9821ebd058d"),
  spicesDark: unsplash("1509358271058-acd22cc93898"),
  spicesSpoons: unsplash("1506368249639-73a05d6f6488"),
  tradingCandles: unsplash("1611974789855-9c2a0a7236a3"),
  tradingScreen: unsplash("1590283603385-17ffb3a7f29f"),
  tradingDesk: unsplash("1642790106117-e829e14a795f"),
  digitalDevices: unsplash("1547658719-da2b51169166"),
  digitalDashboard: unsplash("1460925895917-afdab827c52f"),
  digitalLaptop: unsplash("1517694712202-14dd9538aa97"),
  digitalWorkspace: unsplash("1498050108023-c5249f4df085"),
  salonInterior: unsplash("1560066984-138dadb4c035"),
  salonChairs: unsplash("1521590832167-7bcbfaa6381f"),
  salonStylist: unsplash("1562322140-8baeececf3df"),
  salonMakeup: unsplash("1487412947147-5cebf100ffc2"),
  salonNails: unsplash("1604654894610-df63bc536371"),
  corporateTowers: unsplash("1486406146926-c627a92ad1ab"),
  corporateOffice: unsplash("1497366216548-37526070297c"),
  collaboration: unsplash("1600880292203-757bb62b4baf"),
} as const;

export type ServiceKey = "spices" | "mentorship" | "digital" | "staffing";

export type Division = {
  key: ServiceKey;
  number: string;
  title: string;
  short: string;
  description: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  highlights: string[];
};

export const divisions: Division[] = [
  {
    key: "spices",
    number: "01",
    title: "Whole Spices Export & Import",
    short: "Spices",
    description:
      "Connecting quality spice sourcing with domestic and international business opportunities.",
    href: "/spices",
    cta: "Explore Spice Trading",
    image: images.spicesMarket,
    imageAlt: "Bowls of assorted whole spices arranged at a market",
    highlights: ["Green Cardamom", "Black Pepper", "Cinnamon", "Cloves", "Dry Ginger"],
  },
  {
    key: "mentorship",
    number: "02",
    title: "Trading Mentorship",
    short: "Mentorship",
    description:
      "Structured learning and practical educational guidance for individuals building their understanding of financial markets.",
    href: "/trading-mentorship",
    cta: "Explore Mentorship",
    image: images.tradingCandles,
    imageAlt: "Candlestick price chart displayed on a dark screen",
    highlights: ["Trading Fundamentals", "Market Basics", "Risk Management Education", "One-to-One Mentorship"],
  },
  {
    key: "digital",
    number: "03",
    title: "Digital Solutions",
    short: "Digital",
    description: "Transforming business ideas into practical, modern digital experiences.",
    href: "/digital-solutions",
    cta: "Explore Digital Solutions",
    image: images.digitalDevices,
    imageAlt: "Desktop monitor, tablet and phone displaying website designs",
    highlights: ["Business Websites", "Landing Pages", "Web Applications", "Booking Systems"],
  },
  {
    key: "staffing",
    number: "04",
    title: "Salon Staffing",
    short: "Staffing",
    description: "Helping salons and beauty businesses connect with skilled professionals.",
    href: "/salon-staffing",
    cta: "Explore Staffing Services",
    image: images.salonChairs,
    imageAlt: "Bright modern salon interior with styling chairs and mirrors",
    highlights: ["Hair Stylists", "Beauticians", "Makeup Artists", "Nail Technicians", "Salon Assistants"],
  },
];

export const serviceOptions: { value: ServiceKey | "general"; label: string }[] = [
  { value: "spices", label: "Whole Spices Export & Import" },
  { value: "mentorship", label: "Trading Mentorship" },
  { value: "digital", label: "Digital Solutions" },
  { value: "staffing", label: "Salon Staffing" },
  { value: "general", label: "General Enquiry" },
];

export type BrandValue = { name: string; text: string };

export const brandValues: BrandValue[] = [
  { name: "Integrity", text: "Clear communication and honest dealings in every conversation, enquiry and agreement." },
  { name: "Loyalty", text: "Long-term relationships with the people and businesses we work alongside." },
  { name: "Respect", text: "Regard for every client, partner and professional — whatever the size of the engagement." },
  { name: "Strength", text: "Steady commitment to doing the work properly, from first enquiry to final delivery." },
  { name: "Legacy", text: "Building something meaningful and lasting, one relationship at a time." },
];

export type Spice = {
  slug: "cardamom" | "pepper" | "cinnamon" | "cloves" | "ginger";
  name: string;
  botanical: string;
  form: string;
  summary: string;
  notes: string[];
};

export const spices: Spice[] = [
  {
    slug: "cardamom",
    name: "Green Cardamom",
    botanical: "Elettaria cardamomum",
    form: "Whole pods",
    summary:
      "Prized for its fresh, floral aroma, green cardamom is used across sweets, beverages, savoury dishes and spice blends.",
    notes: ["Aromatic, floral profile", "Used in food, beverage and blending", "Pod size and grade discussed per enquiry"],
  },
  {
    slug: "pepper",
    name: "Black Pepper",
    botanical: "Piper nigrum",
    form: "Whole peppercorns",
    summary:
      "One of the most widely traded spices in the world, valued for its sharp heat and depth in kitchens and food production.",
    notes: ["Pungent, warming character", "Staple for retail and food processing", "Specifications confirmed per order"],
  },
  {
    slug: "cinnamon",
    name: "Cinnamon",
    botanical: "Cinnamomum spp.",
    form: "Quills & sticks",
    summary:
      "Sweet and woody, cinnamon bark is rolled into quills and used in baking, beverages, confectionery and savoury cooking.",
    notes: ["Sweet, woody aroma", "Quills, sticks or cut pieces", "Variety and length discussed per enquiry"],
  },
  {
    slug: "cloves",
    name: "Cloves",
    botanical: "Syzygium aromaticum",
    form: "Whole dried buds",
    summary:
      "Intensely aromatic dried flower buds, used in spice blends, preserving, baking and traditional preparations.",
    notes: ["Strong, warm aroma", "Used whole or for blending", "Grade and packing confirmed per order"],
  },
  {
    slug: "ginger",
    name: "Dry Ginger",
    botanical: "Zingiber officinale",
    form: "Dried whole rhizome",
    summary:
      "Dried ginger offers a warm, earthy pungency and is used in spice mixes, beverages, baking and food manufacturing.",
    notes: ["Warm, earthy pungency", "Suited to blending and processing", "Form and finish discussed per enquiry"],
  },
];

export const mentorshipTopics = [
  {
    title: "Trading Fundamentals",
    text: "How markets are structured, how orders work, common terminology and the building blocks every learner should understand first.",
  },
  {
    title: "Market Basics",
    text: "Reading price charts, understanding trends and volatility, and learning how news and sentiment can influence markets.",
  },
  {
    title: "Risk Management Education",
    text: "Position sizing, the role of stop-losses, capital preservation and why managing risk matters more than any single trade.",
  },
  {
    title: "One-to-One Mentorship",
    text: "Focused sessions to discuss your learning goals, review concepts and build a structured personal study plan.",
  },
];

export const mentorshipFaqs = [
  {
    q: "Is this financial advice?",
    a: "No. The mentorship is educational only. We do not provide investment advice, trade signals or recommendations to buy or sell any financial instrument.",
  },
  {
    q: "Do I need prior trading experience?",
    a: "No. Learning can begin with the fundamentals. Tell us your current level in the enquiry form so we can discuss a suitable starting point.",
  },
  {
    q: "Can you guarantee that I will make money?",
    a: "No. Trading involves substantial risk, and no education programme can guarantee profits or prevent losses. Any decisions you make with your own capital are your responsibility.",
  },
  {
    q: "How are sessions delivered?",
    a: "Format, schedule and availability are confirmed individually after your enquiry. Share your preferences in the form and we will get back to you.",
  },
  {
    q: "What does the mentorship cost?",
    a: "Fees depend on the format and duration discussed. Details are shared transparently during your consultation, before any commitment.",
  },
];

export const digitalServices = [
  { title: "Corporate & Business Websites", text: "Credible, well-structured websites that present your business clearly and convert visitors into enquiries." },
  { title: "Landing Pages & Portfolios", text: "Focused single-purpose pages for campaigns, launches and personal brands." },
  { title: "Web Applications", text: "Purpose-built browser applications with secure accounts, dashboards and data workflows." },
  { title: "Booking & Management Systems", text: "Appointment, reservation and internal management tools shaped around how you operate." },
  { title: "Custom Business Software", text: "Tailored software to replace spreadsheets, manual processes and disconnected tools." },
  { title: "Maintenance & Basic SEO", text: "Ongoing updates, performance checks, technical SEO foundations and search-ready metadata." },
];

export const digitalProcess = [
  { step: "01", title: "Discover", text: "We understand your business, audience, goals and the problem the project must solve." },
  { step: "02", title: "Plan", text: "Scope, structure, content needs and timeline are agreed before any build begins." },
  { step: "03", title: "Design", text: "Visual direction and layouts are refined with you until they feel right for your brand." },
  { step: "04", title: "Build", text: "Clean, responsive, performance-minded development with regular progress reviews." },
  { step: "05", title: "Launch & Support", text: "Testing, deployment and handover — with maintenance options available afterwards." },
];

export const portfolioConcepts = [
  {
    title: "Corporate Presence",
    category: "Concept · Business website",
    image: images.digitalDevices,
    alt: "Website layouts shown across desktop, tablet and phone",
  },
  {
    title: "Operations Dashboard",
    category: "Concept · Web application",
    image: images.digitalDashboard,
    alt: "Laptop displaying an analytics dashboard",
  },
  {
    title: "Developer Workflow",
    category: "Concept · Custom software",
    image: images.digitalLaptop,
    alt: "Laptop showing source code on a clean desk",
  },
];

export const salonRoles = [
  "Hair Stylist",
  "Beautician",
  "Makeup Artist",
  "Nail Technician",
  "Hair Assistant",
  "Salon Receptionist",
  "Spa & Wellness Therapist",
  "Salon Manager",
  "Salon Assistant",
  "Other",
] as const;

export type SalonRole = (typeof salonRoles)[number];

/** The eight core disciplines presented on the public staffing page. */
export const salonRoleProfiles = [
  {
    name: "Hair Stylist",
    focus: "Cut · Colour · Finish",
    text: "Precision cutting, creative colour, blow-dry finishes and client consultation.",
  },
  {
    name: "Beautician",
    focus: "Skin · Facial · Body",
    text: "Facials, skin care, waxing, threading and grooming treatments.",
  },
  {
    name: "Makeup Artist",
    focus: "Bridal · Editorial · HD",
    text: "Bridal, occasion, HD and airbrush makeup for studio or on-location work.",
  },
  {
    name: "Nail Technician",
    focus: "Manicure · Art · Extensions",
    text: "Manicure, pedicure, nail art and extension services with a finish-first approach.",
  },
  {
    name: "Hair Assistant",
    focus: "Chair-side support",
    text: "Client care, shampoo rituals, preparation and day-to-day salon support.",
  },
  {
    name: "Salon Receptionist",
    focus: "Front desk · Bookings",
    text: "Appointment coordination, billing, client hospitality and reception management.",
  },
  {
    name: "Spa Therapist",
    focus: "Massage · Wellness",
    text: "Spa therapies, body massage and wellness treatments delivered with care.",
  },
  {
    name: "Salon Manager",
    focus: "Team · Operations",
    text: "Team leadership, service standards, inventory and daily salon operations.",
  },
] as const;

export const businessTypes = [
  "Salon",
  "Beauty Parlour",
  "Spa",
  "Makeup Studio",
  "Wellness Centre",
  "Other",
] as const;

export const experienceRequired = [
  "Fresher",
  "1–2 Years",
  "3–5 Years",
  "5+ Years",
  "Flexible",
] as const;

export const employmentTypes = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Freelance",
] as const;

/** Skill categories shown as selectable groups in the candidate form. */
export const skillsByCategory = {
  Hair: [
    "Hair Cutting",
    "Hair Styling",
    "Hair Colouring",
    "Hair Treatment",
    "Hair Straightening",
  ],
  Beauty: ["Facial Treatments", "Skin Care", "Waxing", "Threading", "Bridal Services"],
  Makeup: ["Bridal Makeup", "Party Makeup", "HD Makeup", "Airbrush Makeup"],
  Nail: ["Manicure", "Pedicure", "Nail Art", "Nail Extensions"],
  Spa: ["Spa Therapy", "Body Massage", "Wellness Treatments"],
  Other: ["Customer Handling", "Salon Reception", "Salon Management"],
} as const;

/** Flat list of all predefined skills */
export const allSkills = Object.values(skillsByCategory).flat() as string[];

export const staffingFaqs = [
  {
    q: "How can a salon request staff?",
    a: "Open the hiring requirement form, share your business details and the role you need, then submit. Our team reviews the requirement and contacts you to discuss the next steps.",
  },
  {
    q: "What types of salon professionals can I find?",
    a: "We support hair stylists, beauticians, makeup artists, nail technicians, hair assistants, salon receptionists, spa therapists and salon managers, along with related salon support roles.",
  },
  {
    q: "Can freshers register?",
    a: "Yes. Freshers are welcome. Select your experience level, add the skills you have trained in and include any certificates or practice work that show your ability.",
  },
  {
    q: "Is a resume compulsory?",
    a: "No. A resume is optional, but it helps our team understand your experience and present your profile more clearly. You can also add a short professional introduction.",
  },
  {
    q: "Can candidates upload multiple certificates?",
    a: "Yes. You can upload a resume, multiple professional or training certificates, and optional portfolio images. Each file is stored privately and can be removed before submitting.",
  },
  {
    q: "How does Goldenfalcone connect candidates with salons?",
    a: "Our team reviews both the hiring requirement and candidate profile, identifies potentially suitable matches and coordinates the introduction. We contact both sides before any personal details are shared with a business.",
  },
  {
    q: "Does registration guarantee employment?",
    a: "No. Registration does not guarantee a job, interview or placement. Final interviews, selection and employment terms are decided by the hiring business and the candidate.",
  },
  {
    q: "How can I update my submitted details?",
    a: "Contact our team with your reference number and the details you would like to change. For privacy and security, profile and requirement updates are handled by an authorised administrator.",
  },
];
