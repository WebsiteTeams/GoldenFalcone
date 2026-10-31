import type { Metadata } from "next";
import { FeaturedManager, type FeaturedProductRow } from "@/components/admin/catalogue/FeaturedManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { qualityLabels, qualityLevels, type ProductType, type QualityLevel } from "@/lib/admin/constants";
import { requireAdmin } from "@/lib/auth/session";
import { mediaUrl } from "@/lib/media";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceProduct } from "@/models/SpiceProduct";

export const metadata: Metadata = { title: "Featured products" };

export default async function FeaturedProductsPage() {
  await requireAdmin();
  await connectToDatabase();

  const docs = await SpiceProduct.find({ productType: { $in: ["powder", "solid"] } })
    .select("name status productType images isFeatured featuredOrder featuredVariantId variants")
    .sort({ name: 1 })
    .lean();

  const rowsFor = (type: ProductType): FeaturedProductRow[] =>
    docs
      .filter((d) => d.productType === type)
      .map((d) => ({
        id: String(d._id),
        name: d.name,
        status: d.status,
        image: d.images?.[0]?.mediaId ? mediaUrl(d.images[0].mediaId) : null,
        isFeatured: Boolean(d.isFeatured),
        featuredOrder: d.featuredOrder ?? 0,
        featuredVariantId: d.featuredVariantId ? String(d.featuredVariantId) : "",
        variants: [...(d.variants ?? [])]
          .sort((a, b) => qualityLevels.indexOf(a.level as QualityLevel) - qualityLevels.indexOf(b.level as QualityLevel))
          .map((v) => ({
            id: String(v._id),
            label: qualityLabels[v.level as QualityLevel],
            percent: v.qualityPercent,
            sellingPrice: v.sellingPrice,
            active: v.active !== false,
          })),
      }));

  return (
    <>
      <PageHeader
        back={{ href: "/admin/spices", label: "Spices catalogue" }}
        title="Featured Products"
        description="Choose what appears in each homepage section, which quality each card shows, and the order. Lower numbers appear first."
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <FeaturedManager title="Powder" rows={rowsFor("powder")} />
        <FeaturedManager title="Solid" rows={rowsFor("solid")} />
      </div>
    </>
  );
}
