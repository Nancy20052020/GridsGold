"use client";

import { useState } from "react";
import { Plus, Wrench, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore } from "../lib/store";

const statuses = ["Received", "In Progress", "Ready", "Delivered"] as const;

export default function RepairsPage() {
  const { repairs, addRepair, customers } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer: "", item: "", issue: "", estimate: "" });
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer.trim() || !form.item.trim() || !form.issue.trim()) {
      setError("Customer, item and issue are required.");
      return;
    }
    addRepair({ customer: form.customer.trim(), item: form.item.trim(), issue: form.issue.trim(), estimate: Number(form.estimate) || 0 });
    setForm({ customer: "", item: "", issue: "", estimate: "" });
    setError("");
    setOpen(false);
  }

  return (
    <AppShell searchPlaceholder="Search repairs...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Wrench size={28} />
            <div>
              <span className="eyebrow">Repairs</span>
              <h1>Repairs &amp; Service Orders</h1>
              <p>Track every job from intake to pickup.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => setOpen(true)}><Plus size={16} /> New Repair</button>
          </div>
        </div>

        <section className="erp-kpis">
          {statuses.map((s, i) => (
            <article className={`erp-kpi ${["blue", "violet", "gold", "green"][i]}`} key={s}>
              <span>{s}</span>
              <strong>{repairs.filter((r) => r.status === s).length}</strong>
            </article>
          ))}
        </section>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Repair #</th><th>Customer</th><th>Item</th><th>Issue</th><th>Estimate</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {repairs.map((r) => (
                  <tr key={r.id}>
                    <td>{r.number}</td>
                    <td>{r.customer}</td>
                    <td>{r.item}</td>
                    <td>{r.issue}</td>
                    <td>₹ {r.estimate.toLocaleString("en-IN")}</td>
                    <td><span className={`status-pill ${r.status === "Delivered" || r.status === "Ready" ? "success" : r.status === "In Progress" ? "warning" : "danger"}`}>{r.status}</span></td>
                    <td>{r.date}</td>
                  </tr>
                ))}
                {repairs.length === 0 ? <tr><td colSpan={7} className="empty-note">No repairs yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>New Repair Order</h2>
            <div className="form-grid">
              <label className="field"><span>Customer *</span><div className="field-input">
                <input list="cust-list" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
                <datalist id="cust-list">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
              </div></label>
              <label className="field"><span>Item *</span><div className="field-input"><input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. Gold Ring" /></div></label>
              <label className="field" style={{ gridColumn: "1 / -1" }}><span>Issue / work *</span><div className="field-input"><input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="e.g. Ring resizing to US 7" /></div></label>
              <label className="field"><span>Estimate (₹)</span><div className="field-input"><input type="number" value={form.estimate} onChange={(e) => setForm({ ...form, estimate: e.target.value })} placeholder="1200" /></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Create Repair</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
