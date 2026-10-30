import Link from "next/link";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Scissors,
  ShieldCheck,
  Store,
  UserCheck,
  UserRound,
} from "lucide-react";
import { AnimatedButton, RevealUp, StaggerContainer, StaggerItem, StaggerList, StaggerListItem } from "@/components/animations";
import { SalonStaffingForms, type StaffingFormKey } from "@/components/forms/SalonStaffingForms";
import { StaffingRolesCarousel } from "@/components/sections/StaffingRolesCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { images, salonRoleProfiles, staffingFaqs } from "@/lib/content";
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

const hiringSteps = [
  {
    title: "Submit the requirement",
    text: "Tell us the role, the techniques that matter, how many people you need and the terms you can offer.",
  },
  {
    title: "We review it personally",
    text: "A staffing specialist checks the brief, clarifies anything unclear and agrees a realistic timeline with you.",
  },
  {
    title: "Suitable profiles are identified",
    text: "We look through our private candidate network for people whose skills, experience and location genuinely fit.",
  },
  {
    title: "You decide the next step",
    text: "We contact you before any profile is introduced. Interviews, trials and final hiring terms remain between you and the candidate.",
  },
];

const candidateSteps = [
  {
    title: "Build your private profile",
    text: "Add your contact details, current location and the areas you would consider working in.",
  },
  {
    title: "Show your craft",
    text: "Select your discipline, the services you can deliver confidently and the experience you have gained.",
  },
  {
    title: "Add documents if you wish",
    text: "A resume, academy certificates and portfolio images are optional, stored privately and never published.",
  },
  {
    title: "Submit for review",
    text: "Our team reads your profile and records your reference number. Nothing is shared without speaking to you first.",
  },
  {
    title: "We may contact you",
    text: "If a salon opening looks like a genuine fit, we get in touch. Registration never guarantees a job or placement.",
  },
];

const reasons = [
  {
    icon: Store,
    title: "Built only for beauty",
    text: "Salons, spas, studios and wellness businesses — we understand the roles, the rhythm of the floor and what a strong team actually needs.",
  },
  {
    icon: Scissors,
    title: "Every discipline covered",
    text: "Hair, beauty, makeup, nails, spa and salon operations, from assistants and receptionists to senior stylists and managers.",
  },
  {
    icon: UserCheck,
    title: "Profiles with substance",
    text: "Skills are categorised, experience is stated plainly and documents are optional but welcome. No vague one-line applications.",
  },
  {
    icon: ShieldCheck,
    title: "Discretion first",
    text: "Candidate documents and contact details stay private. We speak to both sides before any introduction is made.",
  },
  {
    icon: Clock,
    title: "A human-paced process",
    text: "No automated matching engine decides your shortlist. A person reviews the brief, the profile and the fit.",
  },
  {
    icon: Lock,
    title: "No false promises",
    text: "We do not guarantee placements or instant hiring. We do commit to clear communication and an honest assessment.",
  },
];

