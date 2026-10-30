"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FolderTree,
  Layers,
  MapPin,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Check,
  Eye,
  X,
} from "lucide-react";
import type { PublicCategory, PublicSpice } from "@/lib/cms";
import { useCart } from "@/lib/cart/context";
import { formatPrice, discountPercent } from "@/lib/cart/price";

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "discount";

// Default curated fallback products matching the mockup if database has 0 items
const defaultMockSpices: PublicSpice[] = [
  {
    id: "lakadong-turmeric",
    slug: "lakadong-turmeric",
    name: "Lakadong Turmeric (Haldi)",
    shortDescription: "High-curcumin single-origin turmeric from the pristine Jaintia Hills.",
    description: "",
    category: "powders",
    categoryName: "Pure Powders",
    categoryId: "powders",
    images: [{ url: "/images/spices/turmeric-bowl.jpg", alt: "Lakadong Turmeric" }],
    marketPrice: 320,
    ourPrice: 260,
    currency: "INR",
    unit: "250g",
    availability: "available",
    origin: "Meghalaya, India",
    minimumOrderQuantity: 1,
    highlights: ["7.5% Natural Curcumin", "Stone-ground", "No artificial color"],
  },
  {
    id: "hand-pounded-garam-masala",
    slug: "hand-pounded-garam-masala",
    name: "Hand-pounded Garam Masala",
    shortDescription: "Heritage recipe combining 12 roasted whole spices for deep culinary warmth.",
    description: "",
    category: "blends",
    categoryName: "Artisan Blends",
    categoryId: "blends",
    images: [{ url: "/images/spices/hero-platter.jpg", alt: "Hand-pounded Garam Masala" }],
    marketPrice: 350,
    ourPrice: 290,
    currency: "INR",
    unit: "250g",
    availability: "available",
    origin: "Malabar, Kerala",
    minimumOrderQuantity: 1,
    highlights: ["Hand-roasted", "Aromatic volatile oils", "Zero fillers"],
  },
  {
    id: "ginger-powder-sonth",
    slug: "ginger-powder-sonth",
    name: "Ginger Powder (Sonth)",
    shortDescription: "Sun-dried natural ginger powder with warming pungency and digestive benefits.",
    description: "",
    category: "powders",
    categoryName: "Pure Powders",
    categoryId: "powders",
    images: [{ url: "/images/spices/ginger-bowl.jpg", alt: "Ginger Powder Sonth" }],
    marketPrice: 300,
    ourPrice: 240,
    currency: "INR",
    unit: "250g",
    availability: "available",
    origin: "Wayanad, Kerala",
    minimumOrderQuantity: 1,
    highlights: ["Sun-dried", "High gingerol", "No preservatives"],
  },
  {
    id: "kashmiri-chilli-powder",
    slug: "kashmiri-chilli-powder",
    name: "Kashmiri Red Chilli (Lal Mirch)",
    shortDescription: "Vibrant ruby-red whole-stemmed chilli powder imparting deep color with mild heat.",
    description: "",
    category: "powders",
    categoryName: "Pure Powders",
    categoryId: "powders",
    images: [{ url: "/images/spices/chilli-bowl.jpg", alt: "Kashmiri Red Chilli" }],
    marketPrice: 260,
    ourPrice: 210,
    currency: "INR",
    unit: "250g",
    availability: "available",
    origin: "Kashmir, India",
    minimumOrderQuantity: 1,
    highlights: ["Natural deep red", "Mild aromatic heat", "Sortex cleaned"],
  },
  {
    id: "alleppey-green-cardamom",
    slug: "alleppey-green-cardamom",
    name: "Alleppey Green Cardamom (8mm Bold)",
    shortDescription: "Handpicked extra bold green cardamom pods with intense sweet floral aromatics.",
    description: "",
    category: "whole",
    categoryName: "Whole Spices",
    categoryId: "whole",
    images: [{ url: "/images/spices/hero-platter.jpg", alt: "Alleppey Green Cardamom" }],
    marketPrice: 750,
    ourPrice: 620,
    currency: "INR",
    unit: "250g",
    availability: "available",
    origin: "Idukki, Kerala",
    minimumOrderQuantity: 1,
    highlights: ["8mm Extra Bold", "Single-origin", "Aroma sealed"],
  },
  {
    id: "tellicherry-black-pepper",
    slug: "tellicherry-black-pepper",
    name: "Tellicherry Black Pepper (TGSEB)",
    shortDescription: "Late-harvested large black peppercorns delivering bold woody pungency.",
    description: "",
    category: "whole",
    categoryName: "Whole Spices",
    categoryId: "whole",
    images: [{ url: "/images/spices/gift-jar-set.jpg", alt: "Tellicherry Black Pepper" }],
    marketPrice: 340,
    ourPrice: 280,
    currency: "INR",
    unit: "250g",
    availability: "available",
    origin: "Tellicherry, Kerala",
    minimumOrderQuantity: 1,
    highlights: ["TGSEB Grade", "High piperine", "Sortex graded"],
  },
];

