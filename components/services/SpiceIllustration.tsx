import type { Spice } from "@/lib/content";

/** Fine-line botanical drawings in the brand gold, used as spice "specimen" artwork. */
export function SpiceIllustration({ slug, className }: { slug: Spice["slug"]; className?: string }) {
  const common = {
    viewBox: "0 0 120 120",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (slug) {
    case "cardamom":
      return (
        <svg {...common}>
          <g transform="rotate(-28 60 60)">
            <path d="M60 22c13 8 16 26 13 40s-8 24-13 26c-5-2-10-12-13-26s0-32 13-40z" />
            <path d="M60 24v62M53 32c-3 12-3 30 2 48M67 32c3 12 3 30-2 48" opacity=".6" />
            <path d="M60 22l-2-6" />
          </g>
          <g transform="rotate(32 82 74)">
            <path d="M82 50c9 6 11 18 9 28s-6 16-9 18c-3-2-7-8-9-18s0-22 9-28z" />
            <path d="M82 52v42M77 58c-2 9-2 22 2 33M87 58c2 9 2 22-2 33" opacity=".6" />
          </g>
        </svg>
      );
    case "pepper":
      return (
        <svg {...common}>
          <path d="M60 14c-2 14 0 22 4 30" />
          {[
            [56, 46, 7], [70, 50, 7], [62, 60, 7.5], [48, 58, 7], [76, 63, 6.5], [56, 73, 7],
            [70, 76, 7], [44, 72, 6], [62, 88, 6.5], [50, 86, 6], [76, 89, 5.5], [60, 101, 5],
          ].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} />
              <path d={`M${cx - r * 0.4} ${cy - r * 0.2}q${r * 0.4} ${r * 0.5} ${r * 0.8} 0`} opacity=".5" />
            </g>
          ))}
        </svg>
      );
    case "cinnamon":
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 14 - 14} ${i * -6 + 6}) rotate(-38 60 60)`}>
              <path d="M24 56h72M24 66h72" />
              <path d="M96 56c4 0 6 2.5 6 5s-2 5-6 5c-3 0-4-2-4-3.5S93 60 96 60" />
              <path d="M24 56c-4 0-6 2.5-6 5s2 5 6 5" />
              <path d="M40 58v6M58 57v7M76 58v6" opacity=".45" />
            </g>
          ))}
        </svg>
      );
    case "cloves":
      return (
        <svg {...common}>
          {[
            { x: 44, y: 30, r: -18 },
            { x: 74, y: 40, r: 22 },
          ].map(({ x, y, r }, i) => (
            <g key={i} transform={`rotate(${r} ${x} ${y + 30})`}>
              <circle cx={x} cy={y} r="6" />
              <path d={`M${x - 8} ${y + 4}l-4-6M${x + 8} ${y + 4}l4-6M${x - 6} ${y + 8}c2 2 10 2 12 0`} />
              <path d={`M${x - 4} ${y + 9}c-1 18 1 40 4 56 3-16 5-38 4-56`} />
              <path d={`M${x} ${y + 14}v44`} opacity=".45" />
            </g>
          ))}
        </svg>
      );
    case "ginger":
      return (
        <svg {...common}>
          <path d="M20 70c-2-8 4-14 12-13 2-9 12-12 18-6 4-9 16-10 20-2 6-6 18-3 18 6 9-2 16 6 12 14-2 6-9 8-15 6-3 7-12 9-17 4-5 6-15 6-19-1-6 4-14 3-17-3-6 3-11 1-12-5z" />
          <path d="M32 57c2 4 2 8 0 12M50 51c2 5 2 10-1 15M70 49c2 5 2 11-1 16M88 55c1 4 0 8-3 11" opacity=".45" />
          <path d="M48 38c0-6 4-10 8-12M70 41c2-7 7-10 12-10" />
        </svg>
      );
  }
}
