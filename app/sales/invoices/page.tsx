"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ReceiptText, ShoppingCart, X } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { BrandMark } from "../../components/BrandMark";
import { srsLabel, srsPillTone } from "../../lib/srs";
import { useStore, formatINR, type Invoice } from "../../lib/store";

function InvoicesContent() {
  const { invoices } = useStore();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const [manual, setManual] = useState<Invoice | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const totalSales = invoices.reduce((s, i) => s + i.total, 0);

  const fromUrl =
    !dismissed && urlId
      ? invoices.find((inv) => inv.id === urlId || inv.number === urlId) ?? null
      : null;
  const selected = manual ?? fromUrl;

  function openInvoice(inv: Invoice) {
    setManual(inv);
    setDismissed(true);
  }

  function closeInvoice() {
    setManual(null);
    setDismissed(true);
  }

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

        <section className="erp-kpis erp-kpis-2">
          <article className="erp-kpi gold"><span>Total Invoices</span><strong>{invoices.length}</strong></article>
          <article className="erp-kpi green"><span>Total Sales</span><strong>{formatINR(totalSales)}</strong></article>
        </section>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Invoice #</th><th>Customer</th><th>Items</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="clickable" onClick={() => openInvoice(inv)}>
                    <td><strong>{inv.number}</strong></td>
                    <td>{inv.customer}</td>
                    <td>{inv.lines.reduce((s, l) => s + l.qty, 0)} item(s)</td>
                    <td>{formatINR(inv.subtotal)}</td>
                    <td>{formatINR(inv.gst)}</td>
                    <td><strong>{formatINR(inv.total)}</strong></td>
                    <td><span className={`status-pill ${srsPillTone(inv.status)}`}>{srsLabel(inv.status)}</span></td>
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
            <button className="modal-close" type="button" onClick={closeInvoice} aria-label="Close"><X size={18} /></button>
            <div className="receipt-head">
              <div className="receipt-brand"><BrandMark className="brand-mark" /> Grids Gold</div>
              <div>
                <strong>{selected.number}</strong>
                <small>{selected.date}</small>
              </div>
            </div>
            <div className="receipt-meta">
              <div><span>Billed to</span><strong>{selected.customer}</strong></div>
              <div><span>Status</span><strong>{srsLabel(selected.status)}</strong></div>
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
            <button className="ghost-action full" type="button" disabled title="FR-RET-001 — return workflow">Create Return</button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <AppShell searchPlaceholder="Search invoices...">
        <section className="page-content">
          <p className="muted">Loading invoices…</p>
        </section>
      </AppShell>
    }>
      <InvoicesContent />
    </Suspense>
  );
}
