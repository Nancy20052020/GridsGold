"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, Printer } from "lucide-react";
import { AppShell } from "../components/AppShell";
import {
  inventoryAgingBucket,
  receivablesAging,
  salesByCategory,
  sumInvoices,
} from "../lib/analytics";
import {
  SRS_REPORT_CATEGORIES,
  type SrsReport,
  type SrsReportCategory,
  srsLabel,
  srsPillTone,
} from "../lib/srs";
import { useStore, itemPrice, formatINR } from "../lib/store";
import { downloadCsv } from "../lib/export";

const CATEGORY_ORDER = Object.keys(SRS_REPORT_CATEGORIES) as SrsReportCategory[];

export default function ReportsPage() {
  const { invoices, items, customers, rates, repairs, purchaseOrders, suppliers, movements } = useStore();
  const [category, setCategory] = useState<SrsReportCategory>("Sales");
  const [report, setReport] = useState<SrsReport>(SRS_REPORT_CATEGORIES.Sales[0]);

  const categoryReports = SRS_REPORT_CATEGORIES[category];
  const receivables = useMemo(() => receivablesAging(customers, invoices, repairs), [customers, invoices, repairs]);
  const categorySales = useMemo(() => salesByCategory(invoices, items), [invoices, items]);

  const netSales = sumInvoices(invoices);
  const stockValue = items.reduce((s, i) => s + itemPrice(i, rates) * i.stock, 0);
  const taxTotal = invoices.reduce((s, i) => s + i.gst, 0);
  const payablesTotal = suppliers.reduce((s, sup) => s + sup.balance, 0);
  const receivablesTotal = receivables.reduce((s, row) => s + row.outstanding, 0);
  const openRepairs = repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length;

  const categoryKpis = useMemo(() => {
    if (category === "Sales") {
      return [
        { label: "Net Sales", value: formatINR(netSales), tone: "gold" },
        { label: "Invoices", value: String(invoices.length), tone: "green" },
        { label: "Customers", value: String(customers.length), tone: "blue" },
        { label: "Top Category", value: categorySales[0]?.name ?? "—", tone: "violet" },
      ];
    }
    if (category === "Stock") {
      return [
        { label: "Stock Value", value: formatINR(stockValue), tone: "gold" },
        { label: "SKUs", value: String(items.length), tone: "green" },
        { label: "Transfers", value: String(movements.filter((m) => m.type === "Transfer").length), tone: "blue" },
        { label: "Purchase Orders", value: String(purchaseOrders.length), tone: "violet" },
      ];
    }
    if (category === "Repairs") {
      const repairValue = repairs.reduce((s, r) => s + (r.approvedAmount ?? r.estimate), 0);
      return [
        { label: "Open Jobs", value: String(openRepairs), tone: "gold" },
        { label: "Pipeline Value", value: formatINR(repairValue), tone: "green" },
        { label: "Balance Due", value: formatINR(repairs.reduce((s, r) => s + (r.balanceDue ?? 0), 0)), tone: "blue" },
        { label: "Urgent / VIP", value: String(repairs.filter((r) => r.priority === "urgent" || r.priority === "vip").length), tone: "violet" },
      ];
    }
    if (category === "Finance") {
      return [
        { label: "Receivables", value: formatINR(receivablesTotal), tone: "gold" },
        { label: "Payables", value: formatINR(payablesTotal), tone: "red" },
        { label: "AR Accounts", value: String(receivables.length), tone: "blue" },
        { label: "AP Suppliers", value: String(suppliers.filter((s) => s.balance > 0).length), tone: "violet" },
      ];
    }
    return [
      { label: "GST Collected", value: formatINR(taxTotal), tone: "gold" },
      { label: "Taxable Sales", value: formatINR(invoices.reduce((s, i) => s + i.subtotal, 0)), tone: "green" },
      { label: "Rate Cards", value: String(Object.keys(rates).length), tone: "blue" },
      { label: "22K Rate", value: formatINR(rates["22K"]), tone: "violet" },
    ];
  }, [category, netSales, invoices, customers, categorySales, stockValue, items, movements, purchaseOrders, openRepairs, repairs, receivablesTotal, payablesTotal, receivables, suppliers, taxTotal, rates]);

  const { headers, rows, moneyCols } = useMemo(() => {
    if (report === "Sales Summary") {
      return {
        headers: ["Invoice #", "Customer", "Subtotal", "Tax", "Total", "Status", "Date"],
        rows: invoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, srsLabel(i.status), i.date]),
        moneyCols: new Set([2, 3, 4]),
      };
    }
    if (report === "Sales by Category") {
      return {
        headers: ["Category", "Sales (₹)", "Share %"],
        rows: categorySales.map((c) => [c.name, c.value, `${c.percent}%`]),
        moneyCols: new Set([1]),
      };
    }
    if (report === "Inventory Balance") {
      return {
        headers: ["Item code", "Item", "Branch", "Stock", "Status", "Value"],
        rows: items.map((i) => [i.sku, i.name, i.branch, i.stock, i.stock <= 0 ? "sold" : "available", itemPrice(i, rates) * i.stock]),
        moneyCols: new Set([5]),
      };
    }
    if (report === "Inventory Aging") {
      return {
        headers: ["Item code", "Item", "Stock", "Value", "Aging bucket"],
        rows: items.map((i) => [i.sku, i.name, i.stock, itemPrice(i, rates) * i.stock, inventoryAgingBucket(i.sku, i.stock)]),
        moneyCols: new Set([3]),
      };
    }
    if (report === "Transfer History") {
      const transfers = movements.filter((m) => m.type === "Transfer");
      return {
        headers: ["Date", "Item", "Qty", "From branch", "To branch", "User"],
        rows: transfers.map((m) => [m.date, m.item, m.qty, m.from, m.to, m.user]),
        moneyCols: new Set<number>(),
      };
    }
    if (report === "Repair Pipeline") {
      return {
        headers: ["Repair #", "Customer", "Item", "Status", "Estimate", "Balance", "Promised", "Priority"],
        rows: repairs.map((r) => [r.number, r.customer, r.item, srsLabel(r.status), r.estimate, r.balanceDue ?? 0, r.promisedDate ?? "—", srsLabel(r.priority ?? "normal")]),
        moneyCols: new Set([4, 5]),
      };
    }
    if (report === "Customer History") {
      return {
        headers: ["Code", "Customer", "Type", "Invoices", "Total Spend", "Outstanding"],
        rows: customers.map((c) => {
          const custInvoices = invoices.filter((i) => i.customer === c.name);
          const spend = custInvoices.reduce((s, i) => s + i.total, 0);
          const outstanding = receivables.find((row) => row.customer === c.name)?.outstanding ?? 0;
          return [c.code, c.name, srsLabel(c.type), custInvoices.length, spend, outstanding];
        }),
        moneyCols: new Set([4, 5]),
      };
    }
    if (report === "Tax Summary") {
      return {
        headers: ["Invoice #", "Customer", "Taxable", "GST", "Total", "Status", "Date"],
        rows: invoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, srsLabel(i.status), i.date]),
        moneyCols: new Set([2, 3, 4]),
      };
    }
    if (report === "Receivables Aging") {
      return {
        headers: ["Customer", "Code", "Outstanding", "0–30 days", "31–60 days", "61+ days"],
        rows: receivables.map((row) => [row.customer, row.code, row.outstanding, row.bucket0to30, row.bucket31to60, row.bucket61plus]),
        moneyCols: new Set([2, 3, 4, 5]),
      };
    }
    if (report === "Payables Aging") {
      return {
        headers: ["Supplier", "Code", "Balance", "Terms", "Due bucket"],
        rows: suppliers.map((s) => [s.name, s.code, s.balance, s.paymentTerms ?? "—", s.balance > 500000 ? "31–60 days" : "0–30 days"]),
        moneyCols: new Set([2]),
      };
    }
    if (report === "Rate History") {
      return {
        headers: ["Metal / Karat", "Rate per gram (₹)", "Currency", "Effective"],
        rows: Object.entries(rates).map(([k, v]) => [k, v, "INR", "Today"]),
        moneyCols: new Set([1]),
      };
    }
    return {
      headers: ["PO #", "Supplier", "Branch", "Amount", "Status", "Date"],
      rows: purchaseOrders.map((p) => [p.number, p.supplier, p.branch ?? "—", p.amount, srsLabel(p.status), p.date]),
      moneyCols: new Set([3]),
    };
  }, [report, invoices, items, rates, repairs, customers, purchaseOrders, suppliers, movements, categorySales, receivables]);

  function selectCategory(next: SrsReportCategory) {
    setCategory(next);
    setReport(SRS_REPORT_CATEGORIES[next][0]);
  }

  return (
    <AppShell searchPlaceholder="Search reports...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <LayoutGrid size={28} />
            <div>
              <span className="eyebrow">Reports · FR-RPT-001</span>
              <h1>Reports Center</h1>
              <p>Deep Dive §12 reporting model — sales, stock, repairs, finance, tax.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="ghost-action" type="button" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
            <button className="export-button" type="button" onClick={() => downloadCsv(`report-${report.toLowerCase().replace(/\s+/g, "-")}`, headers, rows)}><Download size={16} /> Export CSV</button>
          </div>
        </div>

        <div className="reports-category-bar">
          {CATEGORY_ORDER.map((key) => (
            <button
              key={key}
              className={key === category ? "active" : ""}
              type="button"
              onClick={() => selectCategory(key)}
            >
              {key}
              <span>{SRS_REPORT_CATEGORIES[key].length}</span>
            </button>
          ))}
        </div>

        <div className="stat-cards">
          {categoryKpis.map((kpi) => (
            <article className={`erp-kpi ${kpi.tone}`} key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </article>
          ))}
        </div>

        <div className="tabs-bar reports-tabs">
          {categoryReports.map((r) => (
            <button key={r} className={r === report ? "active" : ""} type="button" onClick={() => setReport(r)}>
              {r}
            </button>
          ))}
        </div>

        <article className="erp-panel table-panel">
          <div className="reports-panel-head">
            <div>
              <h2>{report}</h2>
              <p className="muted">{category} · {rows.length} row{rows.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>
                        {typeof cell === "string" && ["Paid", "Posted", "Ready", "Progress", "Closed", "Approved", "Partial"].some((s) => cell.includes(s))
                          ? <span className={`status-pill ${srsPillTone(cell.toLowerCase().replace(/ /g, "_"))}`}>{cell}</span>
                          : moneyCols.has(ci) && typeof cell === "number" ? formatINR(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 ? <tr><td colSpan={headers.length} className="empty-note">No data for this report.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
