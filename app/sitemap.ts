import type { MetadataRoute } from "next";
import { getPublishedSpices } from "@/lib/cms";
import { site } from "@/lib/site";

export const revalidate = 3600;

const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/spices", priority: 0.9, changeFrequency: "monthly" },
  { path: "/spices/shop", priority: 0.9, changeFrequency: "weekly" },
  { path: "/spices/shop?category=powder", priority: 0.8, changeFrequency: "weekly" },
  { path: "/spices/shop?category=solid", priority: 0.8, changeFrequency: "weekly" },
  { path: "/trading-mentorship", priority: 0.9, changeFrequency: "monthly" },

  { path: "/salon-staffing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const products = await getPublishedSpices();
  return [
    ...routes.map(({ path, priority, changeFrequency }) => ({
      url: `${site.url}${path === "/" ? "" : path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...products.map((p) => ({
      url: `${site.url}/spices/${p.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
