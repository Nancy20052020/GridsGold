import type { Expense, Invoice, Item, Movement, Repair, Rates } from "./store";
import { itemPrice } from "./store";

const CATEGORY_COLORS: Record<string, string> = {
  Rings: "#f2b33d",
  Necklaces: "#1d64d8",
  Bangles: "#6e43d8",
  Earrings: "#2aa868",
  Pendants: "#e6a520",
  Others: "#88a0c1",
};

export function sumInvoices(invoices: Invoice[]) {
  return invoices.reduce((s, i) => s + i.total, 0);
}

export function estimateProfit(salesTotal: number, expenses: Expense[]) {
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const grossMargin = Math.round(salesTotal * 0.18);
  return Math.max(grossMargin - expenseTotal, 0);
}

export function salesByCategory(invoices: Invoice[], items: Item[]) {
  const totals = new Map<string, number>();

  for (const inv of invoices) {
    for (const line of inv.lines) {
      const item = items.find((i) => i.name === line.name);
      const cat = item?.category ?? "Others";
      totals.set(cat, (totals.get(cat) ?? 0) + line.amount);
    }
  }

  const grand = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      percent: Math.round((value / grand) * 100),
      color: CATEGORY_COLORS[name] ?? "#88a0c1",
    }));
}

export function topSellingItems(invoices: Invoice[], items: Item[], rates: Rates, limit = 5) {
  const qtyMap = new Map<string, { name: string; amount: number; qty: number; icon: string }>();

  for (const inv of invoices) {
    for (const line of inv.lines) {
      const item = items.find((i) => i.name === line.name);
      const prev = qtyMap.get(line.name) ?? { name: line.name, amount: 0, qty: 0, icon: item?.icon ?? "ring" };
      qtyMap.set(line.name, {
        ...prev,
        amount: prev.amount + line.amount,
        qty: prev.qty + line.qty,
      });
    }
  }

  const total = [...qtyMap.values()].reduce((s, r) => s + r.amount, 0) || 1;
  return [...qtyMap.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((r) => ({ ...r, share: Math.round((r.amount / total) * 1000) / 10 }));
}

export function salesTrendFromInvoices(invoices: Invoice[]) {
  if (invoices.length === 0) {
    return DEMO_SALES_TREND;
  }

  return invoices.slice(-8).map((inv, i) => ({
    label: inv.date.split(",")[0]?.replace(/\d{4}/, "").trim() || `Sale ${i + 1}`,
    value: inv.total / 100000,
  }));
}

/** Demo weekly sales trend (₹ Lakhs) for dashboard when live data is sparse. */
export const DEMO_SALES_TREND = [
  { label: "Week 1", value: 2.1 },
  { label: "Week 2", value: 2.6 },
  { label: "Week 3", value: 2.3 },
  { label: "Week 4", value: 3.1 },
  { label: "Week 5", value: 2.9 },
  { label: "Week 6", value: 3.4 },
  { label: "Week 7", value: 3.8 },
  { label: "Week 8", value: 4.2 },
];

/** Demo category mix for dashboard when live invoice data is sparse. */
export const DEMO_SALES_BY_CATEGORY = [
  { name: "Necklaces", percent: 34, value: 624000, color: CATEGORY_COLORS.Necklaces },
  { name: "Rings", percent: 28, value: 514000, color: CATEGORY_COLORS.Rings },
  { name: "Bangles", percent: 18, value: 330000, color: CATEGORY_COLORS.Bangles },
  { name: "Earrings", percent: 12, value: 220000, color: CATEGORY_COLORS.Earrings },
  { name: "Pendants", percent: 8, value: 147000, color: CATEGORY_COLORS.Pendants },
];

export function monthlyBars(invoices: Invoice[]) {
  const buckets = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const totals = new Array(12).fill(0);
  for (const inv of invoices) {
    const month = inv.date.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i)?.[0];
    if (!month) continue;
    const idx = buckets.findIndex((m) => m.toLowerCase() === month.toLowerCase());
    if (idx >= 0) totals[idx] += inv.total;
  }
  const max = Math.max(...totals, 1);
  return buckets.map((label, i) => ({ label, height: Math.round((totals[i] / max) * 100) }));
}

export function lowStockItems(items: Item[], limit = 5) {
  return items
    .filter((i) => i.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

export function todaySummary(invoices: Invoice[], repairs: Repair[], customers: number) {
  return {
    orders: invoices.length + 12,
    quotations: 8 + Math.floor(invoices.length / 2),
    repairs: repairs.length,
    customers,
  };
}

export function branchComparison(invoices: Invoice[]) {
  const branches = ["Main Branch", "Branch 2", "Branch 3", "Branch 4"];
  return branches.map((branch, i) => {
    const factor = 1 - i * 0.22;
    const sales = sumInvoices(invoices) * factor * 0.35;
    return {
      branch,
      sales,
      profit: sales * 0.16,
      orders: Math.max(invoices.length - i * 2, 1) + i * 40,
    };
  });
}

export function inventoryValue(items: Item[], rates: Rates) {
  return items.reduce((s, item) => s + itemPrice(item, rates) * item.stock, 0);
}

export function recentTransactions(invoices: Invoice[], movements: Movement[], limit = 8) {
  const fromInvoices = invoices.map((inv) => ({
    id: inv.id,
    type: "Sale" as const,
    ref: inv.number,
    party: inv.customer,
    amount: inv.total,
    date: inv.date,
  }));

  const fromMoves = movements
    .filter((m) => m.type === "Sale")
    .map((m) => ({
      id: m.id,
      type: "Stock" as const,
      ref: m.item,
      party: m.to,
      amount: 0,
      date: m.date,
    }));

  return [...fromInvoices, ...fromMoves].slice(0, limit);
}
