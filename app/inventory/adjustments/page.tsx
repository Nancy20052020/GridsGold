"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { useStore } from "../../lib/store";

const reasons = ["Damaged", "Found", "Lost", "Correction", "Sample", "Write-off"];

export default function AdjustmentsPage() {
  const { items, adjustStock, movements } = useStore();
  const [itemId, setItemId] = useState("");
  const [delta, setDelta] = useState("-1");
  const [reason, setReason] = useState("Damaged");
  const [msg, setMsg] = useState("");

  const adjustments = movements.filter((m) => m.type === "Adjustment");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemId) { setMsg("Pick an item to adjust."); return; }
    adjustStock(itemId, Number(delta) || 0, reason);
    setMsg("Adjustment applied and stock updated.");
    setItemId("");
    setDelta("-1");
  }

  return (
    <AppShell>
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <SlidersHorizontal size={28} />
            <div>
              <span className="eyebrow">Inventory</span>
              <h1>Stock Adjustments</h1>
              <p>Increase or decrease stock with a reason. Updates inventory immediately.</p>
            </div>
          </div>
        </div>

        <div className="two-col">
          <form className="erp-panel form-panel" onSubmit={submit}>
            <h2 style={{ marginBottom: 14 }}>New Adjustment</h2>
            <div className="form-grid">
              <label className="field"><span>Item</span><div className="field-input"><select value={itemId} onChange={(e) => setItemId(e.target.value)}><option value="">Select item…</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.stock} pcs)</option>)}</select></div></label>
              <label className="field"><span>Change (+/-)</span><div className="field-input"><input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} /></div></label>
              <label className="field"><span>Reason</span><div className="field-input"><select value={reason} onChange={(e) => setReason(e.target.value)}>{reasons.map((r) => <option key={r}>{r}</option>)}</select></div></label>
            </div>
            {msg ? <p className={msg.startsWith("Adjustment applied") ? "banner-success" : "auth-error"}>{msg}</p> : null}
            <div className="form-actions"><button className="gold-action" type="submit">Apply Adjustment</button></div>
          </form>

          <article className="erp-panel table-panel">
            <h2 style={{ marginBottom: 14 }}>Recent Adjustments</h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Item</th><th>Change</th><th>Reason</th></tr></thead>
                <tbody>
                  {adjustments.map((m) => (
                    <tr key={m.id}><td>{m.date}</td><td>{m.item}</td><td style={{ color: m.qty < 0 ? "#c92a2a" : "#087f45", fontWeight: 700 }}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td><td>{m.to}</td></tr>
                  ))}
                  {adjustments.length === 0 ? <tr><td colSpan={4} className="empty-note">No adjustments yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
