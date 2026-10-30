import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  tone?: "light" | "dark";
  size?: number;
  withWordmark?: boolean;
  className?: string;
  priority?: boolean;
  /** Logo image URL; defaults to the brand emblem. An uploaded logo comes from admin settings. */
  src?: string;
  href?: string;
};

/** Brand mark + wordmark. The emblem file at `site.logo` is the single source for the logo asset. */
export function Logo({ tone = "light", size = 44, withWordmark = true, className, priority, src = site.logo, href = "/" }: LogoProps) {
  return (
    <Link href={href} aria-label="Goldenfalcone — home" className={cn("group inline-flex items-center gap-3", className)}>
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="shrink-0 object-contain transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-[1.04] rounded-2xl"
        style={{ width: size, height: size }}
      />
      {withWordmark ? (
        <span
          className={cn(
            "font-serif text-[1.2rem] font-semibold tracking-[0.18em] transition-colors duration-300",
            tone === "light" ? "text-ivory" : "text-forest",
          )}
        >
          GOLDEN<span className="text-gold">FALCONE</span>
        </span>
      ) : null}
    </Link>
  );
}
