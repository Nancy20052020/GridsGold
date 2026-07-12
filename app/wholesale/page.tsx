"use client";

import { useState } from "react";
import { Download, Handshake, Plus, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR } from "../lib/store";
import { downloadCsv } from "../lib/export";

const tabs = ["B2B Customers", "Bulk Orders", "Dispatch", "Pricing"] as const;

const priceTiers = [
  ["Tier 1 · Standard", "Making + 8%", "0%", "₹ 0"],
  ["Tier 2 · Silver", "Making + 6%", "2%", "₹ 2,00,000"],
  ["Tier 3 · Gold", "Making + 4%", "4%", "₹ 5,00,000"],
  ["Tier 4 · Platinum", "Making + 2%", "6%", "₹ 10,00,000"],
];

export default function WholesalePage() {
  const { customers, addCustomer, bulkOrders, addBulkOrder } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("B2B Customers");
  const [modal, setModal] = useState<null | "customer" | "order">(null);
  const [cust, setCust] = useState({ name: "", mobile: "", city: "" });
  const [order, setOrder] = useState({ customer: "", pieces: "", amount: "" });

  const b2b = customers.filter((c) => c.type === "Wholesale");

  function saveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!cust.name.trim()) return;
    addCustomer({ name: cust.name.trim(), mobile: cust.mobile.trim(), email: "", city: cust.city.trim(), type: "Wholesale" });
    setCust({ name: "", mobile: "", city: "" });
    setModal(null);
  }

  function saveOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!order.customer.trim()) return;
    addBulkOrder({ customer: order.customer.trim(), pieces: Number(order.pieces) || 0, amount: Number(order.amount) || 0 });
    setOrder({ customer: "", pieces: "", amount: "" });
    setModal(null);
  }

  return (
    <AppShell searchPlaceholder="Search wholesale...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Handshake size={28} />
            <div>
              <span className="eyebrow">Wholesale · B2B</span>
              <h1>Wholesale</h1>
              <p>B2B customers, bulk orders, dispatch and pricing tiers.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="ghost-action" type="button" onClick={() => downloadCsv("wholesale-b2b", ["Code", "Name", "City", "Mobile"], b2b.map((c) => [c.code, c.name, c.city, c.mobile]))}><Download size={16} /> Export</button>
            {tab === "B2B Customers" ? <button className="export-button" type="button" onClick={() => setModal("customer")}><Plus size={16} /> Add B2B Customer</button> : null}
            {tab === "Bulk Orders" ? <button className="export-button" type="button" onClick={() => setModal("order")}><Plus size={16} /> New Bulk Order</button> : null}
          </div>
        </div>

        <div className="tabs-bar">
          {tabs.map((t) => <button key={t} className={t === tab ? "active" : ""} type="button" onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "B2B Customers" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Code</th><th>Name</th><th>City</th><th>Mobile</th><th>Type</th></tr></thead>
                <tbody>
                  {b2b.map((c) => <tr key={c.id}><td>{c.code}</td><td><strong>{c.name}</strong></td><td>{c.city || "—"}</td><td>{c.mobile || "—"}</td><td><span className="status-pill success">Wholesale</span></td></tr>)}
                  {b2b.length === 0 ? <tr><td colSpan={5} className="empty-note">No B2B customers yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </article>
        ) : null}

        {tab === "Bulk Orders" || tab === "Dispatch" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Order #</th><th>Customer</th><th>Pieces</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {bulkOrders.filter((o) => tab === "Bulk Orders" || o.status === "Dispatched").map((o) => (
                    <tr key={o.id}><td>{o.number}</td><td>{o.customer}</td><td>{o.pieces}</td><td><strong>{formatINR(o.amount)}</strong></td><td><span className={`status-pill ${o.status === "Dispatched" ? "success" : o.status === "Confirmed" ? "warning" : "danger"}`}>{o.status}</span></td><td>{o.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ) : null}

        {tab === "Pricing" ? (
          <article className="erp-panel table-panel">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Tier</th><th>Markup</th><th>Extra Discount</th><th>Min. Order</th></tr></thead>
                <tbody>{priceTiers.map((r) => <tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
              </table>
            </div>
          </article>
        ) : null}
      </section>

      {modal === "customer" ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={saveCustomer}>
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Close"><X size={18} /></button>
            <h2>Add B2B Customer</h2>
            <div className="form-grid">
              <label className="field"><span>Business name *</span><div className="field-input"><input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} placeholder="e.g. Sparkle Traders" /></div></label>
              <label className="field"><span>Mobile</span><div className="field-input"><input value={cust.mobile} onChange={(e) => setCust({ ...cust, mobile: e.target.value })} placeholder="+91 ..." /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={cust.city} onChange={(e) => setCust({ ...cust, city: e.target.value })} placeholder="Surat" /></div></label>
            </div>
            <div className="form-actions"><button className="ghost-action" type="button" onClick={() => setModal(null)}>Cancel</button><button className="gold-action" type="submit">Save</button></div>
          </form>
        </div>
      ) : null}

      {modal === "order" ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={saveOrder}>
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Close"><X size={18} /></button>
            <h2>New Bulk Order</h2>
            <div className="form-grid">
              <label className="field"><span>Customer *</span><div className="field-input"><input list="b2b-list" value={order.customer} onChange={(e) => setOrder({ ...order, customer: e.target.value })} placeholder="B2B customer" /><datalist id="b2b-list">{b2b.map((c) => <option key={c.id} value={c.name} />)}</datalist></div></label>
              <label className="field"><span>Pieces</span><div className="field-input"><input type="number" value={order.pieces} onChange={(e) => setOrder({ ...order, pieces: e.target.value })} placeholder="30" /></div></label>
              <label className="field"><span>Amount (₹)</span><div className="field-input"><input type="number" value={order.amount} onChange={(e) => setOrder({ ...order, amount: e.target.value })} placeholder="2500000" /></div></label>
            </div>
            <div className="form-actions"><button className="ghost-action" type="button" onClick={() => setModal(null)}>Cancel</button><button className="gold-action" type="submit">Create Order</button></div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
