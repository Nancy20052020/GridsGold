"use client";

import { useState } from "react";
import { PackageCheck, Plus, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR } from "../lib/store";
import { CURRENCY_CODES, CURRENCY_LABELS, type CurrencyCode } from "../lib/srs";

export default function SuppliersPage() {
  const { suppliers, addSupplier, baseCurrency } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", phone: "", currency: baseCurrency as CurrencyCode });
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    addSupplier({ name: form.name.trim(), city: form.city.trim(), phone: form.phone.trim(), currency: form.currency });
    setForm({ name: "", city: "", phone: "", currency: baseCurrency });
    setError("");
    setOpen(false);
  }

  return (
    <AppShell searchPlaceholder="Search suppliers...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <PackageCheck size={28} />
            <div>
              <span className="eyebrow">Purchasing</span>
              <h1>Suppliers</h1>
              <p>Vendor master with outstanding balances.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => setOpen(true)}><Plus size={16} /> Add Supplier</button>
          </div>
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>City</th><th>Phone</th><th>Currency</th><th>Outstanding</th></tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>{s.code}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.city || "—"}</td>
                    <td>{s.phone || "—"}</td>
                    <td>{s.currency ?? baseCurrency}</td>
                    <td>{s.balance ? formatINR(s.balance, s.currency as CurrencyCode | undefined) : "—"}</td>
                  </tr>
                ))}
                {suppliers.length === 0 ? <tr><td colSpan={6} className="empty-note">No suppliers yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Add Supplier</h2>
            <div className="form-grid">
              <label className="field"><span>Name *</span><div className="field-input"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Star Diamonds" /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" /></div></label>
              <label className="field"><span>Phone</span><div className="field-input"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." /></div></label>
              <label className="field"><span>Currency</span><div className="field-input"><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}>{CURRENCY_CODES.map((code) => <option key={code} value={code}>{CURRENCY_LABELS[code]}</option>)}</select></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Save Supplier</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
