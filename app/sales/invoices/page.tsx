"use client";

import Link from "next/link";
import { ReceiptText, ShoppingCart } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { useStore, formatINR } from "../../lib/store";

export default function InvoicesPage() {
  const { invoices } = useStore();
  const totalSales = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <AppShell searchPlaceholder="Search invoices...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ReceiptText size={28} />
            <div>
              <span className="eyebrow">Sales</span>
              <h1>Sales Invoices</h1>
              <p>All invoices, including sales created at the POS counter.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="export-button" href="/pos"><ShoppingCart size={16} /> New Sale (POS)</Link>
          </div>
        </div>

        <section className="erp-kpis">
          <article className="erp-kpi gold"><span>Total Invoices</span><strong>{invoices.length}</strong></article>
          <article className="erp-kpi green"><span>Total Sales</span><strong>{formatINR(totalSales)}</strong></article>
          <article className="erp-kpi blue"><span>Paid</span><strong>{invoices.filter((i) => i.status === "Paid").length}</strong></article>
          <article className="erp-kpi violet"><span>Draft</span><strong>{invoices.filter((i) => i.status === "Draft").length}</strong></article>
        </section>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Invoice #</th><th>Customer</th><th>Items</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.number}</td>
                    <td>{inv.customer}</td>
                    <td>{inv.lines.reduce((s, l) => s + l.qty, 0)} item(s)</td>
                    <td>{formatINR(inv.subtotal)}</td>
                    <td>{formatINR(inv.gst)}</td>
                    <td><strong>{formatINR(inv.total)}</strong></td>
                    <td><span className={`status-pill ${inv.status === "Paid" ? "success" : "warning"}`}>{inv.status}</span></td>
                    <td>{inv.date}</td>
                  </tr>
                ))}
                {invoices.length === 0 ? <tr><td colSpan={8} className="empty-note">No invoices yet — make a sale at the POS.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
