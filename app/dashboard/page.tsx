"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Package,
  ShoppingCart,
  TrendingUp,
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
import { ItemImage } from "../components/ProductImage";
import { firstName, formatINR, itemStatus, useStore } from "../lib/store";

type TrendPoint = { label: string; value: number };
type ChartCoord = TrendPoint & { x: number; y: number };

function buildChartCoords(points: TrendPoint[]): ChartCoord[] {
  const max = Math.max(...points.map((p) => p.value), 0.1) * 1.08;
  const min = Math.min(...points.map((p) => p.value), 0) * 0.95;
  const range = max - min || 1;
  const last = Math.max(points.length - 1, 1);

  return points.map((point, index) => ({
    ...point,
    x: 4 + (index / last) * 92,
    y: 92 - ((point.value - min) / range) * 78,
  }));
}

function smoothLinePath(coords: ChartCoord[]) {
  if (coords.length < 2) return coords.length ? `M ${coords[0].x} ${coords[0].y}` : "";

  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p0 = coords[i - 1] ?? coords[i];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function SmoothSalesChart({ points }: { points: TrendPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(points.length - 1);

  const coords = useMemo(() => buildChartCoords(points), [points]);
  const linePath = useMemo(() => smoothLinePath(coords), [coords]);
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? 96} 96 L ${coords[0]?.x ?? 4} 96 Z`;
  const focus = coords[active] ?? coords[coords.length - 1];
  const total = points.reduce((sum, p) => sum + p.value, 0);

  function pickIndex(clientX: number) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || coords.length === 0) return;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const x = 4 + ratio * 92;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    coords.forEach((coord, index) => {
      const d = Math.abs(coord.x - x);
      if (d < distance) {
        distance = d;
        nearest = index;
      }
    });
    setActive(nearest);
  }

  return (
    <div
      className="dash-chart"
      ref={wrapRef}
      onMouseLeave={() => setActive(points.length - 1)}
      onMouseMove={(e) => pickIndex(e.clientX)}
      onTouchMove={(e) => pickIndex(e.touches[0]?.clientX ?? 0)}
    >
      <div className="dash-chart-summary">
        <div>
          <span className="dash-chart-kicker">Sales trend</span>
          <strong>₹ {focus?.value.toFixed(2) ?? "0.00"} L</strong>
          <small>{focus?.label ?? "—"}</small>
        </div>
        <div className="dash-chart-stat">
          <TrendingUp size={16} />
          <span>{total.toFixed(1)} L total</span>
        </div>
      </div>

      <div className="dash-chart-canvas">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="dashAreaFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f2b33d" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#1d64d8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#1d64d8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="dashLineStroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1d64d8" />
              <stop offset="100%" stopColor="#e6a520" />
            </linearGradient>
          </defs>

          {[22, 42, 62, 82].map((y) => (
            <line key={y} x1="4" x2="96" y1={y} y2={y} className="dash-chart-grid" vectorEffect="non-scaling-stroke" />
          ))}

          <path d={areaPath} className="dash-chart-area" fill="url(#dashAreaFill)" />
          <path d={linePath} className="dash-chart-line" fill="none" stroke="url(#dashLineStroke)" vectorEffect="non-scaling-stroke" />

          {focus ? (
            <line
              x1={focus.x}
              x2={focus.x}
              y1="12"
              y2="96"
              className="dash-chart-cursor"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>
      </div>

      <div className="dash-chart-axis">
        {points.map((point, index) => (
          <button
            key={point.label}
            type="button"
            className={index === active ? "active" : ""}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            {point.label.replace("Week ", "W")}
          </button>
        ))}
      </div>
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

        <article className="dash-card dash-chart-card dash-chart-full">
          <div className="dash-card-head">
            <h2>Revenue Overview</h2>
            <Link href="/reports">Full report</Link>
          </div>
          <SmoothSalesChart points={trend} />
        </article>

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

            <div className="dash-split-row">
              <article className="dash-card">
                <div className="dash-card-head">
                  <h2>Top Items</h2>
                  <Link href="/jewelry">Catalog</Link>
                </div>
                <ul className="dash-list">
                  {(topItems.length ? topItems.slice(0, 4) : [
                    { name: "Gold Necklace Set", amount: 145280, icon: "necklace", image: "necklace_1.png" },
                    { name: "22K Gold Ring", amount: 38500, icon: "ring", image: "ring_1.png" },
                  ]).map((row) => {
                    const match = items.find((i) => i.name === row.name);
                    return (
                      <li key={row.name}>
                        <ItemImage item={match ?? row} className="product-img tile-img" />
                        <div>
                          <strong>{row.name}</strong>
                          <small>{row.amount ? formatINR(row.amount) : "—"}</small>
                        </div>
                      </li>
                    );
                  })}
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
                      <ItemImage item={item} className="product-img tile-img" />
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
            </div>
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
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
