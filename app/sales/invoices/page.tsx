"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, ReceiptText, ShoppingCart, X } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { BrandMark } from "../../components/BrandMark";
import { useStore, formatINR, type Invoice } from "../../lib/store";

export default function InvoicesPage() {
  const { invoices } = useStore();
  const [selected, setSelected] = useState<Invoice | null>(null);
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
              <p>Click any invoice to open its receipt. Sales made at the POS appear here.</p>
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
                  <tr key={inv.id} className="clickable" onClick={() => setSelected(inv)}>
                    <td><strong>{inv.number}</strong></td>
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

      {selected ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card wide receipt">
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
            <div className="receipt-head">
              <div className="receipt-brand"><BrandMark className="brand-mark" /> Grids Gold</div>
              <div>
                <strong>{selected.number}</strong>
                <small>{selected.date}</small>
              </div>
            </div>
            <div className="receipt-meta">
              <div><span>Billed to</span><strong>{selected.customer}</strong></div>
              <div><span>Status</span><strong>{selected.status}</strong></div>
            </div>
            <table className="receipt-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead>
              <tbody>
                {selected.lines.map((l, i) => (
                  <tr key={i}><td>{l.name}</td><td>{l.qty}</td><td>{formatINR(l.amount)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="totals">
              <div><span>Sub Total</span><strong>{formatINR(selected.subtotal)}</strong></div>
              <div><span>GST (3%)</span><strong>{formatINR(selected.gst)}</strong></div>
              <div className="grand"><span>Total</span><strong>{formatINR(selected.total)}</strong></div>
            </div>
            <button className="gold-action full" type="button" onClick={() => window.print()}><Printer size={16} /> Print Receipt</button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
