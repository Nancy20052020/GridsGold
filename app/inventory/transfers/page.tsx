"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { BRANCHES, useStore } from "../../lib/store";

export default function TransfersPage() {
  const { items, transferStock, movements } = useStore();
  const [itemId, setItemId] = useState("");
  const [to, setTo] = useState("Branch 2");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState("");

  const transfers = movements.filter((m) => m.type === "Transfer");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemId) { setMsg("Pick an item to transfer."); return; }
    transferStock(itemId, to, Number(qty) || 1);
    setMsg("Transfer recorded and logged in stock movements.");
    setItemId("");
    setQty("1");
  }

  return (
    <AppShell>
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ArrowRightLeft size={28} />
            <div>
              <span className="eyebrow">Inventory</span>
              <h1>Stock Transfers</h1>
              <p>Move stock between branches and locations.</p>
            </div>
          </div>
        </div>

        <div className="two-col">
          <form className="erp-panel form-panel" onSubmit={submit}>
            <h2 style={{ marginBottom: 14 }}>New Transfer</h2>
            <div className="form-grid">
              <label className="field"><span>Item</span><div className="field-input"><select value={itemId} onChange={(e) => setItemId(e.target.value)}><option value="">Select item…</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.branch}, {i.stock} pcs)</option>)}</select></div></label>
              <label className="field"><span>To branch</span><div className="field-input"><select value={to} onChange={(e) => setTo(e.target.value)}>{BRANCHES.map((b) => <option key={b}>{b}</option>)}</select></div></label>
              <label className="field"><span>Quantity</span><div className="field-input"><input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} /></div></label>
            </div>
            {msg ? <p className={msg.startsWith("Transfer recorded") ? "banner-success" : "auth-error"}>{msg}</p> : null}
            <div className="form-actions"><button className="gold-action" type="submit">Record Transfer</button></div>
          </form>

          <article className="erp-panel table-panel">
            <h2 style={{ marginBottom: 14 }}>Recent Transfers</h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Item</th><th>Qty</th><th>From</th><th>To</th></tr></thead>
                <tbody>
                  {transfers.map((m) => (
                    <tr key={m.id}><td>{m.date}</td><td>{m.item}</td><td>{m.qty}</td><td>{m.from}</td><td>{m.to}</td></tr>
                  ))}
                  {transfers.length === 0 ? <tr><td colSpan={5} className="empty-note">No transfers yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