const FORM_HIRING = "/salon-staffing?form=hiring#staffing-forms";
const FORM_CANDIDATE = "/salon-staffing?form=candidate#staffing-forms";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SalonStaffingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.form) ? params.form[0] : params.form;
  const initialForm: StaffingFormKey = requested === "candidate" ? "candidate" : "hiring";

  return (
    <>
      {/* ── 01 · Editorial hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line/80 bg-ivory pb-16 pt-28 sm:pb-24 sm:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 top-16 hidden h-72 w-72 rounded-full border border-gold/15 lg:block"
        />
        <div className="container-lux">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <RevealUp distance={12}>
                <p className="eyebrow flex items-center gap-3 text-gold-dark">
                  <span aria-hidden className="h-px w-10 bg-gold" />
                  Salon Staffing · Division 04
                </p>
              </RevealUp>

              <RevealUp delay={0.08}>
                <h1 className="mt-6 max-w-[18ch] font-serif text-[2.9rem] leading-[0.98] text-forest sm:text-6xl lg:text-[4.6rem]">
                  The right people make a salon.{" "}
                  <em className="font-light italic text-gold-dark">Everything else follows.</em>
                </h1>
              </RevealUp>

              <RevealUp delay={0.16}>
                <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                  Goldenfalcone brings salons, spas and beauty studios together with skilled professionals —
                  carefully, privately and with a real person reading every brief.
                </p>
              </RevealUp>

              <RevealUp delay={0.24} className="mt-9 flex flex-wrap gap-4">
                <AnimatedButton href={FORM_HIRING}>I Need Salon Staff</AnimatedButton>
                <AnimatedButton href={FORM_CANDIDATE} variant="outline-dark">
                  I&apos;m Looking for a Job
                </AnimatedButton>
              </RevealUp>

              <RevealUp delay={0.32}>
                <dl className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-line border-t border-line pt-6 text-left">
                  {[
                    ["8", "core disciplines"],
                    ["1:1", "human review"],
                    ["100%", "private documents"],
                  ].map(([value, label]) => (
                    <div key={label} className="px-4 first:pl-0 last:pr-0">
                      <dt className="font-serif text-2xl text-forest sm:text-3xl">{value}</dt>
                      <dd className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted">{label}</dd>
                    </div>
                  ))}
                </dl>
              </RevealUp>
            </div>

            <div className="lg:col-span-5">
              <RevealUp delay={0.18} className="relative mx-auto max-w-md lg:mr-0">
                <div aria-hidden className="absolute -left-4 -top-4 hidden h-full w-full border border-gold/35 sm:block" />
                <figure className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory-dark">
                    <Image
                      src={images.salonStylist}
                      alt="A stylist working with a client in a calm, modern salon"
                      fill
                      priority
                      sizes="(min-width: 1024px) 32vw, 90vw"
                      className="object-cover"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest/55 via-transparent to-transparent" />
                  </div>
                  <figcaption className="absolute inset-x-5 bottom-5 border border-ivory/25 bg-forest/85 px-5 py-4 text-ivory backdrop-blur-sm">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">
                      Human-reviewed introductions
                    </p>
                    <p className="mt-1.5 font-serif text-xl leading-snug">
                      Hair · Beauty · Makeup · Nails · Spa
                    </p>
                  </figcaption>
                </figure>
                <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted">
                  <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                  Candidate documents are stored privately. Contact details are shared only after a conversation.
                </p>
              </RevealUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial ribbon ────────────────────────────────────────────── */}
      <div className="border-b border-line/70 bg-white">
        <div className="container-lux flex flex-col gap-3 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="eyebrow text-gold-dark">Connecting beauty businesses with skilled professionals</p>
          <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted">
            <span>Discreet by default</span>
            <span aria-hidden className="hidden h-3 w-px bg-line sm:block" />
            <span>Reviewed by people</span>
            <span aria-hidden className="hidden h-3 w-px bg-line sm:block" />
            <span>No registration fee for candidates</span>
          </p>
        </div>
      </div>

      {/* ── 02 · Two journeys ───────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-lux">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="Two ways in"
                title={["Start where", "you stand."]}
                intro="One careful process, seen from two sides. Choose the route that matches what you need today."
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted lg:col-span-5 lg:justify-self-end">
              Both journeys lead to the same team. We read every submission, ask questions where needed, and never
              pass details across without consent.
            </p>
          </div>

          <div className="mt-14 grid border-y border-line lg:grid-cols-2">
            <RevealUp className="group flex flex-col border-b border-line px-6 py-9 transition-colors duration-300 hover:bg-ivory sm:px-9 lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow text-gold-dark">For salons &amp; studios</p>
                  <h3 className="mt-3 max-w-sm font-serif text-3xl leading-tight text-forest sm:text-4xl">
                    I need salon staff
                  </h3>
                </div>
                <span aria-hidden className="font-serif text-5xl leading-none text-line transition-colors group-hover:text-gold/50">
                  01
                </span>
              </div>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                Tell us about the chair you need to fill. Share the role, the skills that matter, the salary band and
                the kind of salon culture the person will walk into.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
                {["One brief, however many hires", "Profiles matched to your terms", "You approve every introduction"].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href={FORM_HIRING}
                className="mt-8 inline-flex items-center gap-3 self-start border-b border-forest/25 pb-1 text-sm font-semibold text-forest transition-colors hover:border-gold hover:text-gold-dark"
              >
                Submit a hiring requirement
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </RevealUp>

            <RevealUp delay={0.1} className="group flex flex-col px-6 py-9 transition-colors duration-300 hover:bg-ivory sm:px-9">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow text-gold-dark">For beauty professionals</p>
                  <h3 className="mt-3 max-w-sm font-serif text-3xl leading-tight text-forest sm:text-4xl">
                    I&apos;m looking for a job
                  </h3>
                </div>
                <span aria-hidden className="font-serif text-5xl leading-none text-line transition-colors group-hover:text-gold/50">
                  02
                </span>
              </div>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                Present your craft properly. Add your specialities, your experience and, if you have them, the
                certificates and client work that show what you can do.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
                {["A private profile, not a public listing", "Documents kept under lock", "Contacted only with your consent"].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href={FORM_CANDIDATE}
                className="mt-8 inline-flex items-center gap-3 self-start border-b border-forest/25 pb-1 text-sm font-semibold text-forest transition-colors hover:border-gold hover:text-gold-dark"
              >
                Create your professional profile
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </RevealUp>
          </div>
        </div>
      </section>

      {/* ── 03 · Roles ──────────────────────────────────────────────────── */}
      <section className="border-y border-line/80 bg-ivory py-20 sm:py-28">
        <div className="container-lux">
          <div className="border-b border-line pb-8">
            <SectionHeading
              eyebrow="Who we place"
              title={["Eight disciplines.", "One standard."]}
              intro="The core roles we recruit for across salons, spas, makeup studios and wellness businesses."
            />
          </div>

          <StaffingRolesCarousel roles={salonRoleProfiles} />

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-relaxed text-muted">
              Also placing salon assistants, front-desk coordinators and other support roles. If your requirement sits
              slightly outside this list, describe it in the form.
            </p>
            <Link
              href={FORM_HIRING}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-gold-dark"
            >
              Discuss a role <ArrowDownRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 04 · Two workflows ──────────────────────────────────────────── */}
      <section className="bg-forest py-20 text-ivory sm:py-28">
        <div className="container-lux">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <SectionHeading
                tone="light"
                eyebrow="How it works"
                title={["A short brief.", "A considered introduction."]}
                intro="No automated shortlists and no promises we cannot keep. Just a clear sequence, from first message to final decision."
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ivory/65 lg:col-span-5 lg:justify-self-end">
              Interviews, trials and employment terms are always agreed directly between the salon and the candidate.
              Goldenfalcone coordinates the introduction, not the outcome.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3 border-b border-ivory/15 pb-4">
                <Store aria-hidden className="h-4.5 w-4.5 text-gold" />
                <h3 className="font-serif text-2xl">If you are hiring</h3>
                <span className="ml-auto text-[0.65rem] uppercase tracking-[0.18em] text-gold">4 steps</span>
              </div>
              <StaggerList className="mt-2">
                {hiringSteps.map((step, i) => (
                  <StaggerListItem key={step.title} className="flex gap-5 border-b border-ivory/10 py-6">
                    <span aria-hidden className="font-serif text-2xl text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h4 className="font-serif text-xl text-ivory">{step.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-ivory/65">{step.text}</p>
                    </div>
                  </StaggerListItem>
                ))}
              </StaggerList>
              <Link
                href={FORM_HIRING}
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-champagne"
              >
                I Need Salon Staff <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-3 border-b border-ivory/15 pb-4">
                <UserRound aria-hidden className="h-4.5 w-4.5 text-gold" />
                <h3 className="font-serif text-2xl">If you are looking</h3>
                <span className="ml-auto text-[0.65rem] uppercase tracking-[0.18em] text-gold">5 steps</span>
              </div>
              <StaggerList className="mt-2">
                {candidateSteps.map((step, i) => (
                  <StaggerListItem key={step.title} className="flex gap-5 border-b border-ivory/10 py-6">
                    <span aria-hidden className="font-serif text-2xl text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h4 className="font-serif text-xl text-ivory">{step.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-ivory/65">{step.text}</p>
                    </div>
                  </StaggerListItem>
                ))}
              </StaggerList>
              <Link
                href={FORM_CANDIDATE}
                className="mt-7 inline-flex items-center gap-3 rounded-full border border-champagne/45 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-gold hover:text-champagne"
              >
                I&apos;m Looking for a Job <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <p className="mt-12 max-w-3xl border-l border-gold/50 pl-5 text-xs leading-relaxed text-ivory/55">
            <strong className="font-semibold text-champagne">A note on honesty.</strong> Submitting a requirement or a
            profile does not guarantee a hire, interview or placement. We facilitate introductions; the decision stays
            with the salon and the professional.
          </p>
        </div>
      </section>

      {/* ── 05 · Main forms ─────────────────────────────────────────────── */}
      <section id="staffing-forms" className="scroll-mt-24 bg-white py-20 sm:py-28">
        <div className="container-lux">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow text-gold-dark">Recruitment portal</p>
                <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-forest sm:text-5xl">
                  Choose your <em className="font-light italic text-gold-dark">route.</em>
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
                  Two journeys, one form area. The tab you choose is reflected in the address bar, so you can return to
                  the same form later or send the link to a colleague.
                </p>

                <div className="mt-8 space-y-5 border-t border-line pt-6">
                  <div className="flex items-start gap-3.5">
                    <Lock aria-hidden className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" />
                    <div>
                      <h3 className="text-sm font-semibold text-forest">Private by default</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        Contact details, resumes and certificates are stored privately and used only for recruitment.
                        Read our{" "}
                        <Link href="/privacy-policy" className="font-medium text-forest underline decoration-gold/60 underline-offset-2">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Clock aria-hidden className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-dark" />
                    <div>
                      <h3 className="text-sm font-semibold text-forest">A real timeline</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        The hiring form takes about three minutes. A candidate profile takes around five. Neither
                        requires an account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border border-line bg-ivory px-5 py-5">
                  <h3 className="font-serif text-xl text-forest">Need to speak to someone?</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    For bulk hiring, a confidential search or help with your profile, message the staffing team
                    directly.
                  </p>
                  <div className="mt-4">
                    <WhatsAppButton message="Hello Goldenfalcone, I have a salon staffing enquiry." label="Chat with the staffing team" />
                  </div>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-8">
              <div className="border border-line bg-ivory/40 p-5 sm:p-8 lg:p-10">
                <SalonStaffingForms initialForm={initialForm} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 · Why Goldenfalcone ──────────────────────────────────────── */}
      <section className="border-y border-line/80 bg-ivory-dark/45 py-20 sm:py-28">
        <div className="container-lux">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  eyebrow="Why Goldenfalcone"
                  title={["Fewer profiles.", "Better conversations."]}
                />
                <p className="mt-6 text-sm leading-relaxed text-muted">
                  Recruitment in the beauty industry works on trust and craft. Our process is built around both — not
                  around volume.
                </p>
                <blockquote className="mt-8 border-l border-gold/60 pl-5">
                  <p className="font-serif text-2xl italic leading-snug text-forest">
                    “The best hire is rarely the fastest one.”
                  </p>
                  <footer className="mt-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                    Goldenfalcone staffing principle
                  </footer>
                </blockquote>
              </div>
            </div>

            <StaggerContainer className="grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:col-span-8">
              {reasons.map(({ icon: Icon, title, text }, i) => (
                <StaggerItem key={title} className="border-t border-line py-6 first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 font-serif text-2xl text-gold-dark/60">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="flex items-center gap-2 font-serif text-2xl text-forest">
                        <Icon aria-hidden className="h-4 w-4 text-emerald" strokeWidth={1.6} />
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ── 07 · FAQ ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Questions, answered"
                title={["Before you", "send anything."]}
                intro="The things salon owners and beauty professionals ask us most often."
              />
              <div className="mt-8 border border-line px-5 py-5">
                <p className="text-xs leading-relaxed text-muted">
                  Still unsure? Ask us directly. We would rather answer a question than have you submit something that
                  does not fit.
                </p>
                <div className="mt-4">
                  <WhatsAppButton message="Hello Goldenfalcone, I have a question about salon recruitment." label="Ask a question" />
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

      {/* ── 08 · Final CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest py-20 text-ivory sm:py-28">
        <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-gold/20" />
        <span aria-hidden className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full border border-ivory/10" />
        <div className="container-lux relative z-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <RevealUp>
                <p className="eyebrow text-gold">Start where you are</p>
                <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.02] text-ivory sm:text-5xl lg:text-6xl">
                  Build a team worth <em className="font-light italic text-champagne">keeping.</em>
                </h2>
              </RevealUp>
              <RevealUp delay={0.1}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/65">
                  Whether you are filling a chair or looking for the next good room to work in, the first step is a
                  short, honest conversation.
                </p>
              </RevealUp>
            </div>

            <RevealUp delay={0.16} className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
              <AnimatedButton href={FORM_HIRING} className="w-full justify-between sm:w-auto">
                I Need Salon Staff
              </AnimatedButton>
              <AnimatedButton href={FORM_CANDIDATE} variant="outline-light" className="w-full justify-between sm:w-auto">
                I&apos;m Looking for a Job
              </AnimatedButton>
            </RevealUp>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ivory/15 pt-6 text-[0.68rem] uppercase tracking-[0.16em] text-ivory/45">
            <span>Private candidate documents</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-gold" />
            <span>Human-reviewed requirements</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-gold" />
            <span>No placement guarantees</span>
          </div>
        </div>
      </section>
    </>
  );
}
