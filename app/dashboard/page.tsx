"use client";

import { useState } from "react";
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
import { AppShell } from "../components/AppShell";
import { firstName, formatINR, useStore } from "../lib/store";

const categories = [
  ["Rings", "32%", "6.05 Cr", "#f7b839"],
  ["Necklaces", "28%", "5.29 Cr", "#1d64d8"],
  ["Bangles", "18%", "3.40 Cr", "#6e43d8"],
  ["Earrings", "12%", "2.27 Cr", "#2aa868"],
  ["Others", "10%", "1.89 Cr", "#88a0c1"],
];

const topItems = [
  ["22K Gold Ring", "5.25 Cr", "15.2%", "ring"],
  ["Gold Necklace Set", "4.10 Cr", "12.5%", "necklace"],
  ["Gold Bangle", "3.75 Cr", "9.8%", "bangle"],
  ["Diamond Earrings", "2.15 Cr", "8.1%", "earrings"],
  ["Gold Pendant", "1.65 Cr", "7.3%", "pendant"],
];

const branchRows = [
  ["Main Branch", "8.75 Cr", "1.12 Cr", "569"],
  ["Branch 2", "4.25 Cr", "0.58 Cr", "325"],
  ["Branch 3", "3.15 Cr", "0.42 Cr", "210"],
  ["Branch 4", "2.75 Cr", "0.34 Cr", "178"],
];

const summaryItems = [
  { label: "Orders", value: "128", delta: "15%", icon: ReceiptText },
  { label: "Quotations", value: "72", delta: "8%", icon: PackageCheck },
  { label: "Repairs", value: "36", delta: "12%", icon: Wrench },
  { label: "New Customers", value: "24", delta: "20%", icon: UsersRound },
];

const trend = [
  { label: "1 Apr", value: 12.4 },
  { label: "5 Apr", value: 13.9 },
  { label: "9 Apr", value: 12.7 },
  { label: "13 Apr", value: 15.2 },
  { label: "17 Apr", value: 14.1 },
  { label: "21 Apr", value: 16.8 },
  { label: "25 Apr", value: 18.75 },
  { label: "30 Apr", value: 18.9 },
];

const barGroups = [28, 42, 55, 35, 72, 48, 62, 78, 43, 70, 50, 86];

