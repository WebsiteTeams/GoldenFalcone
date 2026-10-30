import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { StaffingMatchWorkbench } from "@/components/admin/StaffingMatchWorkbench";

export const metadata: Metadata = { title: "Candidate Matching" };

export default function MatchingPage() {
  return (
    <>
      <PageHeader
        title="Candidate Matching"
        description="Choose a hiring requirement, review explainable candidate scores, attach the right profiles and record every conversation."
      />
      <StaffingMatchWorkbench />
    </>
  );
}
