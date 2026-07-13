"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Lightbulb,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  DEMO_SALES_BY_CATEGORY,
  DEMO_SALES_TREND,
  buildAiInsights,
  lowStockItems,
  recentTransactions,
  salesByCategory,
  salesTrendFromInvoices,
  sumInvoices,
  todaySummary,
  topSellingItems,
} from "../lib/analytics";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { adminNavItems } from "../lib/adminNav";
import { firstName, formatINR, itemStatus, useStore } from "../lib/store";

type TrendPoint = { label: string; value: number };
type ChartCoord = TrendPoint & { x: number; y: number };

const GALLERY = [
  { src: "landing_image.png", label: "Cloud workspace" },
  { src: "customer_1.png", label: "Sapphire set" },
  { src: "customer_2.png", label: "Bridal gold" },
  { src: "customer_3.png", label: "Craft detail" },
  { src: "necklace_2.png", label: "Heritage necklace" },
  { src: "ring_3.png", label: "Diamond ring" },
];

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

function CategoryDonut({
  categories,
}: {
  categories: { name: string; percent: number; value: number; color: string }[];
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const segments = useMemo(() => {
    return categories.reduce<
      { name: string; percent: number; value: number; color: string; length: number; dashoffset: number }[]
    >((acc, cat) => {
      const length = (cat.percent / 100) * circumference;
      const prev = acc[acc.length - 1];
      const dashoffset = prev ? prev.dashoffset - prev.length : 0;
      return [...acc, { ...cat, length, dashoffset }];
    }, []);
  }, [categories, circumference]);

  return (
    <div className="dash-donut">
      <div className="dash-donut-visual">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} className="dash-donut-track" />
          {segments.map((cat) => (
            <circle
              key={cat.name}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={cat.color}
              strokeWidth="14"
              strokeDasharray={`${cat.length} ${circumference - cat.length}`}
              strokeDashoffset={cat.dashoffset}
              strokeLinecap="butt"
              transform="rotate(-90 60 60)"
            />
          ))}
          <text x="60" y="56" textAnchor="middle" className="dash-donut-center-label">Mix</text>
          <text x="60" y="72" textAnchor="middle" className="dash-donut-center-value">
            {categories[0]?.percent ?? 0}%
          </text>
        </svg>
      </div>
      <ul className="dash-donut-legend">
        {categories.map((cat) => (
          <li key={cat.name}>
            <span style={{ background: cat.color }} />
            <div>
              <strong>{cat.name}</strong>
              <small>{cat.percent}% · {formatINR(cat.value)}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const { rates, currentUser, invoices, customers, items, repairs, movements } = useStore();
  const name = firstName(currentUser) || "Admin";

  const totalSales = sumInvoices(invoices);
  const topItems = useMemo(() => topSellingItems(invoices, items, rates, 5), [invoices, items, rates]);
  const categories = useMemo(() => {
    const live = salesByCategory(invoices, items);
    return live.length ? live : DEMO_SALES_BY_CATEGORY;
  }, [invoices, items]);
  const trend = useMemo(() => {
    const live = salesTrendFromInvoices(invoices);
    return live.length >= 4 ? live : DEMO_SALES_TREND;
  }, [invoices]);
  const lowStock = lowStockItems(items, 5);
  const txns = recentTransactions(invoices, movements, 6);
  const summary = todaySummary(invoices, repairs, customers.length);
  const insights = useMemo(
    () => buildAiInsights({ invoices, items, repairs, customers, rates, categories, topItems }),
    [invoices, items, repairs, customers, rates, categories, topItems],
  );

  const openRepairs = repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length;
  const lowStockCount = items.filter((i) => itemStatus(i.stock) === "Low Stock" || itemStatus(i.stock) === "Out of Stock").length;
  const inventoryPieces = items.reduce((sum, item) => sum + item.stock, 0);

  const kpis = [
    { label: "Total Sales", value: formatINR(totalSales), note: "+12% vs last week", href: "/sales/invoices", icon: ShoppingCart, tone: "gold" },
    { label: "Open Repairs", value: openRepairs.toLocaleString("en-IN"), note: "In pipeline", href: "/repairs", icon: Wrench, tone: "blue" },
    { label: "Stock Alerts", value: lowStockCount.toLocaleString("en-IN"), note: "Need attention", href: "/inventory", icon: Package, tone: "warn" },
    { label: "Customers", value: customers.length.toLocaleString("en-IN"), note: "Active CRM", href: "/customers", icon: UserRound, tone: "navy" },
  ];

  const quickLinks = adminNavItems.filter((m) => m.href !== "/dashboard").slice(0, 4);

  const showcaseItems = useMemo(() => {
    if (topItems.length) {
      return topItems.map((row) => {
        const match = items.find((i) => i.name === row.name);
        return {
          name: row.name,
          amount: row.amount,
          qty: row.qty,
          image: match?.image ?? row.image,
          icon: match?.icon ?? row.icon,
          karat: match?.karat,
          weight: match?.weight,
        };
      });
    }
    return items.slice(0, 5).map((item) => ({
      name: item.name,
      amount: 0,
      qty: undefined as number | undefined,
      image: item.image,
      icon: item.icon,
      karat: item.karat,
      weight: item.weight,
    }));
  }, [topItems, items]);

  return (
    <AppShell>
      <section className="dashboard page-content dash-home dash-pro">
        <section className="dash-pro-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dash-pro-hero-bg" src="/images/landing_image.png" alt="" />
          <div className="dash-pro-hero-veil" />
          <div className="dash-pro-hero-copy">
            <span className="dash-pro-eyebrow"><Sparkles size={14} /> AI-ready showroom dashboard</span>
            <h1>Welcome back, {name}</h1>
            <p>
              Live gold pricing, sales pulse and stock alerts — {inventoryPieces} pieces across branches.
            </p>
            <div className="dash-pro-hero-actions">
              <Link className="export-button" href="/pos">+ New sale</Link>
              <Link className="dash-rate" href="/gold-rates">
                22K · ₹{rates["22K"].toLocaleString("en-IN")}/g <CalendarDays size={15} />
              </Link>
            </div>
          </div>
          <div className="dash-pro-hero-gallery" aria-hidden="true">
            {GALLERY.slice(1, 4).map((shot) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={shot.src} src={`/images/${shot.src}`} alt="" />
            ))}
          </div>
        </section>

        <section className="dash-kpis dash-pro-kpis">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link className={`dash-kpi dash-pro-kpi tone-${kpi.tone}`} href={kpi.href} key={kpi.label}>
                <div className="dash-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
                <ArrowRight size={16} className="dash-kpi-arrow" />
              </Link>
            );
          })}
        </section>

        <section className="dash-pro-charts">
          <article className="dash-card dash-chart-card">
            <div className="dash-card-head">
              <h2>Revenue Overview</h2>
              <Link href="/reports">Full report</Link>
            </div>
            <SmoothSalesChart points={trend} />
          </article>

          <article className="dash-card">
            <div className="dash-card-head">
              <h2>Category Mix</h2>
              <Link href="/analytics">Analytics</Link>
            </div>
            <CategoryDonut categories={categories} />
          </article>
        </section>

        <section className="dash-pro-ai">
          <div className="dash-card-head">
            <h2><Lightbulb size={18} /> AI Insights</h2>
            <span className="dash-pro-ai-badge">Live from your store data</span>
          </div>
          <div className="dash-pro-ai-grid">
            {insights.map((insight) => (
              <article className={`dash-pro-ai-card tone-${insight.tone}`} key={insight.id}>
                <strong>{insight.title}</strong>
                <p>{insight.detail}</p>
                <Link href={insight.href}>{insight.action} <ArrowRight size={14} /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="dash-pro-summary">
          <div className="dash-card-head">
            <h2>Today&apos;s Summary</h2>
            <Link href="/reports">View report</Link>
          </div>
          <div className="dash-pro-summary-grid">
            <div><strong>{summary.orders}</strong><span>Orders</span></div>
            <div><strong>{summary.quotations}</strong><span>Quotations</span></div>
            <div><strong>{summary.repairs}</strong><span>Repairs</span></div>
            <div><strong>{summary.customers}</strong><span>Customers</span></div>
            <div><strong>{inventoryPieces}</strong><span>Stock pieces</span></div>
            <div><strong>₹{rates["22K"].toLocaleString("en-IN")}</strong><span>22K / gram</span></div>
          </div>
        </section>

        <div className="dash-layout dash-pro-layout">
          <div className="dash-main">
            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Top Selling Items</h2>
                <Link href="/jewelry">View catalog</Link>
              </div>
              <ul className="dash-list dash-pro-sellers">
                {showcaseItems.map((row) => (
                  <li key={row.name}>
                    <ItemImage item={row} className="product-img tile-img" />
                    <div className="dash-pro-seller-copy">
                      <strong>{row.name}</strong>
                      <small>
                        {[row.karat, row.weight ? `${row.weight}g` : null, row.qty ? `${row.qty} sold` : null]
                          .filter(Boolean)
                          .join(" · ") || "Featured piece"}
                      </small>
                    </div>
                    <em className="dash-pro-seller-amt">{row.amount ? formatINR(row.amount) : "—"}</em>
                  </li>
                ))}
              </ul>
            </article>

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
          </div>

          <aside className="dash-side">
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

            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Quick Jump</h2>
              </div>
              <div className="dash-pro-quick">
                {quickLinks.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Link href={mod.href} key={mod.href}>
                      <Icon size={16} />
                      <span>{mod.label}</span>
                      <ArrowRight size={14} />
                    </Link>
                  );
                })}
              </div>
            </article>
          </aside>
        </div>

        <section className="dash-pro-gallery">
          <div className="dash-card-head">
            <h2>Collection spotlight</h2>
            <Link href="/jewelry">Browse jewelry</Link>
          </div>
          <div className="dash-pro-gallery-track">
            {GALLERY.map((shot) => (
              <figure key={shot.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/${shot.src}`} alt={shot.label} />
                <figcaption>{shot.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
