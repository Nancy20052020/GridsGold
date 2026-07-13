"use client";

import { useState } from "react";
import { Factory, Plus, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { srsLabel, srsPillTone } from "../lib/srs";
import { useStore } from "../lib/store";

const tabs = ["Work Orders", "Wastage"] as const;
const karigars = ["Suresh Karigar", "Ramesh Workshop", "Anil Casting", "Vijay Polishing"];

export default function ManufacturingPage() {
  const { workOrders, addWorkOrder } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Work Orders");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: "", karigar: karigars[0], qtyPlanned: "", due: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product.trim()) return;
    addWorkOrder({ product: form.product.trim(), karigar: form.karigar, qtyPlanned: Number(form.qtyPlanned) || 0, due: form.due || "TBD" });
    setForm({ product: "", karigar: karigars[0], qtyPlanned: "", due: "" });
    setOpen(false);
  }

  return (
    <AppShell searchPlaceholder="Search manufacturing...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Factory size={28} />
            <div>
              <span className="eyebrow">Manufacturing · SCR-28</span>
              <h1>Manufacturing</h1>
              <p>Work orders, production stages and wastage (FR-185 to FR-191).</p>
            </div>
          </div>
          <div className="heading-actions">
            {tab === "Work Orders" ? <button className="export-button" type="button" onClick={() => setOpen(true)}><Plus size={16} /> New Work Order</button> : null}
          </div>
        </div>

        <section className="stat-cards stat-cards-3">
          <article className="erp-kpi gold"><span>Active Orders</span><strong>{workOrders.filter((w) => !["completed", "closed", "cancelled"].includes(w.status)).length}</strong></article>
          <article className="erp-kpi green"><span>Completed</span><strong>{workOrders.filter((w) => w.status === "completed" || w.status === "closed").length}</strong></article>
          <article className="erp-kpi blue"><span>Pieces Planned</span><strong>{workOrders.reduce((s, w) => s + w.qtyPlanned, 0)}</strong></article>
        </section>

        <div className="tabs-bar">
          {tabs.map((t) => <button key={t} className={t === tab ? "active" : ""} type="button" onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Work Orders" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Order #</th><th>Product</th><th>Workshop</th><th>Progress</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {workOrders.map((w) => (
                    <tr key={w.id}>
                      <td>{w.number}</td>
                      <td>{w.product}</td>
                      <td>{w.karigar}</td>
                      <td style={{ minWidth: 140 }}>
                        <div className="progress"><span style={{ width: `${w.qtyPlanned ? (w.qtyDone / w.qtyPlanned) * 100 : 0}%` }} /></div>
                        <small className="muted">{w.qtyDone}/{w.qtyPlanned}</small>
                      </td>
                      <td><span className={`status-pill ${srsPillTone(w.status)}`}>{srsLabel(w.status)}</span></td>
                      <td>{w.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ) : null}

        {tab === "Wastage" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Order #</th><th>Metal</th><th>Issued (g)</th><th>Recovered (g)</th><th>Wastage (g)</th></tr></thead>
                <tbody>
                  <tr><td>WO-MFG-000010</td><td>22K Gold</td><td>420.000</td><td>408.500</td><td style={{ color: "#c92a2a", fontWeight: 700 }}>11.500</td></tr>
                  <tr><td>WO-MFG-000011</td><td>22K Gold</td><td>1050.000</td><td>1032.250</td><td style={{ color: "#c92a2a", fontWeight: 700 }}>17.750</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        ) : null}
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>New Work Order</h2>
            <div className="form-grid">
              <label className="field"><span>Product *</span><div className="field-input"><input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="e.g. 22K Bangle (custom)" /></div></label>
              <label className="field"><span>Workshop</span><div className="field-input"><select value={form.karigar} onChange={(e) => setForm({ ...form, karigar: e.target.value })}>{karigars.map((k) => <option key={k}>{k}</option>)}</select></div></label>
              <label className="field"><span>Qty planned</span><div className="field-input"><input type="number" value={form.qtyPlanned} onChange={(e) => setForm({ ...form, qtyPlanned: e.target.value })} placeholder="20" /></div></label>
              <label className="field"><span>Due date</span><div className="field-input"><input value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} placeholder="10 May, 2025" /></div></label>
            </div>
            <div className="form-actions"><button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="gold-action" type="submit">Create Work Order</button></div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
