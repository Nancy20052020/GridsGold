"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Package,
  ReceiptText,
  ShoppingCart,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  DEMO_SALES_BY_CATEGORY,
  DEMO_SALES_TREND,
  branchComparison,
  lowStockItems,
  recentTransactions,
  salesByCategory,
  salesTrendFromInvoices,
  sumInvoices,
  topSellingItems,
} from "../lib/analytics";
import { AppShell } from "../components/AppShell";
import { firstName, formatINR, itemStatus, useStore } from "../lib/store";

type TrendPoint = { label: string; value: number };

function TrendChart({ points, unit = "L" }: { points: TrendPoint[]; unit?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...points.map((t) => t.value), 0.1) * 1.12;
  const min = Math.min(...points.map((t) => t.value), 0) * 0.92;
  const range = max - min || 1;
  const x = (i: number) => (points.length <= 1 ? 50 : (i / (points.length - 1)) * 100);
  const y = (v: number) => 100 - ((v - min) / range) * 88 - 6;
  const line = points.map((t, i) => `${x(i)},${y(t.value)}`).join(" ");

  return (
    <div className="mis-chart trend trend-rich">
      <div className="mis-chart-meta">
        <span className="mis-chart-value">
          {hover !== null ? `₹ ${points[hover].value.toFixed(2)} ${unit}` : `₹ ${points[points.length - 1]?.value.toFixed(2) ?? "0"} ${unit}`}
        </span>
        <span className="mis-chart-hint muted">Hover points for detail</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" onMouseLeave={() => setHover(null)} aria-hidden="true">
        <defs>
          <linearGradient id="misTrendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1d64d8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1d64d8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[18, 36, 54, 72, 90].map((g) => (
          <line key={g} x1="0" x2="100" y1={g} y2={g} vectorEffect="non-scaling-stroke" className="trend-grid-line" />
        ))}
        <polygon points={`0,100 ${line} 100,100`} fill="url(#misTrendFill)" />
        <polyline points={line} fill="none" stroke="#1d64d8" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
        {points.map((t, i) => (
          <circle
            key={`${t.label}-${i}`}
            className="dot"
            cx={x(i)}
            cy={y(t.value)}
            r={hover === i ? 3.2 : 2}
            fill={hover === i ? "#1d64d8" : "#fff"}
            stroke="#1d64d8"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== null ? (
        <div className="trend-tip" style={{ left: `${x(hover)}%`, top: `${(y(points[hover].value) / 100) * 168}px` }}>
          <span>{points[hover].label}</span>
          <strong>₹ {points[hover].value.toFixed(2)} {unit}</strong>
        </div>
      ) : null}
      <div className="trend-axis">
        {points.map((t, i) => (i % 2 === 0 ? <span key={t.label}>{t.label.replace("Week ", "W")}</span> : null))}
      </div>
    </div>
  );
}

