"use client";

import { useMemo, useState } from "react";
import { Download, LayoutGrid, Printer } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { SRS_REPORTS, srsLabel, srsPillTone } from "../lib/srs";
import { useStore, itemPrice, formatINR } from "../lib/store";
import { downloadCsv } from "../lib/export";

export default function ReportsPage() {
  const { invoices, items, customers, rates, repairs, purchaseOrders } = useStore();
  const [report, setReport] = useState<(typeof SRS_REPORTS)[number]>("Sales Summary");

  const netSales = invoices.reduce((s, i) => s + i.total, 0);
  const stockValue = items.reduce((s, i) => s + itemPrice(i, rates) * i.stock, 0);
  const taxTotal = invoices.reduce((s, i) => s + i.gst, 0);

  const { headers, rows, moneyCols } = useMemo(() => {
    if (report === "Sales Summary") {
      return {
        headers: ["Invoice #", "Customer", "Subtotal", "Tax", "Total", "Status", "Date"],
        rows: invoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, srsLabel(i.status), i.date]),
        moneyCols: new Set([2, 3, 4]),
      };
    }
    if (report === "Inventory Aging") {
      return {
        headers: ["Item code", "Item", "Karat", "Weight (g)", "Stock", "Value", "Aging bucket"],
        rows: items.map((i) => [i.sku, i.name, i.karat, i.weight, i.stock, itemPrice(i, rates) * i.stock, i.stock <= 3 ? "0–30 days" : "31–90 days"]),
        moneyCols: new Set([5]),
      };
    }
    if (report === "Repair Pipeline") {
      return {
        headers: ["Repair #", "Customer", "Item", "Status", "Estimate", "Promised", "Priority"],
        rows: repairs.map((r) => [r.number, r.customer, r.item, srsLabel(r.status), r.estimate, r.promisedDate ?? "—", srsLabel(r.priority ?? "normal")]),
        moneyCols: new Set([4]),
      };
    }
    if (report === "Customer History") {
      return {
        headers: ["Code", "Customer", "Type", "Total Spend"],
        rows: customers.map((c) => [c.code, c.name, srsLabel(c.type), invoices.filter((i) => i.customer === c.name).reduce((s, i) => s + i.total, 0)]),
        moneyCols: new Set([3]),
      };
    }
    if (report === "Tax Summary") {
      return {
        headers: ["Invoice #", "Customer", "Taxable", "GST", "Total", "Date"],
        rows: invoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, i.date]),
        moneyCols: new Set([2, 3, 4]),
      };
    }
    return {
      headers: ["PO #", "Supplier", "Branch", "Amount", "Status", "Date"],
      rows: purchaseOrders.map((p) => [p.number, p.supplier, p.branch ?? "—", p.amount, srsLabel(p.status), p.date]),
      moneyCols: new Set([3]),
    };
  }, [report, invoices, items, rates, repairs, customers, purchaseOrders]);

  return (
    <AppShell searchPlaceholder="Search reports...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <LayoutGrid size={28} />
            <div>
              <span className="eyebrow">Reports · SCR-25</span>
              <h1>Reports Center</h1>
              <p>Standard operational reports per FR-153 to FR-156.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="ghost-action" type="button" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
            <button className="export-button" type="button" onClick={() => downloadCsv(`report-${report.toLowerCase().replace(/\s+/g, "-")}`, headers, rows)}><Download size={16} /> Export CSV</button>
          </div>
        </div>

        <div className="stat-cards">
          <article className="erp-kpi gold"><span>Net Sales</span><strong>{formatINR(netSales)}</strong></article>
          <article className="erp-kpi green"><span>Tax collected</span><strong>{formatINR(taxTotal)}</strong></article>
          <article className="erp-kpi blue"><span>Open repairs</span><strong>{repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length}</strong></article>
          <article className="erp-kpi violet"><span>Stock Value</span><strong>{formatINR(stockValue)}</strong></article>
        </div>

        <div className="tabs-bar">
          {SRS_REPORTS.map((r) => <button key={r} className={r === report ? "active" : ""} type="button" onClick={() => setReport(r)}>{r}</button>)}
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>
                        {typeof cell === "string" && ["paid", "posted", "ready", "in_progress", "closed"].some((s) => cell.toLowerCase().includes(s.replace("_", " ")))
                          ? <span className={`status-pill ${srsPillTone(cell.toLowerCase().replace(/ /g, "_"))}`}>{cell}</span>
                          : moneyCols.has(ci) && typeof cell === "number" ? formatINR(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 ? <tr><td colSpan={headers.length} className="empty-note">No data.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
