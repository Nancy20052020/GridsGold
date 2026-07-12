"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { useStore } from "../../lib/store";

export default function StockMovementsPage() {
  const { movements } = useStore();

  return (
    <AppShell searchPlaceholder="Search stock movements...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ArrowLeftRight size={28} />
            <div>
              <span className="eyebrow">Inventory</span>
              <h1>Stock Movements</h1>
              <p>Every stock change — sales, transfers, adjustments and counts — is logged here.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="ghost-action" href="/inventory/transfers">New Transfer</Link>
            <Link className="export-button" href="/inventory/adjustments">New Adjustment</Link>
          </div>
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Item</th><th>Qty</th><th>From</th><th>To</th><th>User</th></tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.date}</td>
                    <td><span className={`status-pill ${m.type === "Sale" ? "success" : m.type === "Transfer" ? "warning" : "danger"}`}>{m.type}</span></td>
                    <td>{m.item}</td>
                    <td style={{ color: m.qty < 0 ? "#c92a2a" : "#087f45", fontWeight: 700 }}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                    <td>{m.from}</td>
                    <td>{m.to}</td>
                    <td>{m.user}</td>
                  </tr>
                ))}
                {movements.length === 0 ? <tr><td colSpan={7} className="empty-note">No movements yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
