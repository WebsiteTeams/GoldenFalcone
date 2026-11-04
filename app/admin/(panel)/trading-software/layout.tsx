import { SoftwareTabs } from "@/components/admin/SoftwareTabs";

export default function TradingSoftwareAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareTabs />
      {children}
    </>
  );
}
