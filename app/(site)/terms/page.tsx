import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you use the Goldenfalcone website and submit an enquiry.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms & Conditions | Goldenfalcone", url: "/terms" },
};

const link = "font-medium text-forest underline decoration-gold/60 underline-offset-2";

// General website terms. Service-specific contracts are agreed separately. Review with legal counsel before launch.
const sections: LegalSection[] = [
  {
    id: "about",
    heading: "About these terms",
    body: (
      <p>
        These terms apply to your use of this website, operated by {site.legalName}. By using the site you agree to them. If
        you do not agree, please do not use the site.
      </p>
    ),
  },
  {
    id: "information",
    heading: "Website information",
    body: (
      <p>
        Content on this website is provided for general information about our divisions. While we aim to keep it accurate
        and up to date, it does not form an offer or contract. Product availability, specifications, prices, schedules and
        terms are confirmed individually in writing.
      </p>
    ),
  },
  {
    id: "enquiries",
    heading: "Enquiries and agreements",
    body: (
      <p>
        Submitting an enquiry, request or application does not create a binding agreement or guarantee a particular outcome.
        Any engagement — a spice supply order, a mentorship programme, a digital project or a staffing arrangement — is
        governed by the separate terms agreed between you and Goldenfalcone for that engagement.
      </p>
    ),
  },
  {
    id: "mentorship",
    heading: "Trading mentorship disclaimer",
    body: (
      <>
        <p>
          Our trading mentorship is educational only. It is not financial, investment, tax or legal advice, and nothing on
          this website is a recommendation to buy or sell any financial instrument.
        </p>
        <p>
          Trading involves substantial risk, and you may lose some or all of your capital. Past performance does not
          indicate future results, and we do not guarantee profits. You are solely responsible for your own trading
          decisions. See the full{" "}
          <Link href="/trading-mentorship" className={link}>
            risk disclosure
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "staffing",
    heading: "Salon staffing",
    body: (
      <p>
        We introduce salons and candidates to one another but do not guarantee a placement, interview or hire. Salons remain
        responsible for their own interviews, checks, employment terms and hiring decisions, and candidates for the accuracy
        of the information they provide.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <ul>
        <li>Do not submit false, misleading or someone else&apos;s information.</li>
        <li>Do not send spam, malicious files or automated submissions.</li>
        <li>Do not attempt to interfere with the security or operation of the website.</li>
      </ul>
    ),
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    body: (
      <p>
        The Goldenfalcone name, emblem, website design and original content belong to {site.legalName} or its licensors and
        may not be copied or reused without permission. Third-party photography is used under its respective licence.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <p>
        The website is provided &ldquo;as is&rdquo;. To the extent permitted by law, we are not liable for any loss arising
        from your use of, or reliance on, the website or its content. Nothing in these terms limits liability that cannot be
        limited by law.
      </p>
    ),
  },
  {
    id: "links",
    heading: "External links",
    body: (
      <p>
        The site may link to third-party services such as WhatsApp. We are not responsible for the content or practices of
        those services.
      </p>
    ),
  },
  {
    id: "privacy",
    heading: "Privacy",
    body: (
      <p>
        Our{" "}
        <Link href="/privacy-policy" className={link}>
          Privacy Policy
        </Link>{" "}
        explains how we handle the personal information you submit.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: <p>We may update these terms from time to time. Continued use of the website means you accept the latest version.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      updated="28 October 2026"
      intro="Please read these terms carefully. They explain the basis on which you may use this website and contact us."
      sections={sections}
    />
  );
}
