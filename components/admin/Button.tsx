import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "gold" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-ivory hover:bg-emerald",
  secondary: "border border-line bg-white text-ink hover:border-gold/50",
  gold: "bg-gold text-forest hover:bg-champagne",
  danger: "border border-red-800/20 bg-white text-red-800 hover:bg-red-50",
  ghost: "text-ink hover:bg-ink/5",
};

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; pending?: boolean; icon?: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", pending, icon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || pending} aria-busy={pending || undefined} className={buttonClass(variant, className)} {...props}>
      {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({ href, variant = "primary", icon, className, children }: { href: string; variant?: Variant; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {icon}
      {children}
    </Link>
  );
}
