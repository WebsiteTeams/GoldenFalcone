"use client";

import { Download } from "lucide-react";
import { buttonClass } from "./Button";
import { useUrlParams } from "./useUrlParams";

/** Downloads the orders matching the list's current search and filters. A plain link: the route sends the file as an attachment. */
export function ExportOrdersButton() {
  const { params } = useUrlParams();
  const next = new URLSearchParams(params.toString());
  next.delete("page");
  const query = next.toString();
  return (
    <a href={`/api/admin/orders/export${query ? `?${query}` : ""}`} className={buttonClass("secondary")}>
      <Download aria-hidden className="h-4 w-4" /> Export to Excel
    </a>
  );
}
