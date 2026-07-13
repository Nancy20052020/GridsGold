"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
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
  const lowStock = lowStockItems(items, 5);
  const txns = recentTransactions(invoices, movements, 8);

  const openRepairs = repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length;
  const lowStockCount = items.filter((i) => itemStatus(i.stock) === "Low Stock" || itemStatus(i.stock) === "Out of Stock").length;

  const kpis = [
    { label: "Total Sales", value: formatINR(totalSales), href: "/sales/invoices", icon: ShoppingCart },
    { label: "Open Repairs", value: openRepairs.toLocaleString("en-IN"), href: "/repairs", icon: Wrench },
    { label: "Stock Alerts", value: lowStockCount.toLocaleString("en-IN"), href: "/inventory", icon: Package },
    { label: "Customers", value: customers.length.toLocaleString("en-IN"), href: "/customers", icon: UserRound },
  ];

  const quickLinks = [
    { label: "New sale", href: "/pos" },
    { label: "Gold rates", href: "/gold-rates" },
    { label: "Reports", href: "/reports" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <AppShell>
      <section className="dashboard page-content dash-home">
        <header className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {name}</p>
          </div>
          <div className="heading-actions">
            <Link className="dash-rate" href="/gold-rates">
              22K · ₹{rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={15} />
            </Link>
            <Link className="export-button" href="/pos">+ New sale</Link>
          </div>
        </header>

        <section className="dash-kpis">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link className="dash-kpi" href={kpi.href} key={kpi.label}>
                <div className="dash-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                </div>
                <ArrowRight size={16} className="dash-kpi-arrow" />
              </Link>
            );
          })}
        </section>

        <div className="dash-layout">
          <div className="dash-main">
            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Recent Transactions</h2>
                <Link href="/sales/invoices">View all</Link>
              </div>
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Reference</th>
                      <th>Party</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((tx) => (
                      <tr key={tx.id}>
                        <td><span className={`dash-pill ${tx.type === "Sale" ? "sale" : "stock"}`}>{tx.type}</span></td>
                        <td>{tx.ref}</td>
                        <td>{tx.party}</td>
                        <td className="num">{tx.amount ? formatINR(tx.amount) : tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Weekly Sales</h2>
                <span className="muted">₹ Lakhs</span>
              </div>
              <WeeklySalesTable points={trend} />
            </article>
          </div>

          <aside className="dash-side">
            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Quick Actions</h2>
              </div>
              <div className="dash-quick">
                {quickLinks.map((link) => (
                  <Link href={link.href} key={link.href}>{link.label}</Link>
                ))}
              </div>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Category Mix</h2>
              </div>
              <div className="dash-bars">
                {categories.map((c) => (
                  <div className="dash-bar-row" key={c.name}>
                    <div className="dash-bar-top">
                      <span>{c.name}</span>
                      <strong>{c.percent}%</strong>
                    </div>
                    <div className="dash-bar-track">
                      <span style={{ width: `${c.percent}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Top Items</h2>
                <Link href="/jewelry">Catalog</Link>
              </div>
              <ul className="dash-list">
                {(topItems.length ? topItems.slice(0, 4) : [
                  { name: "Gold Necklace Set", amount: 145280, icon: "necklace" },
                  { name: "22K Gold Ring", amount: 38500, icon: "ring" },
                ]).map((row) => (
                  <li key={row.name}>
                    <span className={`jewel-icon ${row.icon}`} />
                    <div>
                      <strong>{row.name}</strong>
                      <small>{row.amount ? formatINR(row.amount) : "—"}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Stock Alerts</h2>
                <Link href="/inventory">Inventory</Link>
              </div>
              <ul className="dash-list">
                {(lowStock.length ? lowStock : items.slice(0, 4)).map((item) => (
                  <li key={item.id}>
                    <span className={`jewel-icon ${item.icon || "ring"}`} />
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.karat} · {item.weight}g</small>
                    </div>
                    <em className={item.stock <= 0 ? "out" : "low"}>
                      {item.stock <= 0 ? "Out" : `${item.stock} left`}
                    </em>
                  </li>
                ))}
              </ul>
            </article>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}

function WeeklySalesTable({ points }: { points: TrendPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 0.1);

  return (
    <div className="dash-table-wrap">
      <table className="dash-table dash-table-compact">
        <thead>
          <tr>
            <th>Period</th>
            <th>Revenue</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          {points.map((row, index) => {
            const prev = index > 0 ? points[index - 1].value : row.value;
            const change = row.value - prev;
            return (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="num">₹ {row.value.toFixed(2)} L</td>
                <td>
                  <div className="dash-inline-bar">
                    <span style={{ width: `${(row.value / max) * 100}%` }} />
                  </div>
                  {index > 0 ? (
                    <small className={change >= 0 ? "up" : "down"}>
                      {change >= 0 ? "+" : ""}{change.toFixed(1)} L
                    </small>
                  ) : (
                    <small className="muted">—</small>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
