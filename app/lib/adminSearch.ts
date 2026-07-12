import { adminNavGroups } from "./adminNav";
import type { Customer, Invoice, Item, Repair } from "./store";

export type AdminSearchResult = {
  id: string;
  label: string;
  meta: string;
  href: string;
  kind: "page" | "item" | "customer" | "invoice" | "repair";
};

type SearchData = {
  items: Item[];
  customers: Customer[];
  invoices: Invoice[];
  repairs: Repair[];
};

export function adminSearch(query: string, data: SearchData, limit = 8): AdminSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: AdminSearchResult[] = [];

  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.label.toLowerCase().includes(q)) {
        results.push({
          id: `page-${item.href}`,
          label: item.label,
          meta: group.label,
          href: item.href,
          kind: "page",
        });
      }
    }
  }

  for (const item of data.items) {
    if (item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)) {
      results.push({
        id: `item-${item.id}`,
        label: item.name,
        meta: item.sku,
        href: `/inventory/item-details?id=${item.id}`,
        kind: "item",
      });
    }
  }

  for (const customer of data.customers) {
    if (
      customer.name.toLowerCase().includes(q) ||
      customer.code.toLowerCase().includes(q) ||
      customer.mobile.includes(q)
    ) {
      results.push({
        id: `customer-${customer.id}`,
        label: customer.name,
        meta: customer.mobile,
        href: "/customers",
        kind: "customer",
      });
    }
  }

  for (const invoice of data.invoices) {
    if (invoice.number.toLowerCase().includes(q) || invoice.customer.toLowerCase().includes(q)) {
      results.push({
        id: `invoice-${invoice.id}`,
        label: invoice.number,
        meta: invoice.customer,
        href: "/sales/invoices",
        kind: "invoice",
      });
    }
  }

  for (const repair of data.repairs) {
    if (repair.number.toLowerCase().includes(q) || repair.customer.toLowerCase().includes(q)) {
      results.push({
        id: `repair-${repair.id}`,
        label: repair.number,
        meta: repair.customer,
        href: "/repairs",
        kind: "repair",
      });
    }
  }

  return results.slice(0, limit);
}

export const searchKindLabels: Record<AdminSearchResult["kind"], string> = {
  page: "Page",
  item: "Inventory",
  customer: "Customer",
  invoice: "Invoice",
  repair: "Repair",
};
