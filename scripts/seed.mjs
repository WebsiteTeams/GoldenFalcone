/**
 * Sample catalogue data: 5 powder spices, 5 solid spices and 1 trading software product per category.
 *
 *   npm run seed            # shows what it would do and the database it would write to
 *   npm run seed -- --confirm
 *   npm run seed:remove -- --confirm     # removes exactly the records this script creates
 *
 * Everything is sample content (prices, specifications, features) for building and testing the storefront. Review it
 * before using it on a live site. Spice records carry a SEED- SKU and software slugs end in -sample, which is how
 * the remove command finds them. Nothing else in the database is touched.
 */
import mongoose from "mongoose";

const args = new Set(process.argv.slice(2));
const confirm = args.has("--confirm");
const remove = args.has("--remove");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local first.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB_NAME || undefined;
const host = uri.replace(/^[^@]*@/, "").split(/[/?]/)[0];

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=75`;
const spiceImages = (name) =>
  ["1532336414038-cf19250c5757", "1596040033229-a9821ebd058d", "1509358271058-acd22cc93898", "1506368249639-73a05d6f6488"].map((id, i) => ({
    mediaId: img(id),
    alt: `${name}, image ${i + 1}`,
  }));

// ---------- Spices ----------

const levels = ["high", "medium", "low"];
/** [name, slug, type, high price, shortDescription, origin, highlights] — medium and low prices are derived. */
const spiceRows = [
  ["Turmeric Powder", "turmeric-powder", "powder", 280, "Fine, deep-golden ground turmeric for cooking, blending and food production.", "Erode, Tamil Nadu", ["Rich colour", "Fine grind", "Suited to blending"]],
  ["Red Chilli Powder", "red-chilli-powder", "powder", 360, "Ground red chilli with a clean heat, for kitchens and spice blends.", "Guntur, Andhra Pradesh", ["Consistent heat", "Bright colour", "Free-flowing"]],
  ["Coriander Powder", "coriander-powder", "powder", 190, "Mild, citrusy ground coriander seed, a staple of curry and masala blends.", "Rajasthan", ["Mild citrus aroma", "Fine grind", "Everyday use"]],
  ["Cumin Powder", "cumin-powder", "powder", 420, "Warm, earthy ground cumin for seasoning, rubs and blends.", "Gujarat", ["Warm earthy aroma", "Fine grind", "Strong flavour"]],
  ["Black Pepper Powder", "black-pepper-powder", "powder", 780, "Freshly ground black pepper with a sharp, lingering heat.", "Kerala", ["Sharp heat", "Fresh grind", "Retail and food service"]],
  ["Green Cardamom", "green-cardamom", "solid", 2400, "Whole green cardamom pods with a fresh, floral aroma.", "Idukki, Kerala", ["Floral aroma", "Whole pods", "Sweets and beverages"]],
  ["Black Pepper", "black-pepper", "solid", 720, "Whole black peppercorns, valued for pungency and depth.", "Wayanad, Kerala", ["Pungent", "Whole peppercorns", "Retail and processing"]],
  ["Cinnamon", "cinnamon", "solid", 640, "Sweet, woody cinnamon in rolled quills and sticks.", "Kerala", ["Sweet woody aroma", "Quills and sticks", "Baking and beverages"]],
  ["Cloves", "cloves", "solid", 1250, "Whole dried clove buds with an intense, warm aroma.", "Kanyakumari, Tamil Nadu", ["Strong aroma", "Whole buds", "Blends and preserving"]],
  ["Dry Ginger", "dry-ginger", "solid", 520, "Dried whole ginger rhizome with warm, earthy pungency.", "Kochi, Kerala", ["Earthy pungency", "Dried rhizome", "Blends and beverages"]],
];

const factor = { high: 1, medium: 0.82, low: 0.65 };
const percent = { high: 98, medium: 92, low: 85 };

const spices = spiceRows.map(([name, slug, productType, base, shortDescription, origin, highlights], i) => {
  const variants = levels.map((level) => {
    const sellingPrice = Math.round(base * factor[level]);
    return {
      _id: new mongoose.Types.ObjectId(),
      level,
      qualityPercent: percent[level],
      marketPrice: Math.round(sellingPrice * 1.12),
      sellingPrice,
      importArea: origin,
      specifications: "",
      labReport: null,
      active: true,
    };
  });
  const featured = i % 5 === 0;
  return {
    name,
    slug,
    status: "published",
    order: i,
    productType,
    category: null,
    images: spiceImages(name),
    variants,
    isFeatured: featured,
    featuredOrder: i,
    featuredVariantId: featured ? variants[0]._id : null,
    marketPrice: variants[2].marketPrice,
    ourPrice: variants[2].sellingPrice,
    shortDescription,
    description: shortDescription,
    sku: `SEED-${slug.toUpperCase()}`,
    currency: "INR",
    unit: "kg",
    availability: "available",
    packaging: "",
    origin,
    highlights,
    minimumOrderQuantity: null,
    seo: { title: "", description: "" },
  };
});

// ---------- Trading software (one per category) ----------

const shot = (id, alt) => ({ mediaId: img(id), alt });
const thumbs = ["1590283603385-17ffb3a7f29f", "1642790106117-e829e14a795f", "1611974789855-9c2a0a7236a3", "1460925895917-afdab827c52f", "1517694712202-14dd9538aa97", "1498050108023-c5249f4df085"];
const sw = (n, o) => ({
  status: "published",
  order: n,
  slug: o.slug,
  name: o.name,
  category: o.category,
  markets: o.markets,
  shortDescription: o.short,
  description: o.description,
  thumbnail: shot(thumbs[n], `${o.name} interface`),
  screenshots: [shot(thumbs[(n + 1) % 6], `${o.name} screenshot`), shot(thumbs[(n + 2) % 6], `${o.name} screenshot`)],
  demoVideo: "",
  features: o.features,
  supportedPlatforms: o.platforms,
  systemRequirements: "Sample requirements: 64-bit operating system, 8 GB RAM and a stable internet connection.",
  installationNotes: "Sample setup notes: installation and activation details are sent after your order is confirmed.",
  supportInfo: "Support is available by email, phone or WhatsApp.",
  licenceTerms: "Sample licence terms: one licence covers one user on up to two devices. Not for redistribution.",
  faqs: [
    { question: "Is this sample data?", answer: "Yes. This product was created by the seed script so the storefront can be tested. Replace or remove it before launch." },
    { question: "How is the software delivered?", answer: "After your order is confirmed and payment is arranged, we send delivery and activation details directly." },
  ],
  licenceOptions: o.licences.map(([name, licenceType, price, description]) => ({ _id: new mongoose.Types.ObjectId(), name, licenceType, price, description, active: true })),
  currency: "INR",
  startingPrice: Math.min(...o.licences.map((l) => l[2])),
  availability: "available",
  featured: o.featured,
  featuredOrder: n,
  seo: { title: "", description: "" },
});

const software = [
  sw(0, {
    slug: "equity-screener-sample",
    name: "Equity Screener (Sample)",
    category: "stock-market",
    markets: ["stocks", "indices"],
    short: "Sample desktop screener for filtering listed equities by custom criteria.",
    description: "Sample product used to test the storefront. Replace this text with the confirmed description of the real product.",
    features: ["Custom filter builder", "Saved screens", "Watchlist export"],
    platforms: ["windows", "web"],
    licences: [["Annual licence", "annual", 12000, "12 months of use"], ["Lifetime licence", "lifetime", 30000, "One-time purchase"]],
    featured: true,
  }),
  sw(1, {
    slug: "forex-trade-manager-sample",
    name: "Forex Trade Manager (Sample)",
    category: "forex",
    markets: ["forex"],
    short: "Sample trade-management utility for MetaTrader users.",
    description: "Sample product used to test the storefront. Replace this text with the confirmed description of the real product.",
    features: ["Position sizing helper", "Order templates", "Session timer"],
    platforms: ["metatrader-4", "metatrader-5", "windows"],
    licences: [["Monthly licence", "monthly", 1500, "Billed monthly"], ["Annual licence", "annual", 15000, "12 months of use"]],
    featured: true,
  }),
  sw(2, {
    slug: "crypto-portfolio-tracker-sample",
    name: "Crypto Portfolio Tracker (Sample)",
    category: "crypto",
    markets: ["crypto"],
    short: "Sample tracker that brings exchange balances into one view.",
    description: "Sample product used to test the storefront. Replace this text with the confirmed description of the real product.",
    features: ["Multi-exchange balances", "Transaction history", "CSV export"],
    platforms: ["web", "android", "ios"],
    licences: [["Annual licence", "annual", 9000, "12 months of use"]],
    featured: false,
  }),
  sw(3, {
    slug: "algo-strategy-runner-sample",
    name: "Algo Strategy Runner (Sample)",
    category: "algorithmic",
    markets: ["stocks", "futures-options", "forex"],
    short: "Sample framework for running rules-based strategies and backtests.",
    description: "Sample product used to test the storefront. Replace this text with the confirmed description of the real product.",
    features: ["Rule-based strategy builder", "Historical backtesting", "Run log"],
    platforms: ["windows", "linux"],
    licences: [["Annual licence", "annual", 45000, "12 months of use"], ["Lifetime licence", "lifetime", 120000, "One-time purchase"]],
    featured: true,
  }),
  sw(4, {
    slug: "indicator-suite-sample",
    name: "Indicator Suite (Sample)",
    category: "indicators-strategies",
    markets: ["stocks", "forex", "commodities"],
    short: "Sample set of charting indicators for supported platforms.",
    description: "Sample product used to test the storefront. Replace this text with the confirmed description of the real product.",
    features: ["Trend and momentum indicators", "Alert conditions", "Template presets"],
    platforms: ["tradingview", "metatrader-5"],
    licences: [["Lifetime licence", "lifetime", 8000, "One-time purchase"]],
    featured: false,
  }),
  sw(5, {
    slug: "custom-trading-tools-sample",
    name: "Custom Trading Tools (Sample)",
    category: "custom-tools",
    markets: [],
    short: "Sample listing for tailor-made trading utilities, quoted per requirement.",
    description: "Sample product used to test the storefront. Pricing is agreed per project, so no licence is listed.",
    features: ["Scoped to your workflow", "Delivered with documentation"],
    platforms: ["other"],
    licences: [],
    featured: false,
  }),
];
// A product with no licences has no price; it is demo/enquiry-only.
software[5].startingPrice = null;
software[5].availability = "on-request";

// ---------- Run ----------

const slugs = { spices: spices.map((s) => s.slug), software: software.map((s) => s.slug) };
console.log(`${remove ? "Remove" : "Seed"}: database "${dbName ?? "(from URI)"}" on ${host}`);
console.log(`Records: ${spices.length} spices (5 powder, 5 solid), ${software.length} trading software (one per category)`);
if (!confirm) {
  console.log("\nDry run only. Re-run with --confirm to write. Check the host above is the database you intend to change.");
  process.exit(0);
}

await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 8000 });
// Same model names as the app, so the collections match. Writes go in directly: sample records skip publish checks.
const open = { strict: false, timestamps: true };
const Spice = mongoose.model("SpiceProduct", new mongoose.Schema({}, open));
const Software = mongoose.model("TradingSoftware", new mongoose.Schema({}, open));

try {
  const removedSpices = await Spice.deleteMany({ slug: { $in: slugs.spices }, sku: /^SEED-/ });
  const removedSoftware = await Software.deleteMany({ slug: { $in: slugs.software } });
  console.log(`Removed ${removedSpices.deletedCount} spices and ${removedSoftware.deletedCount} software records from an earlier seed.`);
  if (!remove) {
    await Spice.insertMany(spices);
    await Software.insertMany(software);
    console.log(`Inserted ${spices.length} spices and ${software.length} trading software records.`);
  }
} finally {
  await mongoose.disconnect();
}
