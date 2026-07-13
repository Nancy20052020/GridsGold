"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  BadgePercent,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  FileSpreadsheet,
  Landmark,
  Plus,
  Receipt,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { receivablesAging } from "../lib/analytics";
import { downloadCsv } from "../lib/export";
import { BRANCHES, formatINR, useStore } from "../lib/store";

const TABS = [
  "Overview",
  "Banking",
  "Ledgers",
  "Invoices",
  "Expenses",
  "Tax",
  "Payroll",
  "Statements",
  "Controls",
] as const;

type Tab = (typeof TABS)[number];

const EXPENSE_CATS = ["Rent", "Salaries", "Marketing", "Utilities", "Supplies", "Gold purchase", "Hallmarking", "Other"];

const BANK_ACCOUNTS = [
  { id: "b1", name: "HDFC Current · ****4821", branch: "Main Branch", balance: 4285000, type: "Current" },
  { id: "b2", name: "ICICI OD · ****9033", branch: "Branch 2", balance: 1872500, type: "Overdraft" },
  { id: "b3", name: "SBI Savings · ****1109", branch: "Branch 3", balance: 642800, type: "Savings" },
  { id: "b4", name: "Cash vault", branch: "Vault", balance: 385000, type: "Cash" },
];

const CASH_FLOW_MONTHS = [
  { m: "Jan", in: 42, out: 28 },
  { m: "Feb", in: 38, out: 31 },
  { m: "Mar", in: 55, out: 36 },
  { m: "Apr", in: 61, out: 40 },
  { m: "May", in: 48, out: 34 },
  { m: "Jun", in: 72, out: 45 },
];

const PAYROLL = [
  { id: "p1", name: "Asha Verma", role: "Sales Manager", days: 26, base: 45000, incentive: 18500, status: "Paid" },
  { id: "p2", name: "Ravi Nair", role: "Karigar Lead", days: 25, base: 38000, incentive: 9200, status: "Paid" },
  { id: "p3", name: "Meera Shah", role: "Cashier", days: 24, base: 28000, incentive: 4100, status: "Pending" },
  { id: "p4", name: "Imran Khan", role: "Appraiser", days: 26, base: 42000, incentive: 12600, status: "Approved" },
  { id: "p5", name: "Sonal Desai", role: "CRM Executive", days: 22, base: 32000, incentive: 7800, status: "Draft" },
];

const REIMBURSEMENTS = [
  { id: "r1", employee: "Asha Verma", note: "Client travel — bridal trial", amount: 4200, status: "Approved" },
  { id: "r2", employee: "Ravi Nair", note: "Tools & polishing pads", amount: 2850, status: "Pending" },
  { id: "r3", employee: "Imran Khan", note: "BIS courier to assay office", amount: 960, status: "Paid" },
];

const BUDGETS = [
  { name: "Marketing", planned: 120000, actual: 65000 },
  { name: "Rent & utilities", planned: 250000, actual: 218000 },
  { name: "Payroll", planned: 520000, actual: 420000 },
  { name: "Gold purchase", planned: 8500000, actual: 6120000 },
];

const AUDIT_LOGS = [
  { t: "2m ago", user: "Nancy", action: "Posted receipt REC-8841 · ₹1,24,500" },
  { t: "18m ago", user: "System", action: "GST GSTR-1 draft auto-saved for May" },
  { t: "1h ago", user: "Accounts", action: "Approved payroll run PR-2026-05" },
  { t: "3h ago", user: "Nancy", action: "Fund transfer Vault → HDFC · ₹2,00,000" },
  { t: "Yesterday", user: "Auditor", action: "Reconciled ICICI OD through 30 Apr" },
];

const APPROVALS = [
  { id: "a1", title: "Supplier payment · Dubai Gold Exchange", amount: 850000, by: "Purchase", status: "Awaiting CFO" },
  { id: "a2", title: "Reimbursement · Ravi Nair", amount: 2850, by: "HR", status: "Awaiting Manager" },
  { id: "a3", title: "Recurring rent · Showroom", amount: 185000, by: "Finance", status: "Scheduled" },
];

const ALERTS = [
  { tone: "danger" as const, text: "Payables over ₹5L due within 7 days" },
  { tone: "warn" as const, text: "HDFC reconciliation variance ₹12,480" },
  { tone: "info" as const, text: "TDS u/s 194C due on 7th — ₹18,240 accrued" },
];