export function CategoryFilterStore({
  categories,
  products,
}: {
  categories: PublicCategory[];
  products: PublicSpice[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Use database products or default curated picks
  const activeProductList = products.length > 0 ? products : defaultMockSpices;

  // Filtering logic: category + search query
  const filteredProducts = useMemo(() => {
    let list = activeProductList;

    if (selectedCategory !== "all") {
      const activeCat = categories.find((c) => c.id === selectedCategory);
      list = list.filter(
        (p) =>
          p.categoryId === selectedCategory ||
          p.category === selectedCategory ||
          (activeCat && p.categoryName?.toLowerCase() === activeCat.name.toLowerCase()),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.origin?.toLowerCase().includes(q),
      );
    }

    // Sort
    const sorted = [...list];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => (a.ourPrice ?? 0) - (b.ourPrice ?? 0));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.ourPrice ?? 0) - (a.ourPrice ?? 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        sorted.sort((a, b) => {
          const discA = a.marketPrice && a.ourPrice ? discountPercent(a.marketPrice, a.ourPrice) : 0;
          const discB = b.marketPrice && b.ourPrice ? discountPercent(b.marketPrice, b.ourPrice) : 0;
          return discB - discA;
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [activeProductList, categories, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div id="top-picks" className="space-y-12">
      {/* 1. Header Section matching mockup */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E17] font-semibold tracking-tight">
          Top Picks from Indian Kitchens
        </h2>
        <p className="mt-2 font-serif italic text-base text-[#8C6D53]">
          &ldquo;Spices Our Customers Love And Trust Most&rdquo;
        </p>
      </div>

      {/* 2. Interactive Search, Filter Tabs & Sort Controls */}
      <div className="rounded-3xl border border-[#EBE3D7] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7B6E] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spices by name, origin or variety..."
              className="w-full rounded-full border border-[#D8CEBF] bg-[#FAF7F2] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-[#2A1E17] placeholder-[#8C7B6E] focus:border-[#D4AF37] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6E] hover:text-[#2A1E17] p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#8C6D53] shrink-0" />
            <label htmlFor="spice-sort" className="text-xs text-[#736357] whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="spice-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-full border border-[#D8CEBF] bg-[#FAF7F2] px-3.5 py-1.5 text-xs text-[#2A1E17] font-medium focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="featured">Featured / Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Savings</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F0E8DD]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-[#1E3A2B] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#736357] hover:bg-white border border-[#EBE3D7]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            All Spices ({activeProductList.length})
          </button>

          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            const count = activeProductList.filter(
              (p) =>
                p.categoryId === c.id ||
                p.category === c.id ||
                p.categoryName?.toLowerCase() === c.name.toLowerCase(),
            ).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#1E3A2B] text-white font-semibold shadow-xs"
                    : "bg-[#FAF7F2] text-[#736357] hover:bg-white border border-[#EBE3D7]"
                }`}
              >
                {c.name}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-black/5 text-[#736357]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Products Header Info & Active Filter Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#736357]">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Showing <strong className="text-[#2A1E17] font-semibold">{filteredProducts.length}</strong> of{" "}
            <strong>{activeProductList.length}</strong> authentic products
          </span>
          {activeCategoryObj && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1E3A2B]/10 border border-[#1E3A2B]/20 px-2.5 py-0.5 text-xs text-[#1E3A2B] font-medium">
              Category: {activeCategoryObj.name}
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="hover:text-black ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 border border-black/10 px-2.5 py-0.5 text-xs text-[#2A1E17]">
              Search: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:text-black ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        {(selectedCategory !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1 font-semibold text-[#8C6D53] hover:text-[#2A1E17] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all filters
          </button>
        )}
      </div>

      {/* 4. Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((spice) => (
            <ProductPickCard key={spice.id} spice={spice} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#EBE3D7] bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#B8860B]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-2xl text-[#2A1E17]">No matching spices found</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#736357] max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any spices matching your current selection. Try resetting filters or
            searching with another term.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1E3A2B] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#2A1E17] transition-all shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

/** Product card matching the "Top Picks" mockup cards */
function ProductPickCard({ spice }: { spice: PublicSpice }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const mainImage = spice.images?.[0];
  const hasPrice = typeof spice.ourPrice === "number" && spice.ourPrice > 0;
  const showMarket =
    spice.marketPrice !== null &&
    spice.ourPrice !== null &&
    spice.marketPrice > spice.ourPrice;
  const discount = showMarket ? discountPercent(spice.marketPrice!, spice.ourPrice!) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasPrice) return;

    addItem({
      productId: spice.id,
      name: spice.name,
      slug: spice.slug,
      image: mainImage?.url ?? "",
      unit: spice.unit || "kg",
      unitPrice: spice.ourPrice!,
      marketPrice: spice.marketPrice,
      currency: spice.currency || "INR",
      quantity: spice.minimumOrderQuantity || 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group flex flex-col rounded-3xl border border-[#EBE3D7] bg-white overflow-hidden shadow-xs hover:border-[#D4AF37]/60 hover:shadow-xl transition-all duration-300">
      {/* Product Image */}
      <Link
        href={`/spices/${spice.slug}`}
        className="relative block aspect-[4/3] bg-[#F7F2E9] overflow-hidden"
      >
        {mainImage?.url ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || spice.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-106"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5EFE6]">
            <Package className="h-12 w-12 text-[#D4AF37]/40" strokeWidth={1.2} />
          </div>
        )}
        {discount >= 5 && (
          <span className="absolute top-3 left-3 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-bold text-[#1C1510] shadow-sm">
            {discount}% OFF
          </span>
        )}
      </Link>

      {/* Content Details */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/spices/${spice.slug}`}>
          <h3 className="font-serif text-lg text-[#2A1E17] font-semibold leading-snug group-hover:text-[#B8860B] transition-colors line-clamp-1">
            {spice.name}
          </h3>
        </Link>

        {/* Star Rating matching mockup ⭐⭐⭐⭐⭐ */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8C7B6E]">
          <div className="flex text-[#D4AF37]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <span className="text-[11px] font-medium">(48 Reviews)</span>
        </div>

        {spice.shortDescription && (
          <p className="mt-2 text-xs leading-relaxed text-[#736357] line-clamp-2">
            {spice.shortDescription}
          </p>
        )}

        {spice.origin && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-[#8C6D53]">
            <MapPin className="h-3 w-3 shrink-0" />
            {spice.origin}
          </p>
        )}

        {/* Price & Action Button */}
        <div className="mt-auto pt-4 border-t border-[#F0E8DD] flex items-center justify-between gap-3">
          <div>
            {hasPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl font-bold text-[#1E3A2B] tabular-nums">
                  {formatPrice(spice.ourPrice!, spice.currency)}
                </span>
                {spice.unit && <span className="text-xs text-[#8C7B6E]">/ {spice.unit}</span>}
              </div>
            ) : (
              <span className="text-xs text-[#736357] italic">Wholesale enquiry</span>
            )}
            {showMarket && (
              <span className="block text-[11px] text-[#A6978A] line-through tabular-nums">
                {formatPrice(spice.marketPrice!, spice.currency)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/spices/${spice.slug}`}
              aria-label={`View ${spice.name}`}
              className="rounded-full border border-[#D8CEBF] p-2 text-[#736357] hover:border-[#D4AF37] hover:text-[#1E3A2B] transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>

            {hasPrice && (
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={`Add ${spice.name} to cart`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "border border-[#2A1E17] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-[#FAF7F2]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Basket
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
