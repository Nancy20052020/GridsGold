"use client";

import { useState } from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PO_STATUSES, srsLabel, srsPillTone } from "../lib/srs";
import { useStore, formatINR } from "../lib/store";

const tabs = ["Purchase Orders", "Suppliers"] as const;

export default function PurchaseOrdersPage() {
  const { purchaseOrders, addPurchaseOrder, suppliers, addSupplier, selectedBranch } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Purchase Orders");
  const [open, setOpen] = useState(false);
  const [supOpen, setSupOpen] = useState(false);
  const [form, setForm] = useState({ supplier: "", items: "", amount: "", currency: "INR" });
  const [supForm, setSupForm] = useState({ name: "", city: "", phone: "", paymentTerms: "Net 30" });
  const [error, setError] = useState("");

  function submitPo(event: React.FormEvent) {
    event.preventDefault();
    if (!form.supplier.trim() || !form.items.trim()) {
      setError("Supplier and items are required (FR-045).");
      return;
    }
    addPurchaseOrder({
      supplier: form.supplier.trim(),
      items: form.items.trim(),
      amount: Number(form.amount) || 0,
      branch: selectedBranch,
      currency: form.currency,
    });
    setForm({ supplier: "", items: "", amount: "", currency: "INR" });
    setError("");
    setOpen(false);
  }

  function submitSupplier(event: React.FormEvent) {
    event.preventDefault();
    if (!supForm.name.trim()) return;
    addSupplier({ name: supForm.name.trim(), city: supForm.city.trim(), phone: supForm.phone.trim(), paymentTerms: supForm.paymentTerms });
    setSupForm({ name: "", city: "", phone: "", paymentTerms: "Net 30" });
    setSupOpen(false);
  }

  return (
    <AppShell searchPlaceholder="Search purchase orders...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ClipboardList size={28} />
            <div>
              <span className="eyebrow">Purchasing · SCR-13 / SCR-14</span>
              <h1>Purchasing</h1>
              <p>Supplier master, purchase orders and goods receipt workflow.</p>
            </div>
          </div>
          <div className="heading-actions">
            {tab === "Purchase Orders" ? (
              <button className="export-button" type="button" onClick={() => setOpen(true)}><Plus size={16} /> New PO</button>
            ) : (
              <button className="export-button" type="button" onClick={() => setSupOpen(true)}><Plus size={16} /> Add Supplier</button>
            )}
          </div>
        </div>

        <div className="tabs-bar">
          {tabs.map((t) => <button key={t} className={t === tab ? "active" : ""} type="button" onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Purchase Orders" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr><th>PO #</th><th>Supplier</th><th>Branch</th><th>Items</th><th>Amount</th><th>Currency</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td>{po.number}</td>
                      <td>{po.supplier}</td>
                      <td>{po.branch ?? "—"}</td>
                      <td>{po.items}</td>
                      <td>{formatINR(po.amount)}</td>
                      <td>{po.currency ?? "INR"}</td>
                      <td><span className={`status-pill ${srsPillTone(po.status)}`}>{srsLabel(po.status)}</span></td>
                      <td>{po.date}</td>
                    </tr>
                  ))}
                  {purchaseOrders.length === 0 ? <tr><td colSpan={8} className="empty-note">No purchase orders yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ padding: "12px 16px", fontSize: 13 }}>
              PO lifecycle: {PO_STATUSES.map((s) => srsLabel(s)).join(" → ")}
            </p>
          </article>
        ) : null}

        {tab === "Suppliers" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Code</th><th>Legal name</th><th>Trade name</th><th>City</th><th>Phone</th><th>Terms</th><th>Payable</th></tr></thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.code}</td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.tradeName ?? "—"}</td>
                      <td>{s.city || "—"}</td>
                      <td>{s.phone || "—"}</td>
                      <td>{s.paymentTerms ?? "—"}</td>
                      <td>{s.balance ? formatINR(s.balance) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ) : null}
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submitPo}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>New Purchase Order</h2>
            <div className="form-grid">
              <label className="field"><span>Supplier *</span><div className="field-input">
                <input list="sup-list" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                <datalist id="sup-list">{suppliers.map((s) => <option key={s.id} value={s.name} />)}</datalist>
              </div></label>
              <label className="field"><span>Branch</span><div className="field-input"><input readOnly value={selectedBranch} /></div></label>
              <label className="field"><span>Items *</span><div className="field-input"><input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 22K casting grain 200g" /></div></label>
              <label className="field"><span>Amount (₹)</span><div className="field-input"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="250000" /></div></label>
              <label className="field"><span>Currency</span><div className="field-input"><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option>INR</option><option>USD</option><option>AED</option></select></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Create PO</button>
            </div>
          </form>
        </div>
      ) : null}

      {supOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submitSupplier}>
            <button className="modal-close" type="button" onClick={() => setSupOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Add Supplier</h2>
            <div className="form-grid">
              <label className="field"><span>Legal name *</span><div className="field-input"><input value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={supForm.city} onChange={(e) => setSupForm({ ...supForm, city: e.target.value })} /></div></label>
              <label className="field"><span>Phone</span><div className="field-input"><input value={supForm.phone} onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })} /></div></label>
              <label className="field"><span>Payment terms</span><div className="field-input"><input value={supForm.paymentTerms} onChange={(e) => setSupForm({ ...supForm, paymentTerms: e.target.value })} /></div></label>
            </div>
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setSupOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Save Supplier</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
