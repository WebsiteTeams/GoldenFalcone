import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/admin/AccountForms";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getStoredSettings } from "@/lib/admin/content";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const settings = await getStoredSettings();

  return (
    <>
      <PageHeader title="Settings" description="Business details, contact information, SEO defaults and your administrator account." />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {/* Credentials such as database URLs and API keys live only in server environment variables and are never shown here. */}
          <SettingsForm initial={settings} canEdit={admin.role === "admin"} emailConfigured={Boolean(process.env.EMAIL_PROVIDER)} />
        </div>
        <div id="profile" className="scroll-mt-24 space-y-6">
          <ProfileForm name={admin.name} email={admin.email} />
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
