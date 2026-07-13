"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { legacyMovementLabel } from "../../lib/srs";
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
              <span className="eyebrow">Inventory · FR-INV-001</span>
              <h1>Movement Ledger</h1>
              <p>Perpetual inventory movements with source document traceability.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="export-button" href="/inventory">Back to Inventory</Link>
          </div>
        </div>

        <article className="erp-panel table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Movement type</th><th>Item</th><th>Qty / weight</th><th>From</th><th>To</th><th>User</th></tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.date}</td>
                    <td><span className="status-pill warning">{legacyMovementLabel(m.type)}</span></td>
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
