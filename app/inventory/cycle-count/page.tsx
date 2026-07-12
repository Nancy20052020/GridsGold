"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { useStore } from "../../lib/store";

export default function CycleCountPage() {
  const { items, cycleCount } = useStore();
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  function apply() {
    let applied = 0;
    for (const [id, val] of Object.entries(counts)) {
      if (val !== "" && val !== undefined) {
        cycleCount(id, Number(val) || 0);
        applied++;
      }
    }
    setMsg(applied ? `Applied ${applied} count(s). Stock updated and variances logged.` : "Enter at least one counted value.");
    setCounts({});
  }

  return (
    <AppShell>
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ClipboardCheck size={28} />
            <div>
              <span className="eyebrow">Inventory</span>
              <h1>Cycle Count</h1>
              <p>Enter physically counted quantities. Variance vs system is applied on save.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={apply}>Apply Counts</button>
          </div>
        </div>

        {msg ? <div className="banner-success">{msg}</div> : null}

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Item</th><th>SKU</th><th>System Qty</th><th>Counted</th><th>Variance</th></tr></thead>
              <tbody>
                {items.map((i) => {
                  const counted = counts[i.id];
                  const variance = counted === "" || counted === undefined ? null : Number(counted) - i.stock;
                  return (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>{i.sku}</td>
                      <td>{i.stock}</td>
                      <td style={{ maxWidth: 120 }}>
                        <div className="field-input" style={{ minHeight: 38 }}>
                          <input type="number" placeholder="—" value={counted ?? ""} onChange={(e) => setCounts((c) => ({ ...c, [i.id]: e.target.value }))} />
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: variance == null ? "var(--muted)" : variance === 0 ? "#087f45" : "#c92a2a" }}>
                        {variance == null ? "—" : variance > 0 ? `+${variance}` : variance}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
