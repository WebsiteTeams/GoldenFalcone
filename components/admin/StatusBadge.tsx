import { statusLabel } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  new: "bg-gold/15 text-gold-dark ring-gold/30",
  contacted: "bg-sky-50 text-sky-800 ring-sky-700/15",
  reviewing: "bg-sky-50 text-sky-800 ring-sky-700/15",
  "in-progress": "bg-indigo-50 text-indigo-800 ring-indigo-700/15",
  shortlisted: "bg-indigo-50 text-indigo-800 ring-indigo-700/15",
  converted: "bg-emerald/10 text-emerald ring-emerald/25",
  fulfilled: "bg-emerald/10 text-emerald ring-emerald/25",
  selected: "bg-emerald/10 text-emerald ring-emerald/25",
  published: "bg-emerald/10 text-emerald ring-emerald/25",
  closed: "bg-ink/5 text-muted ring-ink/10",
  draft: "bg-ink/5 text-muted ring-ink/10",
  rejected: "bg-red-50 text-red-800 ring-red-800/15",
  // Order statuses
  "pending-whatsapp": "bg-amber-50 text-amber-800 ring-amber-700/20",
  "enquiry-received": "bg-sky-50 text-sky-800 ring-sky-700/15",
  confirmed: "bg-blue-50 text-blue-800 ring-blue-700/15",
  processing: "bg-purple-50 text-purple-800 ring-purple-700/15",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-700/15",
  completed: "bg-emerald/10 text-emerald ring-emerald/25",
  cancelled: "bg-red-50 text-red-800 ring-red-800/15",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[status] ?? tones.closed,
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status)}
    </span>
  );
}
