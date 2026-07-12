"use client";

import { useState } from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR } from "../lib/store";

export default function PurchaseOrdersPage() {
  const { purchaseOrders, addPurchaseOrder, suppliers } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier: "", items: "", amount: "" });
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.supplier.trim() || !form.items.trim()) {
      setError("Supplier and items are required.");
      return;
    }
    addPurchaseOrder({ supplier: form.supplier.trim(), items: form.items.trim(), amount: Number(form.amount) || 0 });
    setForm({ supplier: "", items: "", amount: "" });
    setError("");
    setOpen(false);
  }

  return (
    <AppShell searchPlaceholder="Search purchase orders...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ClipboardList size={28} />
            <div>
              <span className="eyebrow">Purchasing</span>
              <h1>Purchase Orders</h1>
              <p>Raise and track procurement from suppliers.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => setOpen(true)}><Plus size={16} /> New PO</button>
          </div>
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id}>
                    <td>{po.number}</td>
                    <td>{po.supplier}</td>
                    <td>{po.items}</td>
                    <td>{formatINR(po.amount)}</td>
                    <td><span className={`status-pill ${po.status === "Received" ? "success" : po.status === "Sent" ? "warning" : "danger"}`}>{po.status}</span></td>
                    <td>{po.date}</td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 ? <tr><td colSpan={6} className="empty-note">No purchase orders yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>New Purchase Order</h2>
            <div className="form-grid">
              <label className="field"><span>Supplier *</span><div className="field-input">
                <input list="sup-list" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                <datalist id="sup-list">{suppliers.map((s) => <option key={s.id} value={s.name} />)}</datalist>
              </div></label>
              <label className="field"><span>Items *</span><div className="field-input"><input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 22K casting grain 200g" /></div></label>
              <label className="field"><span>Amount (₹)</span><div className="field-input"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="250000" /></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Create PO</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
