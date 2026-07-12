"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Crown,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import {
  branchComparison,
  estimateProfit,
  lowStockItems,
  monthlyBars,
  recentTransactions,
  salesByCategory,
  salesTrendFromInvoices,
  sumInvoices,
  todaySummary,
  topSellingItems,
} from "../lib/analytics";
import { AppShell } from "../components/AppShell";
import { firstName, formatINR, useStore } from "../lib/store";

function TrendChart({ points }: { points: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...points.map((t) => t.value), 0.1) * 1.15;
  const min = Math.min(...points.map((t) => t.value), 0) * 0.9;
  const x = (i: number) => (points.length <= 1 ? 50 : (i / (points.length - 1)) * 100);
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100;
  const line = points.map((t, i) => `${x(i)},${y(t.value)}`).join(" ");

  return (
    <div className="trend trend-rich">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f2b33d" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f2b33d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 40, 60, 80].map((g) => (
          <line key={g} x1="0" x2="100" y1={g} y2={g} vectorEffect="non-scaling-stroke" className="trend-grid-line" />
        ))}
        <polygon points={`0,100 ${line} 100,100`} fill="url(#tg)" />
        <polyline points={line} fill="none" stroke="#e6a520" strokeWidth="2.8" vectorEffect="non-scaling-stroke" />
        {points.map((t, i) => (
          <circle
            key={`${t.label}-${i}`}
            className="dot"
            cx={x(i)}
            cy={y(t.value)}
            r={hover === i ? 3.6 : 2.4}
            fill={hover === i ? "#e6a520" : "#fff"}
            stroke="#e6a520"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null ? (
        <div className="trend-tip" style={{ left: `${x(hover)}%`, top: `${(y(points[hover].value) / 100) * 190}px` }}>
          <span>{points[hover].label}</span>
          <strong>₹ {(points[hover].value).toFixed(2)} L</strong>
        </div>
      ) : null}
      <div className="trend-axis">
        {points.map((t, i) => (i % 2 === 0 ? <span key={t.label}>{t.label}</span> : null))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { rates, currentUser, invoices, customers, items, repairs, movements, expenses } = useStore();
  const name = firstName(currentUser) || "Admin";

  const totalSales = sumInvoices(invoices);
  const profit = estimateProfit(totalSales, expenses);
  const categories = useMemo(() => salesByCategory(invoices, items), [invoices, items]);
  const topItems = useMemo(() => topSellingItems(invoices, items, rates), [invoices, items, rates]);
  const trend = useMemo(() => salesTrendFromInvoices(invoices), [invoices]);
  const bars = useMemo(() => monthlyBars(invoices), [invoices]);
  const branches = useMemo(() => branchComparison(invoices), [invoices]);
  const summary = todaySummary(invoices, repairs, customers.length);
  const lowStock = lowStockItems(items);
  const txns = recentTransactions(invoices, movements);

  const kpis = [
    { label: "Total Sales", value: formatINR(totalSales), delta: "Live", icon: ShoppingCart, tone: "blue" },
    { label: "Est. Profit", value: formatINR(profit), delta: "18% margin", icon: WalletCards, tone: "green" },
    { label: "Transactions", value: invoices.length.toLocaleString("en-IN"), delta: `${movements.filter((m) => m.type === "Sale").length} stock`, icon: TrendingUp, tone: "violet" },
    { label: "Customers", value: customers.length.toLocaleString("en-IN"), delta: "Active", icon: UserRound, tone: "gold" },
    { label: "Gold Price (22K)", value: `${formatINR(rates["22K"])} /gm`, delta: "Live", icon: CircleDollarSign, tone: "gold" },
  ];

  const summaryItems = [
    { label: "Orders", value: String(summary.orders), delta: "Today", icon: ReceiptText },
    { label: "Quotations", value: String(summary.quotations), delta: "Open", icon: PackageCheck },
    { label: "Repairs", value: String(summary.repairs), delta: "Active", icon: Wrench },
    { label: "Customers", value: String(summary.customers), delta: "Total", icon: UsersRound },
  ];

  return (
    <AppShell>
      <section className="dashboard page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Crown size={28} />
            <div>
              <h1>Executive Overview</h1>
              <p>Welcome back, {name} · live sales, stock &amp; transactions</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="date-button" href="/gold-rates">22K · {rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={16} /></Link>
            <Link className="export-button" href="/pos">+ New sale</Link>
            <Link className="export-button" href="/reports">Reports</Link>
          </div>
        </div>

        <section className="kpi-grid">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className="kpi-card" key={kpi.label}>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <p>{kpi.delta}</p>
                </div>
                <div className={`kpi-icon ${kpi.tone}`}><Icon size={22} /></div>
              </article>
            );
          })}
        </section>

        <section className="dashboard-grid">
          <article className="panel panel-wide">
            <div className="panel-head">
              <h2>Sales Trend</h2>
              <span className="muted" style={{ fontSize: 13 }}>From invoices · hover for detail</span>
            </div>
            <TrendChart points={trend} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Sales by Category</h2>
              <button type="button">Live <ChevronDown size={14} /></button>
            </div>
            <div className="analytics-shares">
              {categories.length ? categories.map((c) => (
                <div className="share-row" key={c.name}>
                  <div className="share-top"><span>{c.name}</span><strong>{c.percent}%</strong></div>
                  <div className="progress"><span style={{ width: `${c.percent}%`, background: c.color }} /></div>
                  <small>{formatINR(c.value)}</small>
                </div>
              )) : (
                <p className="muted">Complete a POS sale to populate categories.</p>
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Top Selling Items</h2>
              <Link className="link-button" href="/reports" style={{ width: "auto", margin: 0 }}>View report</Link>
            </div>
            <div className="item-list">
              {(topItems.length ? topItems : [{ name: "No sales yet", amount: 0, share: 0, icon: "ring", qty: 0 }]).map((row) => (
                <div className="item-row" key={row.name}>
                  <span className={`jewel-icon ${row.icon}`} />
                  <span>{row.name}</span>
                  <strong>{row.amount ? formatINR(row.amount) : "—"}</strong>
                  <em>{row.share ? `${row.share}%` : "—"}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel summary-panel">
            <div className="panel-head"><h2>Today&apos;s Summary</h2></div>
            <div className="summary-grid">
              {summaryItems.map(({ label, value, delta, icon: Icon }) => (
                <div className="summary-card" key={label}>
                  <Icon size={24} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <p>{delta}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Monthly Performance</h2>
              <button type="button">Invoices <ChevronDown size={14} /></button>
            </div>
            <div className="bars bars-rich" aria-hidden="true">
              {bars.map((b) => <span key={b.label} style={{ height: `${Math.max(b.height, 8)}%` }} title={b.label} />)}
            </div>
            <div className="trend-axis">{bars.filter((_, i) => i % 2 === 0).map((b) => <span key={b.label}>{b.label}</span>)}</div>
          </article>

          <article className="panel">
            <div className="panel-head"><h2>Branch Comparison</h2></div>
            <table className="branch-table">
              <thead><tr><th>Branch</th><th>Sales</th><th>Profit</th><th>Orders</th></tr></thead>
              <tbody>
                {branches.map((row) => (
                  <tr key={row.branch}><td>{row.branch}</td><td>{formatINR(row.sales)}</td><td>{formatINR(row.profit)}</td><td>{row.orders}</td></tr>
                ))}
              </tbody>
            </table>
            <Link className="link-button" href="/reports/branch">View All Branches</Link>
          </article>

          <article className="panel">
            <div className="panel-head"><h2>Recent Transactions</h2><Link className="link-button" href="/sales/invoices" style={{ width: "auto", margin: 0 }}>View all</Link></div>
            <div className="activity-list">
              {txns.map((tx, index) => (
                <div className="activity-row" key={tx.id}>
                  <span>{index + 1}</span>
                  <p><strong>{tx.type}</strong> · {tx.ref} · {tx.party}</p>
                  <time>{tx.amount ? formatINR(tx.amount) : tx.date}</time>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head"><h2>Low Stock Alerts</h2><Link className="link-button" href="/inventory" style={{ width: "auto", margin: 0 }}>View all</Link></div>
            <div className="stock-list">
              {lowStock.map((item) => (
                <div className="stock-row" key={item.id}>
                  <span className={`jewel-icon ${item.icon || "ring"}`} />
                  <div><strong>{item.name}</strong><small>{item.karat} · {item.weight}g · Stock: {item.stock}</small></div>
                  <em>{item.stock === 0 ? "Out" : "Low"}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head"><h2><Sparkles size={19} /> Insights</h2></div>
            <div className="insights">
              <p>{invoices.length} paid invoices in the system — checkout on POS to add more transactions.</p>
              <p>{lowStock.length} SKUs need attention across branches.</p>
              <p>Live 22K rate drives pricing on POS, catalog and customer portal.</p>
            </div>
          </article>
        </section>
      </section>
    </AppShell>
  );
}
