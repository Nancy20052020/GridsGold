"use client";

import { useState } from "react";
import { Download, Plus, WalletCards } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR } from "../lib/store";
import { downloadCsv } from "../lib/export";

const tabs = ["Overview", "Expenses"] as const;
const expenseCats = ["Rent", "Salaries", "Marketing", "Utilities", "Supplies", "Other"];

export default function FinancePage() {
  const { invoices, expenses, addExpense } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [form, setForm] = useState({ category: "Rent", note: "", amount: "" });

  const revenue = invoices.reduce((s, i) => s + i.total, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const net = revenue - expenseTotal;

  const cards = [
    { label: "Revenue", value: formatINR(revenue), tone: "green" },
    { label: "Expenses", value: formatINR(expenseTotal), tone: "red" },
    { label: "Net Position", value: formatINR(net), tone: "gold" },
  ];

  function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!form.note.trim() || !form.amount) return;
    addExpense({ category: form.category, note: form.note.trim(), amount: Number(form.amount) || 0 });
    setForm({ category: "Rent", note: "", amount: "" });
  }

  return (
    <AppShell searchPlaceholder="Search finance...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <WalletCards size={28} />
            <div>
              <span className="eyebrow">Finance</span>
              <h1>Finance</h1>
              <p>Revenue, expenses, ledger and tax — all with live figures.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => downloadCsv("finance-summary", ["Metric", "Amount"], cards.map((c) => [c.label, c.value]))}><Download size={16} /> Export</button>
          </div>
        </div>

        <div className="tabs-bar">
          {tabs.map((t) => <button key={t} className={t === tab ? "active" : ""} type="button" onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === "Overview" ? (
          <div className="stat-cards">
            {cards.map((c) => (
              <article className={`erp-kpi ${c.tone}`} key={c.label}><span>{c.label}</span><strong>{c.value}</strong></article>
            ))}
          </div>
        ) : null}

        {tab === "Expenses" ? (
          <div className="two-col">
            <form className="erp-panel form-panel" onSubmit={submitExpense}>
              <h2 style={{ marginBottom: 14 }}>Add Expense</h2>
              <div className="form-grid">
                <label className="field"><span>Category</span><div className="field-input"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{expenseCats.map((c) => <option key={c}>{c}</option>)}</select></div></label>
                <label className="field"><span>Amount (₹)</span><div className="field-input"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" /></div></label>
                <label className="field" style={{ gridColumn: "1 / -1" }}><span>Note</span><div className="field-input"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Electricity bill" /></div></label>
              </div>
              <div className="form-actions"><button className="gold-action" type="submit"><Plus size={15} /> Add Expense</button></div>
            </form>
            <article className="erp-panel table-panel">
              <h2 style={{ marginBottom: 14 }}>Expenses</h2>
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead>
                  <tbody>{expenses.map((e) => <tr key={e.id}><td>{e.date}</td><td>{e.category}</td><td>{e.note}</td><td><strong>{formatINR(e.amount)}</strong></td></tr>)}</tbody>
                </table>
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
