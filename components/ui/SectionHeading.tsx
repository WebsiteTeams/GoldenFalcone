import { RevealUp, TextReveal } from "@/components/animations";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  /** Lines of the headline; each reveals separately. */
  title: string[];
  intro?: string;
  /** Line index set in italic gold for emphasis (defaults to the last line). */
  accentIndex?: number | null;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
};

export function SectionHeading({ eyebrow, title, intro, accentIndex, align = "left", tone = "dark", className }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div className={cn(center && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow ? (
        <RevealUp distance={14}>
          <p className={cn("eyebrow flex items-center gap-3", center && "justify-center", tone === "dark" ? "text-gold-dark" : "text-gold")}>
            <span aria-hidden className="h-px w-8 bg-current" />
            {eyebrow}
          </p>
        </RevealUp>
      ) : null}
      <TextReveal
        lines={title}
        accentIndex={accentIndex === null ? undefined : (accentIndex ?? title.length - 1)}
        accentClassName={tone === "dark" ? "italic text-gold-dark" : "italic text-champagne"}
        className={cn(
          "mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-[3.6rem]",
          tone === "dark" ? "text-forest" : "text-ivory",
        )}
      />
      {intro ? (
        <RevealUp delay={0.15}>
          <p className={cn("mt-6 text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-muted" : "text-ivory/70")}>{intro}</p>
        </RevealUp>
      ) : null}
    </div>
  );
}