function SparkBars({ points }: { points: TrendPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 0.1);
  return (
    <div className="mis-sparkbars" aria-hidden="true">
      {points.slice(-8).map((p) => (
        <span key={p.label} style={{ height: `${Math.max((p.value / max) * 100, 12)}%` }} title={`${p.label}: ₹ ${p.value}L`} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { rates, currentUser, invoices, customers, items, repairs, movements } = useStore();
  const name = firstName(currentUser) || "Admin";

  const totalSales = sumInvoices(invoices);
  const topItems = useMemo(() => topSellingItems(invoices, items, rates), [invoices, items, rates]);
  const categories = useMemo(() => {
    const live = salesByCategory(invoices, items);
    return live.length ? live : DEMO_SALES_BY_CATEGORY;
  }, [invoices, items]);
  const trend = useMemo(() => {
    const live = salesTrendFromInvoices(invoices);
    return live.length >= 4 ? live : DEMO_SALES_TREND;
  }, [invoices]);
  const branches = useMemo(() => branchComparison(invoices), [invoices]);
  const lowStock = lowStockItems(items, 6);
  const txns = recentTransactions(invoices, movements, 6);

  const openRepairs = repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length;
  const lowStockCount = items.filter((i) => itemStatus(i.stock) === "Low Stock" || itemStatus(i.stock) === "Out of Stock").length;
  const salesDelta = trend.length >= 2 ? trend[trend.length - 1].value - trend[trend.length - 2].value : 0;

  const kpis = [
    {
      label: "Total Sales",
      value: formatINR(totalSales),
      delta: salesDelta >= 0 ? `+₹ ${Math.abs(salesDelta).toFixed(1)}L vs prior` : `-₹ ${Math.abs(salesDelta).toFixed(1)}L vs prior`,
      up: salesDelta >= 0,
      icon: ShoppingCart,
      tone: "blue",
    },
    {
      label: "Open Repairs",
      value: openRepairs.toLocaleString("en-IN"),
      delta: "Active pipeline",
      up: openRepairs <= 5,
      icon: Wrench,
      tone: "violet",
    },
    {
      label: "Stock Alerts",
      value: lowStockCount.toLocaleString("en-IN"),
      delta: "Low or out of stock",
      up: lowStockCount === 0,
      icon: Package,
      tone: "amber",
    },
    {
      label: "Customers",
      value: customers.length.toLocaleString("en-IN"),
      delta: `${invoices.length} invoices`,
      up: true,
      icon: UserRound,
      tone: "green",
    },
  ];

  return (
    <AppShell>
      <section className="dashboard page-content mis-dashboard">
        <div className="page-heading mis-heading">
          <div className="heading-copy">
            <div>
              <span className="eyebrow">Executive MIS</span>
              <h1>Dashboard</h1>
              <p>Welcome back, {name} · {selectedBranchLabel(invoices.length)}</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="mis-pill" href="/gold-rates">
              22K · ₹{rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={15} />
            </Link>
            <Link className="export-button" href="/pos">+ New sale</Link>
            <Link className="export-button subtle" href="/sales/invoices"><ReceiptText size={16} /> Invoices</Link>
          </div>
        </div>

        <section className="mis-kpi-grid">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const DeltaIcon = kpi.up ? ArrowUpRight : ArrowDownRight;
            return (
              <article className={`mis-kpi mis-kpi-${kpi.tone}`} key={kpi.label}>
                <div className="mis-kpi-top">
                  <span className="mis-kpi-label">{kpi.label}</span>
                  <div className={`mis-kpi-icon ${kpi.tone}`}><Icon size={18} /></div>
                </div>
                <strong className="mis-kpi-value">{kpi.value}</strong>
                <p className={`mis-kpi-delta ${kpi.up ? "up" : "down"}`}>
                  <DeltaIcon size={14} /> {kpi.delta}
                </p>
                {kpi.label === "Total Sales" ? <SparkBars points={trend} /> : null}
              </article>
            );
          })}
        </section>

        <section className="mis-grid">
          <article className="mis-panel mis-panel-wide">
            <div className="mis-panel-head">
              <div>
                <h2>Sales Trend</h2>
                <p className="muted">Weekly revenue · ₹ Lakhs</p>
              </div>
              <Link className="mis-link" href="/reports">Full report</Link>
            </div>
            <TrendChart points={trend} />
          </article>

          <article className="mis-panel">
            <div className="mis-panel-head">
              <div>
                <h2>Category Mix</h2>
                <p className="muted">Share of posted sales</p>
              </div>
            </div>
            <div className="mis-category-list">
              {categories.map((c) => (
                <div className="mis-category-row" key={c.name}>
                  <span className="mis-category-dot" style={{ background: c.color }} />
                  <div className="mis-category-copy">
                    <div className="mis-category-top">
                      <span>{c.name}</span>
                      <strong>{c.percent}%</strong>
                    </div>
                    <div className="mis-progress">
                      <span style={{ width: `${c.percent}%`, background: c.color }} />
                    </div>
                    {"value" in c && c.value ? <small>{formatINR(c.value)}</small> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mis-panel">
            <div className="mis-panel-head">
              <div>
                <h2>Top Items</h2>
                <p className="muted">By invoice value</p>
              </div>
              <Link className="mis-link" href="/jewelry">Catalog</Link>
            </div>
            <div className="mis-table">
              {(topItems.length ? topItems.slice(0, 5) : [
                { name: "Gold Necklace Set", amount: 145280, share: 42, icon: "necklace", qty: 1 },
                { name: "22K Gold Ring", amount: 38500, share: 28, icon: "ring", qty: 2 },
              ]).map((row, index) => (
                <div className="mis-table-row" key={row.name}>
                  <span className="mis-rank">{index + 1}</span>
                  <span className={`jewel-icon ${row.icon}`} />
                  <div className="mis-table-main">
                    <strong>{row.name}</strong>
                    <small>{row.qty ? `${row.qty} sold` : "—"}</small>
                  </div>
                  <div className="mis-table-end">
                    <strong>{row.amount ? formatINR(row.amount) : "—"}</strong>
                    <em>{row.share ? `${row.share}%` : "—"}</em>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mis-panel">
            <div className="mis-panel-head">
              <div>
                <h2>Recent Activity</h2>
                <p className="muted">Sales & stock movements</p>
              </div>
              <Link className="mis-link" href="/sales/invoices">View all</Link>
            </div>
            <div className="mis-activity">
              {txns.map((tx) => (
                <div className="mis-activity-row" key={tx.id}>
                  <span className={`mis-tag ${tx.type === "Sale" ? "sale" : "stock"}`}>{tx.type}</span>
                  <div>
                    <strong>{tx.ref}</strong>
                    <small>{tx.party}</small>
                  </div>
                  <em>{tx.amount ? formatINR(tx.amount) : tx.date}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="mis-panel">
            <div className="mis-panel-head">
              <div>
                <h2>Branch Performance</h2>
                <p className="muted">Comparative MIS snapshot</p>
              </div>
            </div>
            <div className="mis-table-scroll">
              <table className="mis-data-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Sales</th>
                    <th>Profit</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((row) => (
                    <tr key={row.branch}>
                      <td>{row.branch}</td>
                      <td>{formatINR(row.sales)}</td>
                      <td className="profit">{formatINR(row.profit)}</td>
                      <td>{row.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="mis-panel">
            <div className="mis-panel-head">
              <div>
                <h2>Stock Alerts</h2>
                <p className="muted">Items needing attention</p>
              </div>
              <Link className="mis-link" href="/inventory">Inventory</Link>
            </div>
            <div className="mis-table">
              {(lowStock.length ? lowStock : items.slice(0, 4)).map((item) => (
                <div className="mis-table-row" key={item.id}>
                  <span className={`jewel-icon ${item.icon || "ring"}`} />
                  <div className="mis-table-main">
                    <strong>{item.name}</strong>
                    <small>{item.karat} · {item.weight}g</small>
                  </div>
                  <div className="mis-table-end">
                    <span className={`mis-stock-pill ${item.stock <= 0 ? "out" : "low"}`}>
                      {item.stock <= 0 ? "Out" : `${item.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </AppShell>
  );
}

function selectedBranchLabel(invoiceCount: number) {
  if (invoiceCount === 0) return "demo analytics until first sale";
  return `${invoiceCount} posted invoice${invoiceCount === 1 ? "" : "s"}`;
}
