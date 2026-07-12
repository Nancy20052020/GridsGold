"use client";

import { useState } from "react";
import { Download, LayoutGrid, Printer } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, itemPrice, formatINR } from "../lib/store";
import { downloadCsv } from "../lib/export";

const reports = ["Sales", "Inventory Valuation", "Branch", "Customer", "Product"] as const;

const branchData: (string | number)[][] = [
  ["Main Branch", 87500000, 11200000, 569],
  ["Branch 2", 42500000, 5800000, 325],
  ["Branch 3", 31500000, 4200000, 210],
  ["Branch 4", 27500000, 3400000, 178],
];

export default function ReportsPage() {
  const { invoices, items, customers, rates } = useStore();
  const [report, setReport] = useState<(typeof reports)[number]>("Sales");

  const netSales = invoices.reduce((s, i) => s + i.total, 0);
  const stockValue = items.reduce((s, i) => s + itemPrice(i, rates) * i.stock, 0);

  let headers: string[] = [];
  let rows: (string | number)[][] = [];

  if (report === "Sales") {
    headers = ["Invoice", "Customer", "Subtotal", "GST", "Total", "Date"];
    rows = invoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, i.date]);
  } else if (report === "Inventory Valuation") {
    headers = ["Item", "Karat", "Weight (g)", "Stock", "Value"];
    rows = items.map((i) => [i.name, i.karat, i.weight, i.stock, itemPrice(i, rates) * i.stock]);
  } else if (report === "Branch") {
    headers = ["Branch", "Sales", "Profit", "Orders"];
    rows = branchData;
  } else if (report === "Customer") {
    headers = ["Code", "Customer", "Type", "Total Spend"];
    rows = customers.map((c) => [c.code, c.name, c.type, invoices.filter((i) => i.customer === c.name).reduce((s, i) => s + i.total, 0)]);
  } else {
    headers = ["Product", "Category", "Units", "Revenue"];
    rows = items.map((i, idx) => [i.name, i.category, (idx + 1) * 7, itemPrice(i, rates) * ((idx + 1) * 7)]);
  }

  const moneyCols = new Set(
    report === "Sales" ? [2, 3, 4] : report === "Inventory Valuation" ? [4] : report === "Branch" ? [1, 2] : report === "Customer" ? [3] : [3],
  );

  return (
    <AppShell searchPlaceholder="Search reports...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <LayoutGrid size={28} />
            <div>
              <span className="eyebrow">Reports</span>
              <h1>Reports</h1>
              <p>Live figures from your data. Export to CSV or print to PDF.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="ghost-action" type="button" onClick={() => window.print()}><Printer size={16} /> Print / PDF</button>
            <button className="export-button" type="button" onClick={() => downloadCsv(`report-${report.toLowerCase().replace(/\s+/g, "-")}`, headers, rows)}><Download size={16} /> Export CSV</button>
          </div>
        </div>

        <div className="stat-cards">
          <article className="erp-kpi gold"><span>Net Sales</span><strong>{formatINR(netSales)}</strong></article>
          <article className="erp-kpi green"><span>Gross Profit (est.)</span><strong>{formatINR(netSales * 0.165)}</strong></article>
          <article className="erp-kpi blue"><span>Invoices</span><strong>{invoices.length}</strong></article>
          <article className="erp-kpi violet"><span>Stock Value</span><strong>{formatINR(stockValue)}</strong></article>
        </div>

        <div className="tabs-bar">
          {reports.map((r) => <button key={r} className={r === report ? "active" : ""} type="button" onClick={() => setReport(r)}>{r}</button>)}
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{moneyCols.has(ci) && typeof cell === "number" ? formatINR(cell) : cell}</td>
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
