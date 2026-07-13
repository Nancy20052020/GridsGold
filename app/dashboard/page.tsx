"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Crown,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  DEMO_SALES_BY_CATEGORY,
  DEMO_SALES_TREND,
  estimateProfit,
  sumInvoices,
  topSellingItems,
} from "../lib/analytics";
import { AppShell } from "../components/AppShell";
import { firstName, formatINR, useStore } from "../lib/store";

function BarChart({ points }: { points: { label: string; value: number }[] }) {
  const max = Math.max(...points.map((p) => p.value), 0.1);
  return (
    <div className="chart-bars-wrap">
      <div className="chart-bars" aria-hidden="true">
        {points.map((p) => (
          <div className="chart-bar-col" key={p.label}>
            <span className="chart-bar" style={{ height: `${(p.value / max) * 100}%` }} title={`₹ ${p.value}L`} />
            <em>{p.label.replace("Week ", "W")}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { rates, currentUser, invoices, customers, items, expenses } = useStore();
  const name = firstName(currentUser) || "Admin";

  const totalSales = sumInvoices(invoices);
  const profit = estimateProfit(totalSales, expenses);
  const topItems = useMemo(() => topSellingItems(invoices, items, rates), [invoices, items, rates]);

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
              <p>Welcome back, {name}</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="date-button" href="/gold-rates">
              22K · {rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={16} />
            </Link>
            <Link className="export-button" href="/pos">+ New sale</Link>
            <Link className="export-button subtle" href="/sales/invoices"><ReceiptText size={16} /> Invoices</Link>
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
            <BarChart points={DEMO_SALES_TREND} />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Sales by Category</h2>
            </div>
            <div className="analytics-shares">
              {DEMO_SALES_BY_CATEGORY.map((c) => (
                <div className="share-row" key={c.name}>
                  <div className="share-top"><span>{c.name}</span><strong>{c.percent}%</strong></div>
                  <div className="progress"><span style={{ width: `${c.percent}%`, background: c.color }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Top Selling Items</h2>
            </div>
            <div className="item-list">
              {(topItems.length ? topItems.slice(0, 5) : [
                { name: "Gold Necklace Set", amount: 145280, share: 42, icon: "necklace" },
                { name: "22K Gold Ring", amount: 38500, share: 28, icon: "ring" },
              ]).map((row) => (
                <div className="item-row" key={row.name}>
                  <span className={`jewel-icon ${row.icon}`} />
                  <span>{row.name}</span>
                  <strong>{row.amount ? formatINR(row.amount) : "—"}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </AppShell>
  );
}
