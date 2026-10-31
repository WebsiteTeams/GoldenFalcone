import "server-only";
import { productTypeLabels, qualityLabels, type ProductType, type QualityLevel } from "@/lib/admin/constants";
import { lineTotal } from "@/lib/cart/price";
import { mediaUrl } from "@/lib/media";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceProduct } from "@/models/SpiceProduct";

export type RequestedLine = { productId: string; variantId: string; quantity: number; expectedPrice?: number };

export type PricedLine = {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  category: string;
  quality: string;
  qualityPercent: number;
  importArea: string;
  unit: "kg";
  quantity: number;
  unitPrice: number;
  marketPrice: number;
  currency: string;
  lineTotal: number;
};

export type LineResult =
  | { ok: true; variantId: string; line: PricedLine; priceChanged: boolean }
  | { ok: false; variantId: string; reason: string };

/**
 * The only source of prices for an order. Each requested line is resolved against the published product and its
 * active variant in the database; the browser supplies identifiers and a quantity, never an amount to charge.
 */
export async function priceLines(requested: RequestedLine[]): Promise<LineResult[]> {
  await connectToDatabase();
  const products = await SpiceProduct.find({ _id: { $in: requested.map((r) => r.productId) }, status: "published" }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  return requested.map((req): LineResult => {
    const unavailable = (reason: string): LineResult => ({ ok: false, variantId: req.variantId, reason });

    const product = byId.get(req.productId);
    if (!product) return unavailable("This product is no longer available.");
    if (product.availability === "unavailable") return unavailable(`${product.name} is currently unavailable.`);

    const variant = product.variants?.find((v) => String(v._id) === req.variantId);
    const quality = variant ? qualityLabels[variant.level as QualityLevel] : "";
    if (!variant || !variant.active) return unavailable(`This quality of ${product.name} is no longer available.`);
    if (!(variant.sellingPrice > 0)) return unavailable(`${product.name} (${quality}) does not have a confirmed price.`);

    return {
      ok: true,
      variantId: req.variantId,
      priceChanged: req.expectedPrice !== undefined && req.expectedPrice !== variant.sellingPrice,
      line: {
        productId: req.productId,
        variantId: req.variantId,
        name: product.name,
        image: product.images?.[0]?.mediaId ? mediaUrl(product.images[0].mediaId) : "",
        category: product.productType ? productTypeLabels[product.productType as ProductType] : "",
        quality,
        qualityPercent: variant.qualityPercent,
        importArea: variant.importArea ?? "",
        unit: "kg",
        quantity: req.quantity,
        unitPrice: variant.sellingPrice,
        marketPrice: variant.marketPrice,
        currency: product.currency ?? "INR",
        lineTotal: lineTotal(variant.sellingPrice, req.quantity),
      },
    };
  });
}
