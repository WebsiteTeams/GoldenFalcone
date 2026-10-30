import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Brush,
  CheckCircle2,
  Clock,
  Hand,
  HeartHandshake,
  Lock,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import {
  AnimatedButton,
  ImageReveal,
  RevealUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations";
import { SalonStaffingForms } from "@/components/forms/SalonStaffingForms";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Accordion } from "@/components/ui/Accordion";
import { images, staffingFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/cms";

export const generateMetadata = () =>
  pageMetadata("staffing", {
    title: "Salon Staff Recruitment",
    description:
      "Goldenfalcone connects salons, beauty studios and wellness businesses with skilled hair stylists, beauticians, makeup artists, nail technicians and salon professionals.",
    alternates: { canonical: "/salon-staffing" },
    openGraph: {
      title: "Salon Staffing & Recruitment | Goldenfalcone",
      url: "/salon-staffing",
    },
  });

const roleCategories = [
  {
    icon: Scissors,
    title: "Hair Stylists",
    text: "Precision cutting, balayage, creative colouring, keratin smoothing, and modern styling.",
    number: "01",
  },
  {
    icon: Sparkles,
    title: "Beauticians",
    text: "Clinical and organic facials, skin diagnosis, body care, threading, and waxing.",
    number: "02",
  },
  {
    icon: Brush,
    title: "Makeup Artists",
    text: "Bridal transformations, airbrush techniques, occasion aesthetics, and high-fashion editorial.",
    number: "03",
  },
  {
    icon: Hand,
    title: "Nail Technicians",
    text: "Classic manicure & pedicure, gel extensions, acrylic sculpting, and bespoke nail artistry.",
    number: "04",
  },
  {
    icon: UserRound,
    title: "Hair Assistants",
    text: "Client greeting, shampoo ritual care, sectioning, product prep, and daily chair support.",
    number: "05",
  },
  {
    icon: Store,
    title: "Salon Receptionists",
    text: "Front-desk hospitality, appointment coordination, billing management, and client relationships.",
    number: "06",
  },
  {
    icon: HeartHandshake,
    title: "Spa & Wellness Therapists",
    text: "Holistic massage rituals, body polishes, aromatherapy, and therapeutic wellness care.",
    number: "07",
  },
  {
    icon: Users,
    title: "Salon Managers",
    text: "Operational leadership, inventory oversight, revenue tracking, and team development.",
    number: "08",
  },
];

const hiringSteps = [
  {
    step: "01",
    title: "Submit your requirement",
    text: "Specify the exact roles, required techniques, vacancy count, experience expectations, and remuneration bracket.",
  },
  {
    step: "02",
    title: "Goldenfalcone reviews your requirement",
    text: "Our staffing specialists review your criteria, verify specific treatment requirements, and connect with you to align on timelines.",
  },
  {
    step: "03",
    title: "Suitable candidate profiles are identified",
    text: "We cross-reference our vetted talent database, matching candidates based on verified skills, location, and aesthetic standard.",
  },
  {
    step: "04",
    title: "The hiring business is contacted to coordinate next steps",
    text: "Curated candidate dossiers are shared with your consent. Interviews, trials, and final hiring determinations remain entirely between you and the candidate.",
  },
];

const candidateSteps = [
  {
    step: "01",
    title: "Create your professional profile",
    text: "Register your contact details, current geographic location, preferred work areas, and core beauty discipline.",
  },
  {
    step: "02",
    title: "Add your skills and experience",
    text: "Detail your background, tenure, brand training, and select specific service capabilities across our skills matrix.",
  },
  {
    step: "03",
    title: "Upload your resume and certificates",
    text: "Attach your CV, academy diplomas, brand certifications, and visual portfolio to substantiate your artistry.",
  },
  {
    step: "04",
    title: "Submit your profile for review",
    text: "Our team reviews your credentials and records your reference ID into our private recruitment network.",
  },
  {
    step: "05",
    title: "Goldenfalcone may contact you about suitable opportunities",
    text: "When a matching salon opening emerges, we coordinate a discreet introduction. We do not promise guaranteed placement or instant hiring.",
  },
];

const whyChoosePoints = [
  {
    icon: Store,
    title: "Industry-focused recruitment",
    text: "Built exclusively for the salon, spa, and beauty industry with deep appreciation for artistic technique and salon culture.",
  },
  {
    icon: Scissors,
    title: "Multiple beauty and salon job categories",
    text: "From master hair colourists and aesthetic therapists to front-desk managers and support assistants.",
  },
  {
    icon: UserCheck,
    title: "Structured candidate profiles",
    text: "Every submission contains categorized skills, documented experience, salary expectations, and verified contact identity.",
  },
  {
    icon: Award,
    title: "Skills and certificate-based evaluation",
    text: "We prioritize documented credentials, academy training, and actual client artistry rather than vague resumes.",
  },
  {
    icon: ShieldCheck,
    title: "Support for both businesses and job seekers",
    text: "Clear, respectful communication with both salon owners and aspiring candidates throughout the introduction process.",
  },
  {
    icon: Clock,
    title: "A straightforward recruitment coordination process",
    text: "A direct, human-driven workflow without automated algorithms obscuring authentic talent or genuine salon needs.",
  },
];

export default function SalonStaffingPage() {
  return (
    <>
      {/* ── 1. Hero Section ── */}
      <PageHero
        eyebrow="Division 04 · Salon Staffing & Recruitment"
        title={["Find the Right Talent.", "Build a Stronger Beauty Team."]}
        intro="Goldenfalcone connects salons, beauty studios and wellness businesses with skilled beauty professionals. Whether you're building your team or looking for your next opportunity, we help bring the right people together."
        image={images.salonChairs}
        imageAlt="Modern premium salon interior with styling chairs, mirrors and warm lighting"
        actions={
          <>
            <AnimatedButton href="#salon-owners">Hire Salon Professionals</AnimatedButton>
            <AnimatedButton href="#candidates" variant="outline-light" arrow={false}>
              Find a Job
            </AnimatedButton>
          </>
        }
      />

      {/* ── Editorial Brand Strip ── */}
      <div className="border-b border-line/70 bg-white py-5">
        <div className="container-lux flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="eyebrow flex items-center justify-center gap-2.5 text-gold-dark sm:justify-start">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            Connecting Beauty Businesses with Skilled Professionals
          </p>
          <div className="flex items-center gap-6 text-xs text-muted">
            <span>Discreet & Confidential</span>
            <span className="h-3 w-px bg-line" aria-hidden />
            <span>Human-Curated Matches</span>
            <span className="h-3 w-px bg-line" aria-hidden />
            <span>Verified Credentials</span>
          </div>
        </div>
      </div>

      {/* ── 2. About the Staffing Service ("People Make the Difference") ── */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-lux">
          {/* Header & Philosophy */}
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="The Goldenfalcone Philosophy"
                title={["People Make", "the Difference."]}
              />
              <RevealUp delay={0.15} className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                <p>
                  Running a successful salon requires more than great services. It takes talented
                  professionals, reliable support staff and a team that understands quality and
                  customer care.
                </p>
                <p className="mt-4">
                  Goldenfalcone helps businesses discover suitable candidates while giving beauty
                  professionals a platform to present their experience and skills.
                </p>
              </RevealUp>
            </div>

            <div className="lg:col-span-5">
              <RevealUp delay={0.25} className="rounded-2xl border border-line/80 bg-white p-7 shadow-xs">
                <p className="eyebrow text-gold-dark">Our Guarantee to You</p>
                <h4 className="mt-2 font-serif text-2xl text-forest">Honest, Human Coordination</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  We believe in transparency. We do not claim automated matching or guaranteed placements.
                  Instead, every salon requirement and candidate profile is individually reviewed by
                  people who understand salon operations.
                </p>
              </RevealUp>
            </div>
          </div>

          {/* 8 Service Categories Showcase */}
          <div className="mt-20">
            <RevealUp className="mb-8 flex items-center justify-between border-b border-line pb-4">
              <p className="eyebrow text-gold-dark">Specialized Disciplines</p>
              <span className="text-xs text-muted">8 Recruitment Categories</span>
            </RevealUp>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {roleCategories.map(({ icon: Icon, title, text, number }) => (
                <StaggerItem
                  key={title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-ivory text-forest transition-colors duration-300 group-hover:border-gold/40 group-hover:bg-forest group-hover:text-gold">
                        <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <span className="font-serif text-xs font-semibold text-gold-dark/60">
                        {number}
                      </span>
                    </div>
                    <h3 className="mt-6 font-serif text-2xl text-forest group-hover:text-gold-dark transition-colors">
                      {title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-muted">{text}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-line/40 flex items-center justify-between text-[0.7rem] font-semibold text-forest">
                    <span>Recruiting Now</span>
                    <ArrowRight className="h-3 w-3 text-gold-dark transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ── 3. Visual Breakout & Dual Pathways ── */}
      <section className="border-y border-line/80 bg-white py-24 sm:py-32">
        <div className="container-lux">
          <SectionHeading
            align="center"
            eyebrow="Two Distinct Pathways"
            title={["Tailored for Business.", "Crafted for Talent."]}
            intro="Select the recruitment track that aligns with your immediate objectives."
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {/* For Salon Owners Card */}
            <RevealUp delay={0.1}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-ivory transition-all duration-500 hover:border-gold/60 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={images.salonInterior}
                    alt="Elegant modern salon styling stations with warm lighting"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                  <span className="absolute bottom-6 left-6 rounded-full border border-gold/40 bg-forest/90 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-xs">
                    For Salon Owners & Operators
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-8 sm:p-10">
                  <h3 className="font-serif text-3xl text-forest sm:text-4xl">
                    Find the Right People for Your Business
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                    Tell us what your salon needs. Whether you are expanding to a new branch, filling
                    a single senior chair, or staffing a complete spa facility, we help identify
                    and introduce verified talent.
                  </p>

                  <ul className="my-6 space-y-2.5 text-xs text-ink/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                      Specify exact brand techniques & certifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                      Candidate portfolios & verified background notes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                      Full discretion & direct coordinator follow-up
                    </li>
                  </ul>

                  <Link
                    href="#salon-owners"
                    className="mt-2 inline-flex items-center justify-between rounded-xl border border-forest bg-forest px-6 py-4 text-sm font-semibold text-ivory transition-colors hover:bg-emerald"
                  >
                    <span>Submit Hiring Requirement</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </RevealUp>

            {/* For Candidates Card */}
            <RevealUp delay={0.2}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-ivory transition-all duration-500 hover:border-gold/60 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={images.salonStylist}
                    alt="Professional hair stylist consulting with a client in a luxury studio"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
                  <span className="absolute bottom-6 left-6 rounded-full border border-gold/40 bg-forest/90 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur-xs">
                    For Beauty & Wellness Professionals
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-8 sm:p-10">
                  <h3 className="font-serif text-3xl text-forest sm:text-4xl">
                    Showcase Your Skills. Discover New Opportunities.
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                    Create your professional profile so salons and beauty businesses can understand
                    your skills, experience and qualifications. Present your diplomas and client
                    portfolio securely.
                  </p>

                  <ul className="my-6 space-y-2.5 text-xs text-ink/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                      Direct representation to premier salons & aesthetic spas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                      Secure document vault (CV, certificates, & photos)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                      Zero registration fees for candidates
                    </li>
                  </ul>

                  <Link
                    href="#candidates"
                    className="mt-2 inline-flex items-center justify-between rounded-xl border border-line bg-white px-6 py-4 text-sm font-semibold text-forest transition-colors hover:border-gold hover:text-gold-dark"
                  >
                    <span>Register as a Candidate</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </RevealUp>
          </div>
        </div>
      </section>

      {/* ── 4. How the Service Works (Two-Path Process) ── */}
      <section className="bg-forest py-24 text-ivory sm:py-32">
        <div className="container-lux">
          <SectionHeading
            align="center"
            tone="light"
            eyebrow="Operational Process"
            title={["How the Service Works"]}
            intro="A clear, structured two-path coordination process without false promises or automated filters."
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {/* For Hiring Businesses */}
            <div className="rounded-[2rem] border border-ivory/15 bg-emerald/30 p-8 sm:p-10 backdrop-blur-xs">
              <div className="flex items-center gap-3 border-b border-ivory/10 pb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-forest text-gold">
                  <Store className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl text-ivory">For Hiring Businesses</h3>
                  <p className="text-xs text-gold">4-Step Talent Acquisition</p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {hiringSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <span className="font-serif text-3xl font-light text-gold shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <h4 className="font-serif text-xl text-ivory">{s.title}</h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-ivory/70">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Candidates */}
            <div className="rounded-[2rem] border border-ivory/15 bg-emerald/30 p-8 sm:p-10 backdrop-blur-xs">
              <div className="flex items-center gap-3 border-b border-ivory/10 pb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-forest text-gold">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl text-ivory">For Candidates</h3>
                  <p className="text-xs text-gold">5-Step Career Placement</p>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {candidateSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <span className="font-serif text-3xl font-light text-gold shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <h4 className="font-serif text-xl text-ivory">{s.title}</h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-ivory/70">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-gold/30 bg-forest/60 p-6 text-center text-xs text-ivory/75">
            <p>
              <strong className="text-gold">Transparency Note:</strong> Goldenfalcone facilitates
              recruitment introductions between hiring businesses and qualified beauty professionals.
              Submitting a profile or requirement does not promise instant hiring or guaranteed
              placements. Final selection and employment terms remain exclusively an agreement between
              the salon and the candidate.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Main Recruitment Gateway (Forms Section) ── */}
      <section className="relative bg-ivory py-24 sm:py-32">
        <span id="salon-owners" className="absolute top-0 scroll-mt-20" aria-hidden />
        <span id="candidates" className="absolute top-0 scroll-mt-20" aria-hidden />

        <div className="container-lux">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left Column: Context, Trust, & Assistance */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <SectionHeading
                  eyebrow="Recruitment Portal"
                  title={["Let's Find the", "Right Fit."]}
                  intro="Choose your journey and submit your details. Fields marked with an asterisk (*) are mandatory."
                />

                {/* Confidentiality & Security Card */}
                <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <Lock className="h-5 w-5 shrink-0 text-gold-dark mt-0.5" aria-hidden />
                    <div>
                      <h4 className="text-sm font-semibold text-forest">Privacy & Discretion Guaranteed</h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        All contact details, candidate CVs, and salon requirements are securely stored
                        and handled strictly for recruitment purposes. Candidate profiles are shared
                        only with explicit mutual consent.
                      </p>
                      <Link
                        href="/privacy-policy"
                        className="mt-3 inline-block text-xs font-semibold text-forest underline decoration-gold/60 underline-offset-2"
                      >
                        Read our Privacy Policy →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Direct Coordinator Contact */}
                <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
                  <h4 className="text-sm font-semibold text-forest">Need Direct Assistance?</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    Have questions regarding custom staffing packages, bulk team hiring, or special
                    aesthetic requirements? Speak directly with our team.
                  </p>
                  <div className="mt-4">
                    <WhatsAppButton
                      message="Hello Goldenfalcone, I have a staffing enquiry."
                      label="Chat with Staffing Team"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Tabbed Form Container */}
            <div className="lg:col-span-8">
              <div className="rounded-[2rem] border border-line bg-white p-6 shadow-sm sm:p-10">
                <SalonStaffingForms />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Why Choose Goldenfalcone ── */}
      <section className="border-t border-line/80 bg-ivory-dark/40 py-24 sm:py-32">
        <div className="container-lux">
          <SectionHeading
            align="center"
            eyebrow="The Goldenfalcone Standard"
            title={["A Better Way to", "Build Your Beauty Team"]}
            intro="We combine aesthetic industry knowledge with rigorous, structured recruitment coordination."
          />

          <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChoosePoints.map(({ icon: Icon, title, text }) => (
              <StaggerItem
                key={title}
                className="rounded-2xl border border-line bg-white p-8 transition-all duration-300 hover:border-gold/50 hover:shadow-xs"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-ivory text-gold-dark">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-serif text-2xl text-forest">{title}</h3>
                <p className="mt-2.5 text-xs leading-relaxed text-muted">{text}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── 7. Frequently Asked Questions ── */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-lux grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <SectionHeading
                eyebrow="Clarity & Protocol"
                title={["Frequently", "Asked Questions"]}
                intro="Common inquiries from salon owners and beauty professionals."
              />
              <div className="mt-8 rounded-2xl border border-line bg-ivory p-6">
                <p className="text-xs leading-relaxed text-muted">
                  Have a specific question not covered here? Reach out to our concierge team directly.
                </p>
                <div className="mt-4">
                  <WhatsAppButton
                    message="Hello Goldenfalcone, I have a question about salon recruitment."
                    label="Ask a Question"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <RevealUp delay={0.1}>
              <Accordion items={staffingFaqs} />
            </RevealUp>
          </div>
        </div>
      </section>

      {/* ── 8. Final Luxury CTA ── */}
      <section className="relative overflow-hidden bg-forest py-28 text-ivory sm:py-36">
        <div className="container-lux relative z-10 text-center">
          <RevealUp>
            <p className="eyebrow text-gold mb-6">Start Today</p>
            <h2 className="font-serif text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl">
              Let&apos;s Build Better<br className="hidden sm:block" /> Beauty Teams Together.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg">
              Whether you&apos;re hiring skilled professionals or searching for your next opportunity,
              start with Goldenfalcone.
            </p>
          </RevealUp>

          <RevealUp delay={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <AnimatedButton href="#salon-owners">Submit Hiring Requirement</AnimatedButton>
            <AnimatedButton href="#candidates" variant="outline-light" arrow={false}>
              Register as a Candidate
            </AnimatedButton>
          </RevealUp>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-ivory/50">
            <span>Verified Candidate Dossiers</span>
            <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
            <span>Encrypted Document Vault</span>
            <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
            <span>Dedicated Coordination Support</span>
          </div>
        </div>
      </section>
    </>
  );
}