function hashTone(key: string) {
  const n = key.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return n % 3 === 0 ? "31–60 days" : n % 2 === 0 ? "0–30 days" : "61+ days";
}

export default function FinancePage() {
  const {
    invoices,
    expenses,
    addExpense,
    customers,
    suppliers,
    repairs,
    selectedBranch,
    baseCurrency,
  } = useStore();

  const [tab, setTab] = useState<Tab>("Overview");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ category: "Rent", note: "", amount: "" });
  const [transfer, setTransfer] = useState({ from: BANK_ACCOUNTS[0].id, to: BANK_ACCOUNTS[1].id, amount: "" });
  const [branchFilter, setBranchFilter] = useState("All");

  const revenue = useMemo(() => invoices.reduce((s, i) => s + i.total, 0), [invoices]);
  const expenseTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const profit = revenue - expenseTotal;
  const payables = useMemo(() => suppliers.reduce((s, sup) => s + (sup.balance || 0), 0), [suppliers]);
  const aging = useMemo(() => receivablesAging(customers, invoices, repairs), [customers, invoices, repairs]);
  const receivables = useMemo(() => aging.reduce((s, r) => s + r.outstanding, 0), [aging]);
  const bankBalance = BANK_ACCOUNTS.filter((b) => b.type !== "Cash").reduce((s, b) => s + b.balance, 0);
  const cashInHand = BANK_ACCOUNTS.find((b) => b.type === "Cash")?.balance ?? 0;
  const gstCollected = useMemo(() => invoices.reduce((s, i) => s + i.gst, 0), [invoices]);
  const tdsAccrued = Math.round(payables * 0.01);

  const expenseByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / total) * 100),
      }));
  }, [expenses]);

  const incomeExpenseMax = Math.max(...CASH_FLOW_MONTHS.flatMap((m) => [m.in, m.out]), 1);

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (!q) return true;
      return (
        inv.number.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q)
      );
    });
  }, [invoices, query]);

  const filteredExpenses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      if (!q) return true;
      return e.category.toLowerCase().includes(q) || e.note.toLowerCase().includes(q);
    });
  }, [expenses, query]);

  const plRows = [
    { label: "Jewellery sales (gross)", amount: revenue },
    { label: "Less: GST on sales", amount: -gstCollected },
    { label: "Net revenue", amount: revenue - gstCollected, bold: true },
    { label: "Cost of goods (est. 62%)", amount: -Math.round(revenue * 0.62) },
    { label: "Gross profit", amount: Math.round(revenue * 0.38) - gstCollected, bold: true },
    { label: "Operating expenses", amount: -expenseTotal },
    { label: "Net profit", amount: profit, bold: true },
  ];

  const balanceSheet = [
    { side: "Assets", rows: [
      { label: "Cash in hand", amount: cashInHand },
      { label: "Bank balances", amount: bankBalance },
      { label: "Trade receivables", amount: receivables },
      { label: "Inventory (memo)", amount: Math.round(revenue * 1.4) },
    ]},
    { side: "Liabilities & Equity", rows: [
      { label: "Trade payables", amount: payables },
      { label: "GST payable", amount: Math.round(gstCollected * 0.35) },
      { label: "TDS payable", amount: tdsAccrued },
      { label: "Owner equity + P&L", amount: cashInHand + bankBalance + receivables + Math.round(revenue * 1.4) - payables - Math.round(gstCollected * 0.35) - tdsAccrued },
    ]},
  ];

  const trialBalance = [
    { account: "Cash & Bank", debit: cashInHand + bankBalance, credit: 0 },
    { account: "Receivables", debit: receivables, credit: 0 },
    { account: "Sales", debit: 0, credit: revenue },
    { account: "Expenses", debit: expenseTotal, credit: 0 },
    { account: "Payables", debit: 0, credit: payables },
    { account: "GST Output", debit: 0, credit: gstCollected },
  ];

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function submitExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!form.note.trim() || !form.amount) return;
    addExpense({ category: form.category, note: form.note.trim(), amount: Number(form.amount) || 0 });
    setForm({ category: "Rent", note: "", amount: "" });
    flash("Expense posted");
  }

  function submitTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!transfer.amount || transfer.from === transfer.to) return;
    flash(`Transfer of ${formatINR(Number(transfer.amount))} queued for approval`);
    setTransfer((t) => ({ ...t, amount: "" }));
  }

  function exportSummary() {
    downloadCsv(
      "finance-summary",
      ["Metric", "Amount"],
      [
        ["Revenue", String(revenue)],
        ["Expenses", String(expenseTotal)],
        ["Profit", String(profit)],
        ["Cash in hand", String(cashInHand)],
        ["Bank balance", String(bankBalance)],
        ["Receivables", String(receivables)],
        ["Payables", String(payables)],
      ],
    );
    flash("Finance summary exported");
  }

  function exportInvoices() {
    downloadCsv(
      "finance-invoices",
      ["Number", "Customer", "Date", "Subtotal", "GST", "Total", "Status"],
      filteredInvoices.map((i) => [i.number, i.customer, i.date, String(i.subtotal), String(i.gst), String(i.total), i.status]),
    );
    flash("Invoices CSV exported");
  }

  const kpis = [
    { label: "Revenue", value: formatINR(revenue), note: `${invoices.length} invoices`, tone: "gold", icon: TrendingUp },
    { label: "Expenses", value: formatINR(expenseTotal), note: `${expenses.length} entries`, tone: "warn", icon: TrendingDown },
    { label: "Profit", value: formatINR(profit), note: profit >= 0 ? "Healthy margin" : "Review costs", tone: profit >= 0 ? "lavender" : "danger", icon: Sparkles },
    { label: "Cash in hand", value: formatINR(cashInHand), note: "Vault", tone: "champagne", icon: Banknote },
    { label: "Bank balance", value: formatINR(bankBalance), note: "3 accounts", tone: "violet", icon: Landmark },
    { label: "Receivables", value: formatINR(receivables), note: `${aging.length} accounts`, tone: "lavender", icon: Wallet },
    { label: "Payables", value: formatINR(payables), note: `${suppliers.length} suppliers`, tone: "danger", icon: CreditCard },
  ];

  return (
    <AppShell searchPlaceholder="Search finance, invoices, ledgers…">
      <section className="page-content fin-v2">
        <header className="fin-v2-head">
          <div>
            <span className="fin-v2-eyebrow"><WalletCards size={14} /> Finance · {selectedBranch} · {baseCurrency}</span>
            <h1>Finance Management</h1>
            <p>Real-time jewellery ERP accounting — cash, banks, ledgers, tax, payroll and statements.</p>
          </div>
          <div className="fin-v2-head-actions">
            <button type="button" className="fin-v2-btn gold" onClick={() => { setTab("Expenses"); flash("Add an expense below"); }}>
              <Plus size={16} /> Record expense
            </button>
            <button type="button" className="fin-v2-btn ghost" onClick={exportSummary}><Download size={16} /> Export</button>
            <button type="button" className="fin-v2-btn ghost" onClick={() => flash("Bulk import ready — drop CSV anytime")}>
              <Upload size={16} /> Import
            </button>
            <Link className="fin-v2-btn ghost" href="/sales/invoices"><Receipt size={16} /> Invoices</Link>
          </div>
        </header>

        <section className="fin-v2-kpis" aria-label="Finance KPIs">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className={`fin-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
                <div className="fin-v2-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        <div className="fin-v2-alerts" role="status">
          {ALERTS.map((a) => (
            <span className={`fin-v2-alert ${a.tone}`} key={a.text}>
              <AlertTriangle size={15} /> {a.text}
            </span>
          ))}
        </div>

        <nav className="fin-glass fin-v2-tabs" aria-label="Finance sections">
          {TABS.map((t) => (
            <button key={t} type="button" className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>

        {(tab === "Invoices" || tab === "Expenses" || tab === "Ledgers") ? (
          <section className="fin-glass fin-v2-tools">
            <div className="fin-v2-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoices, customers, expenses…"
                aria-label="Search finance"
              />
            </div>
            <label className="fin-v2-branch">
              <span>Branch</span>
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                <option value="All">All branches</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
          </section>
        ) : null}

        {tab === "Overview" ? (
          <div className="fin-v2-grid">
            <div className="fin-v2-main">
              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2><TrendingUp size={16} /> Income vs expense</h2>
                  <span>Last 6 months · ₹L</span>
                </div>
                <div className="fin-v2-chart" aria-hidden>
                  {CASH_FLOW_MONTHS.map((m) => (
                    <div className="fin-v2-col" key={m.m}>
                      <div className="fin-v2-bars-pair">
                        <span className="in" style={{ height: `${(m.in / incomeExpenseMax) * 100}%` }} title={`In ${m.in}L`} />
                        <span className="out" style={{ height: `${(m.out / incomeExpenseMax) * 100}%` }} title={`Out ${m.out}L`} />
                      </div>
                      <em>{m.m}</em>
                    </div>
                  ))}
                </div>
                <div className="fin-v2-legend">
                  <span><i className="in" /> Income</span>
                  <span><i className="out" /> Expense</span>
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Cash flow pulse</h2>
                  <span>Operating · investing · financing</span>
                </div>
                <div className="fin-v2-flow">
                  {[
                    { label: "Operating", value: Math.round(profit * 0.85), tone: "ok" },
                    { label: "Investing", value: -Math.round(revenue * 0.08), tone: "warn" },
                    { label: "Financing", value: -185000, tone: "muted" },
                    { label: "Net change", value: Math.round(profit * 0.85 - revenue * 0.08 - 185000), tone: "gold" },
                  ].map((f) => (
                    <article key={f.label} className={`fin-v2-flow-card ${f.tone}`}>
                      <span>{f.label}</span>
                      <strong>{formatINR(f.value)}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Expense mix</h2>
                </div>
                <div className="fin-v2-bars">
                  {expenseByCat.map((c) => (
                    <div key={c.name}>
                      <div className="fin-v2-bar-top">
                        <span>{c.name}</span>
                        <strong>{c.percent}%</strong>
                      </div>
                      <div className="fin-v2-bar-track">
                        <span style={{ width: `${c.percent}%` }} />
                      </div>
                      <small>{formatINR(c.value)}</small>
                    </div>
                  ))}
                  {expenseByCat.length === 0 ? <p className="muted">No expenses yet.</p> : null}
                </div>
              </section>
            </div>

            <aside className="fin-v2-side">
              <section className="fin-glass fin-v2-ai">
                <div className="fin-v2-section-head">
                  <h2><Sparkles size={16} /> AI financial insights</h2>
                </div>
                <ul className="fin-v2-ai-list">
                  <li>
                    <strong>Margin watch</strong>
                    <small>Gross margin ~38%. March bridal spike lifted cash velocity 19%.</small>
                  </li>
                  <li>
                    <strong>Collections</strong>
                    <small>
                      {aging[0]
                        ? `${aging[0].customer} holds ${formatINR(aging[0].outstanding)} — prioritize follow-up.`
                        : "Receivables look clear this week."}
                    </small>
                  </li>
                  <li>
                    <strong>Payables timing</strong>
                    <small>Settle {suppliers[0]?.name ?? "top supplier"} before TDS cut-off to keep credit open.</small>
                  </li>
                  <li>
                    <strong>Branch mix</strong>
                    <small>{selectedBranch} is contributing the bulk of posted POS invoices this period.</small>
                  </li>
                </ul>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Quick actions</h2>
                </div>
                <div className="fin-v2-quick-grid">
                  <button type="button" onClick={() => setTab("Expenses")}><Plus size={16} /> Expense</button>
                  <button type="button" onClick={() => setTab("Banking")}><ArrowLeftRight size={16} /> Transfer</button>
                  <button type="button" onClick={() => setTab("Invoices")}><Receipt size={16} /> Receipt</button>
                  <button type="button" onClick={() => setTab("Payroll")}><Users size={16} /> Run payroll</button>
                  <button type="button" onClick={() => setTab("Tax")}><BadgePercent size={16} /> GST desk</button>
                  <button type="button" onClick={() => flash("Recurring payment calendar opened")}><Send size={16} /> Recurring</button>
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Pending approvals</h2>
                  <button type="button" className="fin-link" onClick={() => setTab("Controls")}>All</button>
                </div>
                <div className="fin-v2-list">
                  {APPROVALS.slice(0, 3).map((a) => (
                    <div key={a.id}>
                      <strong>{a.title}</strong>
                      <span>{formatINR(a.amount)}</span>
                      <small>{a.status}</small>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "Banking" ? (
          <div className="fin-v2-grid">
            <div className="fin-v2-main">
              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2><Landmark size={16} /> Bank accounts</h2>
                  <span>Multi-branch treasury</span>
                </div>
                <div className="fin-v2-bank-grid">
                  {BANK_ACCOUNTS.filter((b) => branchFilter === "All" || b.branch === branchFilter).map((b) => (
                    <article className="fin-v2-bank-card" key={b.id}>
                      <div>
                        <span>{b.type}</span>
                        <strong>{b.name}</strong>
                        <small>{b.branch}</small>
                      </div>
                      <em>{formatINR(b.balance)}</em>
                    </article>
                  ))}
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Bank reconciliation</h2>
                  <button type="button" className="fin-v2-btn gold compact" onClick={() => flash("Reconciliation matched — variance cleared")}>
                    <CheckCircle2 size={15} /> Match statement
                  </button>
                </div>
                <div className="fin-v2-table-wrap">
                  <table className="fin-v2-table">
                    <thead>
                      <tr><th>Date</th><th>Description</th><th>Book</th><th>Bank</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>12 May</td><td>POS settlement UPI</td><td>{formatINR(284500)}</td><td>{formatINR(284500)}</td><td><em className="ok">Matched</em></td></tr>
                      <tr><td>11 May</td><td>Supplier RTGS</td><td>{formatINR(-850000)}</td><td>{formatINR(-850000)}</td><td><em className="ok">Matched</em></td></tr>
                      <tr><td>10 May</td><td>Card MDR charge</td><td>—</td><td>{formatINR(-12480)}</td><td><em className="warn">Variance</em></td></tr>
                      <tr><td>09 May</td><td>Showroom rent</td><td>{formatINR(-185000)}</td><td>{formatINR(-185000)}</td><td><em className="ok">Matched</em></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="fin-v2-side">
              <form className="fin-glass" onSubmit={submitTransfer}>
                <div className="fin-v2-section-head">
                  <h2><ArrowLeftRight size={16} /> Fund transfer</h2>
                </div>
                <div className="fin-v2-form">
                  <label>
                    <span>From</span>
                    <select value={transfer.from} onChange={(e) => setTransfer({ ...transfer, from: e.target.value })}>
                      {BANK_ACCOUNTS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>To</span>
                    <select value={transfer.to} onChange={(e) => setTransfer({ ...transfer, to: e.target.value })}>
                      {BANK_ACCOUNTS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Amount</span>
                    <input type="number" min={1} value={transfer.amount} onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })} placeholder="200000" />
                  </label>
                  <button className="fin-v2-btn gold" type="submit"><Send size={15} /> Submit for approval</button>
                </div>
              </form>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Recurring payments</h2>
                </div>
                <div className="fin-v2-list">
                  <div><strong>Showroom rent</strong><span>{formatINR(185000)}</span><small>Monthly · 1st</small></div>
                  <div><strong>Insurance premium</strong><span>{formatINR(42000)}</span><small>Quarterly</small></div>
                  <div><strong>Software SaaS</strong><span>{formatINR(8900)}</span><small>Monthly · 15th</small></div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "Ledgers" ? (
          <div className="fin-v2-grid equal">
            <section className="fin-glass">
              <div className="fin-v2-section-head">
                <h2><Users size={16} /> Customer ledger</h2>
                <Link href="/customers">CRM</Link>
              </div>
              <div className="fin-v2-table-wrap">
                <table className="fin-v2-table">
                  <thead>
                    <tr><th>Customer</th><th>Outstanding</th><th>0–30</th><th>31–60</th><th>61+</th></tr>
                  </thead>
                  <tbody>
                    {aging.map((r) => (
                      <tr key={r.code}>
                        <td><strong>{r.customer}</strong><br /><small>{r.code}</small></td>
                        <td><strong>{formatINR(r.outstanding)}</strong></td>
                        <td>{formatINR(r.bucket0to30)}</td>
                        <td>{formatINR(r.bucket31to60)}</td>
                        <td>{formatINR(r.bucket61plus)}</td>
                      </tr>
                    ))}
                    {aging.length === 0 ? (
                      <tr><td colSpan={5} className="empty-note">No open receivables.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="fin-glass">
              <div className="fin-v2-section-head">
                <h2><Building2 size={16} /> Supplier ledger</h2>
                <Link href="/suppliers">Suppliers</Link>
              </div>
              <div className="fin-v2-table-wrap">
                <table className="fin-v2-table">
                  <thead>
                    <tr><th>Supplier</th><th>Balance</th><th>Terms</th><th>Aging</th></tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong><br /><small>{s.code} · {s.city}</small></td>
                        <td><strong>{formatINR(s.balance)}</strong></td>
                        <td>{s.paymentTerms ?? "Net 30"}</td>
                        <td>{hashTone(s.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "Invoices" ? (
          <div className="fin-v2-grid">
            <section className="fin-glass fin-v2-main">
              <div className="fin-v2-section-head">
                <h2><Receipt size={16} /> Invoices & payments</h2>
                <div className="fin-v2-head-actions">
                  <button type="button" className="fin-v2-btn ghost compact" onClick={exportInvoices}><Download size={14} /> Export</button>
                  <Link className="fin-v2-btn gold compact" href="/sales/invoices">Open sales</Link>
                </div>
              </div>
              <div className="fin-v2-table-wrap">
                <table className="fin-v2-table">
                  <thead>
                    <tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th><th>GST</th><th>Status</th><th>Receipt</th></tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td><code>{inv.number}</code></td>
                        <td>{inv.customer}</td>
                        <td>{inv.date}</td>
                        <td><strong>{formatINR(inv.total)}</strong></td>
                        <td>{formatINR(inv.gst)}</td>
                        <td><em className={inv.status === "paid" ? "ok" : inv.status === "partial" ? "warn" : "muted"}>{inv.status}</em></td>
                        <td>
                          <button type="button" className="fin-link" onClick={() => flash(`Receipt drafted for ${inv.number}`)}>
                            Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <aside className="fin-v2-side">
              <section className="fin-glass">
                <div className="fin-v2-section-head"><h2>Payment tracking</h2></div>
                <div className="fin-v2-list">
                  <div><strong>UPI settlements</strong><span>{formatINR(Math.round(revenue * 0.42))}</span><small>Today</small></div>
                  <div><strong>Card + EMI</strong><span>{formatINR(Math.round(revenue * 0.28))}</span><small>Cleared T+1</small></div>
                  <div><strong>Cash receipts</strong><span>{formatINR(Math.round(revenue * 0.18))}</span><small>Vaulted</small></div>
                  <div><strong>Credit / B2B</strong><span>{formatINR(receivables)}</span><small>Open</small></div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "Expenses" ? (
          <div className="fin-v2-grid">
            <form className="fin-glass" onSubmit={submitExpense}>
              <div className="fin-v2-section-head">
                <h2><Plus size={16} /> Add expense</h2>
              </div>
              <div className="fin-v2-form">
                <label>
                  <span>Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  <span>Amount (₹)</span>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="50000" />
                </label>
                <label className="wide">
                  <span>Note</span>
                  <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Electricity bill" />
                </label>
                <button className="fin-v2-btn gold" type="submit"><Plus size={15} /> Post expense</button>
              </div>
            </form>

            <section className="fin-glass">
              <div className="fin-v2-section-head">
                <h2>Expense register</h2>
                <span>{filteredExpenses.length} entries</span>
              </div>
              <div className="fin-v2-table-wrap">
                <table className="fin-v2-table">
                  <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead>
                  <tbody>
                    {filteredExpenses.map((e) => (
                      <tr key={e.id}>
                        <td>{e.date}</td>
                        <td>{e.category}</td>
                        <td>{e.note}</td>
                        <td><strong>{formatINR(e.amount)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "Tax" ? (
          <div className="fin-v2-grid">
            <div className="fin-v2-main">
              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2><BadgePercent size={16} /> GST desk</h2>
                  <button type="button" className="fin-v2-btn ghost compact" onClick={() => flash("GSTR-1 JSON prepared")}>
                    <FileSpreadsheet size={14} /> Export GSTR
                  </button>
                </div>
                <div className="fin-v2-tax-grid">
                  <article><span>Output GST</span><strong>{formatINR(gstCollected)}</strong><small>From invoices</small></article>
                  <article><span>Input credit (est.)</span><strong>{formatINR(Math.round(gstCollected * 0.55))}</strong><small>Purchases</small></article>
                  <article><span>Net payable</span><strong>{formatINR(Math.round(gstCollected * 0.45))}</strong><small>Due 20th</small></article>
                  <article><span>E-invoice ready</span><strong>{invoices.filter((i) => i.total > 50000).length}</strong><small>B2B docs</small></article>
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head"><h2>TDS / TCS</h2></div>
                <div className="fin-v2-table-wrap">
                  <table className="fin-v2-table">
                    <thead><tr><th>Section</th><th>Nature</th><th>Base</th><th>Rate</th><th>Accrued</th></tr></thead>
                    <tbody>
                      <tr><td>194C</td><td>Job work / karigar</td><td>{formatINR(420000)}</td><td>1%</td><td>{formatINR(4200)}</td></tr>
                      <tr><td>194H</td><td>Commission</td><td>{formatINR(52200)}</td><td>5%</td><td>{formatINR(2610)}</td></tr>
                      <tr><td>194Q</td><td>Purchase of goods</td><td>{formatINR(payables)}</td><td>0.1%</td><td>{formatINR(Math.round(payables * 0.001))}</td></tr>
                      <tr><td>TCS 206C</td><td>Jewellery &gt; ₹2L</td><td>{formatINR(Math.round(revenue * 0.35))}</td><td>0.1%</td><td>{formatINR(Math.round(revenue * 0.00035))}</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            <aside className="fin-v2-side">
              <section className="fin-glass fin-v2-ai">
                <div className="fin-v2-section-head"><h2><Sparkles size={16} /> Tax tip</h2></div>
                <p className="fin-v2-tip">
                  Reconcile e-invoices with GSTR-1 before filing. TCS on high-ticket bridal invoices is auto-flagged when bill value exceeds ₹2L.
                </p>
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "Payroll" ? (
          <div className="fin-v2-grid">
            <div className="fin-v2-main">
              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2><Users size={16} /> Salary & payroll</h2>
                  <button type="button" className="fin-v2-btn gold compact" onClick={() => flash("Payroll run submitted for approval")}>
                    Process payroll
                  </button>
                </div>
                <div className="fin-v2-table-wrap">
                  <table className="fin-v2-table">
                    <thead>
                      <tr><th>Employee</th><th>Role</th><th>Attendance</th><th>Base</th><th>Incentive</th><th>Net</th><th>Status</th><th>Payslip</th></tr>
                    </thead>
                    <tbody>
                      {PAYROLL.map((p) => {
                        const net = Math.round((p.base / 26) * p.days + p.incentive);
                        return (
                          <tr key={p.id}>
                            <td><strong>{p.name}</strong></td>
                            <td>{p.role}</td>
                            <td>{p.days}/26</td>
                            <td>{formatINR(p.base)}</td>
                            <td>{formatINR(p.incentive)}</td>
                            <td><strong>{formatINR(net)}</strong></td>
                            <td><em className={p.status === "Paid" ? "ok" : p.status === "Pending" ? "warn" : "muted"}>{p.status}</em></td>
                            <td>
                              <button type="button" className="fin-link" onClick={() => flash(`Payslip PDF ready for ${p.name}`)}>
                                Download
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2>Incentives & commissions</h2>
                  <span>POS / bridal attached</span>
                </div>
                <div className="fin-v2-flow">
                  <article className="fin-v2-flow-card ok"><span>Sales commission</span><strong>{formatINR(38500)}</strong></article>
                  <article className="fin-v2-flow-card gold"><span>Bridal incentives</span><strong>{formatINR(22000)}</strong></article>
                  <article className="fin-v2-flow-card muted"><span>Repair upsell bonus</span><strong>{formatINR(6400)}</strong></article>
                </div>
              </section>
            </div>
            <aside className="fin-v2-side">
              <section className="fin-glass">
                <div className="fin-v2-section-head"><h2>Reimbursements</h2></div>
                <div className="fin-v2-list">
                  {REIMBURSEMENTS.map((r) => (
                    <div key={r.id}>
                      <strong>{r.employee}</strong>
                      <span>{formatINR(r.amount)}</span>
                      <small>{r.note} · {r.status}</small>
                    </div>
                  ))}
                </div>
                <button type="button" className="fin-v2-btn ghost" style={{ width: "100%", marginTop: 12 }} onClick={() => flash("Reimbursement form opened")}>
                  <Plus size={15} /> New claim
                </button>
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "Statements" ? (
          <div className="fin-v2-grid equal">
            <section className="fin-glass">
              <div className="fin-v2-section-head">
                <h2><Scale size={16} /> Profit & loss</h2>
                <button type="button" className="fin-link" onClick={() => window.print()}>Print</button>
              </div>
              <div className="fin-v2-statement">
                {plRows.map((r) => (
                  <div key={r.label} className={r.bold ? "bold" : ""}>
                    <span>{r.label}</span>
                    <strong>{formatINR(r.amount)}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="fin-glass">
              <div className="fin-v2-section-head"><h2>Balance sheet</h2></div>
              <div className="fin-v2-bs">
                {balanceSheet.map((col) => (
                  <div key={col.side}>
                    <h3>{col.side}</h3>
                    {col.rows.map((r) => (
                      <div key={r.label}>
                        <span>{r.label}</span>
                        <strong>{formatINR(r.amount)}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section className="fin-glass" style={{ gridColumn: "1 / -1" }}>
              <div className="fin-v2-section-head"><h2>Trial balance</h2></div>
              <div className="fin-v2-table-wrap">
                <table className="fin-v2-table">
                  <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
                  <tbody>
                    {trialBalance.map((r) => (
                      <tr key={r.account}>
                        <td>{r.account}</td>
                        <td>{r.debit ? formatINR(r.debit) : "—"}</td>
                        <td>{r.credit ? formatINR(r.credit) : "—"}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td><strong>Total</strong></td>
                      <td><strong>{formatINR(trialBalance.reduce((s, r) => s + r.debit, 0))}</strong></td>
                      <td><strong>{formatINR(trialBalance.reduce((s, r) => s + r.credit, 0))}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "Controls" ? (
          <div className="fin-v2-grid">
            <div className="fin-v2-main">
              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2><ClipboardList size={16} /> Budget vs actual</h2>
                </div>
                <div className="fin-v2-bars">
                  {BUDGETS.map((b) => {
                    const pct = Math.min(Math.round((b.actual / b.planned) * 100), 100);
                    return (
                      <div key={b.name}>
                        <div className="fin-v2-bar-top">
                          <span>{b.name}</span>
                          <strong>{pct}%</strong>
                        </div>
                        <div className="fin-v2-bar-track">
                          <span style={{ width: `${pct}%`, background: pct > 90 ? "#dc2626" : "#8b7cf6" }} />
                        </div>
                        <small>{formatINR(b.actual)} of {formatINR(b.planned)}</small>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head">
                  <h2><ShieldCheck size={16} /> Approval workflows</h2>
                </div>
                <div className="fin-v2-table-wrap">
                  <table className="fin-v2-table">
                    <thead><tr><th>Request</th><th>Amount</th><th>Raised by</th><th>Status</th><th /></tr></thead>
                    <tbody>
                      {APPROVALS.map((a) => (
                        <tr key={a.id}>
                          <td>{a.title}</td>
                          <td><strong>{formatINR(a.amount)}</strong></td>
                          <td>{a.by}</td>
                          <td><em className="warn">{a.status}</em></td>
                          <td>
                            <button type="button" className="fin-v2-btn gold compact" onClick={() => flash(`Approved: ${a.title}`)}>
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <aside className="fin-v2-side">
              <section className="fin-glass">
                <div className="fin-v2-section-head"><h2>Audit log</h2></div>
                <div className="fin-v2-audit">
                  {AUDIT_LOGS.map((l) => (
                    <div key={l.t + l.action}>
                      <strong>{l.user}</strong>
                      <span>{l.action}</span>
                      <small>{l.t}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="fin-glass">
                <div className="fin-v2-section-head"><h2>Multi-branch</h2></div>
                <div className="fin-v2-list">
                  {BRANCHES.slice(0, 4).map((b, i) => (
                    <div key={b}>
                      <strong>{b}</strong>
                      <span>{formatINR(Math.round((revenue / 4) * (1.2 - i * 0.15)))}</span>
                      <small>Posted revenue share</small>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {toast ? <div className="fin-v2-toast" role="status">{toast}</div> : null}
      </section>
    </AppShell>
  );
}
