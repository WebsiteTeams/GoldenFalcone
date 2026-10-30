import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { getSiteConfig } from "@/lib/cms";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Goldenfalcone collects, uses, stores and protects the personal information you share through this website.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { title: "Privacy Policy | Goldenfalcone", url: "/privacy-policy" },
};

// Reflects what this website actually collects. Review with the client (and legal counsel) before launch.
const buildSections = (contact: { email?: string; address?: string }): LegalSection[] => [
  {
    id: "who-we-are",
    heading: "Who we are",
    body: (
      <p>
        This website is operated by {site.legalName} (&ldquo;Goldenfalcone&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). We
        are responsible for the personal information you submit through the forms on this site.
        {contact.address ? ` Our address is ${contact.address}.` : ""}
      </p>
    ),
  },
  {
    id: "information-we-collect",
    heading: "Information we collect",
    body: (
      <>
        <p>We only collect the information you choose to provide through our forms:</p>
        <ul>
          <li>
            <strong>Business enquiries</strong> (general, spices, mentorship and digital projects): your name, email,
            optional phone number, optional company and country, the service you are interested in, and your message and
            requirement details.
          </li>
          <li>
            <strong>Salon staffing requests</strong>: salon name, location, the professional category and number of staff
            required, contact name, phone number, optional email and any notes.
          </li>
          <li>
            <strong>Candidate applications</strong>: full name, email, phone number, professional category, experience,
            location, optional information about yourself and, where uploads are enabled, an optional CV.
          </li>
        </ul>
        <p>
          To protect our forms from abuse, your IP address is used briefly to limit repeated submissions. It is held only in
          temporary memory and is not saved with your submission.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    heading: "How we use your information",
    body: (
      <ul>
        <li>To respond to your enquiry and discuss the service you asked about.</li>
        <li>To assess staffing requests and match them with suitable candidates.</li>
        <li>
          To assess candidate applications and contact candidates about relevant salon opportunities. With the
          candidate&apos;s consent, their details may be shared with prospective salon employers.
        </li>
        <li>To keep a record of our communication with you and to keep our website secure.</li>
      </ul>
    ),
  },
  {
    id: "legal-basis",
    heading: "Consent and lawful use",
    body: (
      <p>
        Each form asks for your consent before you submit it. We use your information to respond to the request you made and
        for the purposes described on the form. We do not sell your personal information, and we do not use it for
        unrelated marketing without your separate permission.
      </p>
    ),
  },
  {
    id: "storage-security",
    heading: "Storage and security",
    body: (
      <>
        <p>
          Submissions are stored in a secured database accessible only to authorised Goldenfalcone personnel. Data is
          transmitted over encrypted connections (HTTPS).
        </p>
        <p>
          Uploaded CVs are stored in private storage that is not publicly accessible; our database holds only a reference to
          the file. No method of transmission or storage is completely secure, but we take reasonable measures to protect
          your information.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep information",
    body: (
      <p>
        We keep enquiries, staffing requests and applications only for as long as they are needed for the purposes described
        above, or as required by law. Afterwards they are deleted or anonymised. You can ask us to delete your information
        sooner at any time.
      </p>
    ),
  },
  {
    id: "third-parties",
    heading: "Third-party services",
    body: (
      <>
        <p>
          Our website is hosted by a third-party hosting provider, and our database is managed by a third-party database
          provider. They process data on our behalf to run the site.
        </p>
        <p>
          If you choose to contact us on WhatsApp, your conversation is also subject to WhatsApp&apos;s own privacy policy.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: (
      <p>
        This website does not use advertising or analytics cookies. If that changes, we will update this policy and ask for
        your consent where required.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access, correct or delete the personal information we hold
          about you, to withdraw your consent, or to object to how it is used.
        </p>
        <p>
          To make a request, please{" "}
          <Link href="/contact" className="font-medium text-forest underline decoration-gold/60 underline-offset-2">
            contact us
          </Link>
          {contact.email ? ` or email ${contact.email}` : ""}. We may need to verify your identity before acting on
          a request.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: <p>We may update this policy from time to time. The latest version will always be published on this page.</p>,
  },
];

export default async function PrivacyPolicyPage() {
  const sections = buildSections((await getSiteConfig()).contact);
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="28 October 2026"
      intro="Your trust matters to us. This policy explains what information we collect through this website, why we collect it and how we look after it."
      sections={sections}
    />
  );
}
