import { NextResponse } from "next/server";
import { productTypes, type ProductType } from "@/lib/admin/constants";
import { getPublishedSpices } from "@/lib/cms";
import { featuredProductHref, pickFeatured } from "@/lib/spices/catalogue";

/** Public list of one category's featured products, in display order. Published products and active variants only. */
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category") ?? "";
  if (!(productTypes as readonly string[]).includes(category)) {
    return NextResponse.json({ ok: false, message: "Use category=powder or category=solid." }, { status: 422 });
  }

  const products = pickFeatured(await getPublishedSpices(), category as ProductType);
  return NextResponse.json({
    ok: true,
    data: products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.productType,
      image: p.images[0] ?? null,
      featuredOrder: p.featuredOrder,
      currency: p.currency,
      href: featuredProductHref(p),
      quality: p.featuredVariant && {
        variantId: p.featuredVariant.id,
        level: p.featuredVariant.level,
        label: p.featuredVariant.label,
        percent: p.featuredVariant.qualityPercent,
        sellingPricePerKg: p.featuredVariant.sellingPrice,
      },
    })),
  });
}
