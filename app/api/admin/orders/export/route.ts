import { logActivity } from "@/lib/admin/activity";
import { authorize } from "@/lib/admin/api";
import { normalizeOrderStatus, orderSourceLabels, orderStatusLabels, type OrderSource } from "@/lib/admin/constants";
import { buildFilter, resources } from "@/lib/admin/resources";
import { listQuerySchema } from "@/lib/admin/schemas";
import { buildXlsx, type XlsxColumn } from "@/lib/admin/xlsx";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { SpiceOrder } from "@/models/SpiceOrder";

export const runtime = "nodejs";

const MAX_ORDERS = 20000;

const columns: XlsxColumn[] = [
  { header: "Order ID", width: 24 },
  { header: "Customer Name", width: 26 },
  { header: "Phone", width: 18 },
  { header: "Product", width: 30 },
  { header: "Category", width: 16 },
  { header: "Quality", width: 18 },
  { header: "Quantity (kg)", width: 14 },
  { header: "Price per kg", width: 14, money: true },
  { header: "Total", width: 14, money: true },
  { header: "Order Total", width: 14, money: true },
  { header: "Currency", width: 10 },
  { header: "Order Date", width: 20 },
  { header: "Order Source", width: 18 },
  { header: "Order Status", width: 14 },
];

const orderDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Downloads orders as Excel, one row per ordered item, using the same filters as the orders list. Values come straight from the saved order snapshots. */
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const query = listQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
    const orders = await SpiceOrder.find(buildFilter(resources.orders, query))
      .sort({ createdAt: query.sort === "oldest" ? 1 : -1 })
      .limit(MAX_ORDERS)
      .lean();

    const rows = orders.flatMap((order) =>
      order.items.map((item) => [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        item.name,
        item.category,
        item.quality,
        item.quantity,
        item.unitPrice,
        item.lineTotal,
        order.totalAmount,
        item.currency || order.currency,
        orderDate.format(new Date((order as unknown as { createdAt: Date }).createdAt)),
        orderSourceLabels[(order.source ?? "website") as OrderSource],
        orderStatusLabels[normalizeOrderStatus(order.status)],
      ]),
    );

    await logActivity(auth.admin, "exported", "spice orders", undefined, `${orders.length} orders to Excel`);

    const file = buildXlsx("Orders", columns, rows);
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="goldenfalcone-orders-${stamp}.xlsx"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serverError(error, "admin:orders:export");
  }
}