function TrendChart() {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...trend.map((t) => t.value)) * 1.1;
  const min = Math.min(...trend.map((t) => t.value)) * 0.9;
  const x = (i: number) => (i / (trend.length - 1)) * 100;
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100;
  const line = trend.map((t, i) => `${x(i)},${y(t.value)}`).join(" ");

  return (
    <div className="trend">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f5b638" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f5b638" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${line} 100,100`} fill="url(#tg)" />
        <polyline points={line} fill="none" stroke="#e7a823" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {trend.map((t, i) => (
          <circle
            key={t.label}
            className="dot"
            cx={x(i)}
            cy={y(t.value)}
            r={hover === i ? 3.4 : 2.2}
            fill={hover === i ? "#e7a823" : "#fff"}
            stroke="#e7a823"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null ? (
        <div className="trend-tip" style={{ left: `${x(hover)}%`, top: `${(y(trend[hover].value) / 100) * 190}px` }}>
          <span>{trend[hover].label}</span>
          <strong>₹ {trend[hover].value.toFixed(2)} Cr</strong>
        </div>
      ) : null}
      <div className="trend-axis">
        {trend.filter((_, i) => i % 2 === 0).map((t) => <span key={t.label}>{t.label}</span>)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { rates, currentUser, invoices, customers } = useStore();
  const name = firstName(currentUser) || "Admin";

  const kpis = [
    { label: "Total Sales", value: "₹ 18,90,45,000", delta: "12.5%", icon: ShoppingCart, tone: "blue" },
    { label: "Total Profit", value: "₹ 2,46,80,000", delta: "8.7%", icon: WalletCards, tone: "green" },
    { label: "Transactions", value: "24,540", delta: "9.3%", icon: TrendingUp, tone: "violet" },
    { label: "Customers", value: customers.length.toLocaleString("en-IN"), delta: "11.8%", icon: UserRound, tone: "gold" },
    { label: "Gold Price (22K)", value: `${formatINR(rates["22K"])} /gm`, delta: "1.21%", icon: CircleDollarSign, tone: "gold" },
  ];

  return (
    <AppShell>
      <section className="dashboard page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Crown size={28} />
            <div>
              <h1>Executive Overview</h1>
              <p>Welcome back, {name}</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="date-button" href="/gold-rates">Today &middot; {rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={16} /></Link>
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
                  <p>↑ {kpi.delta} <small>vs last month</small></p>
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
              <span className="muted" style={{ fontSize: 13 }}>Hover points for detail</span>
            </div>
            <TrendChart />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Sales by Category</h2>
              <button type="button">This Month <ChevronDown size={14} /></button>
            </div>
            <div className="donut-wrap">
              <div className="donut" />
              <div className="category-list">
                {categories.map(([name, percent, value, color]) => (
                  <div className="category-row" key={name}>
                    <span className="dot" style={{ background: color }} />
                    <span>{name}</span>
                    <strong>{percent}</strong>
                    <small>₹ {value}</small>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Top Selling Items</h2>
              <Link className="link-button" href="/reports" style={{ width: "auto", margin: 0 }}>View report</Link>
            </div>
            <div className="item-list">
              {topItems.map(([n, value, delta, icon]) => (
                <div className="item-row" key={n}>
                  <span className={`jewel-icon ${icon}`} />
                  <span>{n}</span>
                  <strong>₹ {value}</strong>
                  <em>↑ {delta}</em>
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
                  <p>↑ {delta} vs yesterday</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Profit Overview</h2>
              <button type="button">This Month <ChevronDown size={14} /></button>
            </div>
            <div className="profit-head">
              <div><span>Total Profit</span><strong>₹ 2,46,80,000</strong><p>↑ 8.7% vs last month</p></div>
              <div><span>Gross Profit</span><strong>₹ 3,12,40,000</strong><span>Expenses ₹ 65,60,000</span></div>
            </div>
            <div className="bars" aria-hidden="true">
              {barGroups.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head"><h2>Branch Comparison</h2></div>
            <table className="branch-table">
              <thead><tr><th>Branch</th><th>Sales</th><th>Profit</th><th>Orders</th></tr></thead>
              <tbody>
                {branchRows.map((row) => (
                  <tr key={row[0]}><td>{row[0]}</td><td>₹ {row[1]}</td><td>₹ {row[2]}</td><td>{row[3]}</td></tr>
                ))}
              </tbody>
            </table>
            <Link className="link-button" href="/reports">View All Branches</Link>
          </article>

          <article className="panel">
            <div className="panel-head"><h2>Recent Invoices</h2><Link className="link-button" href="/sales/invoices" style={{ width: "auto", margin: 0 }}>View all</Link></div>
            <div className="activity-list">
              {invoices.slice(0, 5).map((inv, index) => (
                <div className="activity-row" key={inv.id}>
                  <span>{index + 1}</span>
                  <p>{inv.number} · {inv.customer}</p>
                  <time>{formatINR(inv.total)}</time>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head"><h2>Low Stock Alerts</h2><Link className="link-button" href="/inventory" style={{ width: "auto", margin: 0 }}>View all</Link></div>
            <div className="stock-list">
              {["Gold Chain (22K)", "Gold Bangles (22K)", "Diamond Ring", "Gold Earrings (18K)"].map((n, index) => (
                <div className="stock-row" key={n}>
                  <span className={`jewel-icon ${index % 2 ? "bangle" : "chain"}`} />
                  <div><strong>{n}</strong><small>Stock: {5 - index} Pcs</small></div>
                  <em>Low Stock</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head"><h2><Sparkles size={19} /> Insights</h2></div>
            <div className="insights">
              <p>Bangles category sales are expected to increase by 28% before Akshaya Tritiya.</p>
              <p>Customer demand for lightweight jewelry is trending up in your region.</p>
              <p>Consider reordering Gold Chains (22K) to avoid stockouts.</p>
            </div>
          </article>
        </section>
      </section>
    </AppShell>
  );
}
