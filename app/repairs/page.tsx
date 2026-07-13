"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Plus, Wrench, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import {
  REPAIR_PRIORITIES,
  REPAIR_STATUSES,
  nextRepairStatus,
  srsLabel,
  srsPillTone,
  type RepairStatus,
} from "../lib/srs";
import { useStore, formatINR } from "../lib/store";

export default function RepairsPage() {
  const { repairs, addRepair, updateRepairStatus, customers } = useStore();
  const [open, setOpen] = useState(false);
  const [boardFilter, setBoardFilter] = useState<RepairStatus | "all">("all");
  const [form, setForm] = useState({
    customer: "",
    item: "",
    issue: "",
    estimate: "",
    deposit: "",
    promisedDate: "",
    priority: "normal" as const,
  });
  const [error, setError] = useState("");

  const pipeline = useMemo(() => {
    const counts: Record<string, number> = {};
    REPAIR_STATUSES.forEach((s) => { counts[s] = repairs.filter((r) => r.status === s).length; });
    return counts;
  }, [repairs]);

  const visible = useMemo(
    () => (boardFilter === "all" ? repairs : repairs.filter((r) => r.status === boardFilter)),
    [repairs, boardFilter],
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer.trim() || !form.item.trim() || !form.issue.trim()) {
      setError("Customer, item and issue are required (FR-110).");
      return;
    }
    const estimate = Number(form.estimate) || 0;
    const deposit = Number(form.deposit) || 0;
    addRepair({
      customer: form.customer.trim(),
      item: form.item.trim(),
      issue: form.issue.trim(),
      estimate,
      approvedAmount: estimate,
      deposit,
      promisedDate: form.promisedDate.trim() || undefined,
      priority: form.priority,
    });
    setForm({ customer: "", item: "", issue: "", estimate: "", deposit: "", promisedDate: "", priority: "normal" });
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
              <span className="eyebrow">Repairs · SCR-20 / SCR-21</span>
              <h1>Repairs &amp; Service Orders</h1>
              <p>Intake, status board, deposits and pickup — per SRS repair workflow.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => setOpen(true)}><Plus size={16} /> New Repair</button>
          </div>
        </div>

        <section className="erp-kpis erp-kpis-4">
          {(["received", "in_progress", "ready", "delivered"] as const).map((s, i) => (
            <article className={`erp-kpi ${["blue", "violet", "gold", "green"][i]}`} key={s}>
              <span>{srsLabel(s)}</span>
              <strong>{pipeline[s] ?? 0}</strong>
            </article>
          ))}
        </section>

        <div className="category-tabs compact-tabs" style={{ marginBottom: 16 }}>
          <button type="button" className={boardFilter === "all" ? "active" : ""} onClick={() => setBoardFilter("all")}>All</button>
          {REPAIR_STATUSES.map((s) => (
            <button key={s} type="button" className={boardFilter === s ? "active" : ""} onClick={() => setBoardFilter(s)}>
              {srsLabel(s)} ({pipeline[s] ?? 0})
            </button>
          ))}
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Repair #</th><th>Customer</th><th>Item</th><th>Issue</th><th>Estimate</th><th>Deposit</th><th>Balance</th><th>Promised</th><th>Priority</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const next = nextRepairStatus(r.status);
                  return (
                    <tr key={r.id}>
                      <td>{r.number}</td>
                      <td>{r.customer}</td>
                      <td>{r.item}</td>
                      <td>{r.issue}</td>
                      <td>{formatINR(r.estimate)}</td>
                      <td>{r.deposit ? formatINR(r.deposit) : "—"}</td>
                      <td>{r.balanceDue ? formatINR(r.balanceDue) : "—"}</td>
                      <td>{r.promisedDate || "—"}</td>
                      <td><span className={`status-pill ${r.priority === "urgent" || r.priority === "high" ? "danger" : "success"}`}>{srsLabel(r.priority ?? "normal")}</span></td>
                      <td><span className={`status-pill ${srsPillTone(r.status)}`}>{srsLabel(r.status)}</span></td>
                      <td>
                        {next ? (
                          <button type="button" className="ghost-action compact" onClick={() => updateRepairStatus(r.id, next)} title={`Advance to ${srsLabel(next)}`}>
                            <ChevronRight size={16} />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                {visible.length === 0 ? <tr><td colSpan={11} className="empty-note">No repairs in this status.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Repair Intake</h2>
            <div className="form-grid">
              <label className="field"><span>Customer *</span><div className="field-input">
                <input list="cust-list" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
                <datalist id="cust-list">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
              </div></label>
              <label className="field"><span>Item *</span><div className="field-input"><input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. Gold Ring" /></div></label>
              <label className="field" style={{ gridColumn: "1 / -1" }}><span>Issue description *</span><div className="field-input"><input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="e.g. Ring resizing to US 7" /></div></label>
              <label className="field"><span>Estimate (₹)</span><div className="field-input"><input type="number" value={form.estimate} onChange={(e) => setForm({ ...form, estimate: e.target.value })} placeholder="1200" /></div></label>
              <label className="field"><span>Deposit (₹)</span><div className="field-input"><input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="500" /></div></label>
              <label className="field"><span>Promised date</span><div className="field-input"><input value={form.promisedDate} onChange={(e) => setForm({ ...form, promisedDate: e.target.value })} placeholder="e.g. 15 May, 2025" /></div></label>
              <label className="field"><span>Priority</span><div className="field-input"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}>{REPAIR_PRIORITIES.map((p) => <option key={p} value={p}>{srsLabel(p)}</option>)}</select></div></label>
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
