"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CircleDollarSign,
  Crown,
  ShoppingCart,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  DEMO_SALES_BY_CATEGORY,
  DEMO_SALES_TREND,
  estimateProfit,
  lowStockItems,
  recentTransactions,
  sumInvoices,
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
  const { rates, currentUser, invoices, customers, items, movements, expenses } = useStore();
  const name = firstName(currentUser) || "Admin";

  const totalSales = sumInvoices(invoices);
  const profit = estimateProfit(totalSales, expenses);
  const topItems = useMemo(() => topSellingItems(invoices, items, rates), [invoices, items, rates]);
  const lowStock = lowStockItems(items, 4);
  const txns = recentTransactions(invoices, movements, 5);

  const kpis = [
    { label: "Total Sales", value: formatINR(totalSales), delta: "This month", icon: ShoppingCart, tone: "blue" },
    { label: "Est. Profit", value: formatINR(profit), delta: "18% margin", icon: WalletCards, tone: "green" },
    { label: "Transactions", value: invoices.length.toLocaleString("en-IN"), delta: "Paid invoices", icon: TrendingUp, tone: "violet" },
    { label: "Customers", value: customers.length.toLocaleString("en-IN"), delta: "Active", icon: UserRound, tone: "gold" },
  ];

  return (
    <AppShell>
      <section className="dashboard page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Crown size={26} />
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back, {name} · overview of your showroom</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="date-button" href="/gold-rates">
              22K · {rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={16} />
            </Link>
            <Link className="export-button" href="/pos">+ New sale</Link>
            <Link className="export-button subtle" href="/reports">Reports</Link>
          </div>
        </div>

        <section className="kpi-grid kpi-grid-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className="kpi-card" key={kpi.label}>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <p>{kpi.delta}</p>
                </div>
                <div className={`kpi-icon ${kpi.tone}`}><Icon size={20} /></div>
              </article>
            );
          })}
        </section>

        <section className="dashboard-grid dashboard-grid-present">
          <article className="panel panel-wide">
            <div className="panel-head">
              <h2>Sales Trend</h2>
              <span className="muted panel-sub">Weekly · ₹ Lakhs</span>
            </div>
            <TrendChart points={DEMO_SALES_TREND} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Sales by Category</h2>
              <span className="muted panel-sub">Mix</span>
            </div>
            <div className="analytics-shares">
              {DEMO_SALES_BY_CATEGORY.map((c) => (
                <div className="share-row" key={c.name}>
                  <div className="share-top"><span>{c.name}</span><strong>{c.percent}%</strong></div>
                  <div className="progress"><span style={{ width: `${c.percent}%`, background: c.color }} /></div>
                  <small>{formatINR(c.value)}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Top Selling Items</h2>
              <Link className="link-button inline" href="/reports">View all</Link>
            </div>
            <div className="item-list">
              {(topItems.length ? topItems.slice(0, 4) : [{ name: "Gold Necklace Set", amount: 145280, share: 42, icon: "necklace" }]).map((row) => (
                <div className="item-row" key={row.name}>
                  <span className={`jewel-icon ${row.icon}`} />
                  <span>{row.name}</span>
                  <strong>{row.amount ? formatINR(row.amount) : "—"}</strong>
                  <em>{row.share ? `${row.share}%` : "—"}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Recent Activity</h2>
              <Link className="link-button inline" href="/sales/invoices">Invoices</Link>
            </div>
            <div className="activity-list compact">
              {txns.map((tx, index) => (
                <div className="activity-row" key={tx.id}>
                  <span>{index + 1}</span>
                  <p><strong>{tx.type}</strong> · {tx.ref}</p>
                  <time>{tx.amount ? formatINR(tx.amount) : tx.date}</time>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Low Stock</h2>
              <Link className="link-button inline" href="/inventory">Inventory</Link>
            </div>
            <div className="stock-list">
              {lowStock.map((item) => (
                <div className="stock-row" key={item.id}>
                  <span className={`jewel-icon ${item.icon || "ring"}`} />
                  <div><strong>{item.name}</strong><small>{item.karat} · Stock {item.stock}</small></div>
                  <em>{item.stock === 0 ? "Out" : "Low"}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel panel-gold-strip">
            <CircleDollarSign size={22} />
            <div>
              <strong>Live 22K gold rate</strong>
              <p>{formatINR(rates["22K"])} per gram — updates POS, catalog and customer portal pricing.</p>
            </div>
            <Link className="export-button subtle" href="/gold-rates">Update rates</Link>
          </article>
        </section>
      </section>
    </AppShell>
  );
}
