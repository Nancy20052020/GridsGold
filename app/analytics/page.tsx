"use client";

import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Sparkles } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { salesByCategory, sumInvoices } from "../lib/analytics";
import { formatINR, useStore } from "../lib/store";

const monthly = [
  { m: "Jan", v: 62 },
  { m: "Feb", v: 74 },
  { m: "Mar", v: 68 },
  { m: "Apr", v: 92 },
  { m: "May", v: 81 },
  { m: "Jun", v: 88 },
];

export default function AnalyticsPage() {
  const { invoices, customers, items, selectedBranch } = useStore();
  const netSales = sumInvoices(invoices);
  const avgOrder = invoices.length ? netSales / invoices.length : 0;
  const mix = salesByCategory(invoices, items);
  const max = Math.max(...monthly.map((m) => m.v), 1);

  const kpis = [
    { label: "Avg. order value", value: formatINR(avgOrder), note: "Ticket size", tone: "gold" },
    { label: "Net sales", value: formatINR(netSales), note: "Posted invoices", tone: "lavender" },
    { label: "Repeat rate", value: "45%", note: "Demo cohort", tone: "champagne" },
    { label: "Active customers", value: String(customers.length), note: selectedBranch, tone: "violet" },
  ];

  return (
    <AppShell searchPlaceholder="Search analytics...">
      <section className="page-content rpt-v2">
        <header className="rpt-v2-head">
          <div>
            <span className="rpt-v2-eyebrow"><ChartNoAxesCombined size={14} /> Live analytics</span>
            <h1>Business Analytics</h1>
            <p>Trends across sales, categories and customers — deep packs live in Reports.</p>
          </div>
          <div className="rpt-v2-head-actions">
            <Link className="rpt-v2-btn gold" href="/reports">
              Reports hub <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        <section className="rpt-v2-kpis rpt-v2-kpis-4" aria-label="Analytics KPIs">
          {kpis.map((kpi) => (
            <article className={`rpt-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
              <div>
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.note}</small>
              </div>
            </article>
          ))}
        </section>

        <div className="rpt-v2-dash analytics-lite">
          <section className="rpt-glass">
            <div className="rpt-v2-section-head"><h2>Monthly sales pulse</h2></div>
            <div className="rpt-v2-chart">
              {monthly.map((m) => (
                <div className="rpt-v2-col" key={m.m}>
                  <span style={{ height: `${(m.v / max) * 100}%` }} />
                  <em>{m.m}</em>
                </div>
              ))}
            </div>
          </section>
          <section className="rpt-glass">
            <div className="rpt-v2-section-head"><h2>Category share</h2></div>
            <div className="rpt-v2-bars">
              {mix.map((c) => (
                <div key={c.name}>
                  <div className="rpt-v2-bar-top"><span>{c.name}</span><strong>{c.percent}%</strong></div>
                  <div className="rpt-v2-bar-track"><span style={{ width: `${c.percent}%`, background: c.color }} /></div>
                </div>
              ))}
            </div>
          </section>
          <aside className="rpt-glass rpt-v2-ai">
            <div className="rpt-v2-section-head"><h2><Sparkles size={16} /> Insight</h2></div>
            <p className="rpt-v2-tip">
              Use the Reports hub for GST packs, P&amp;L, stock valuation, scheduled exports and role-based sharing.
            </p>
            <Link className="rpt-v2-btn ghost" href="/reports" style={{ marginTop: 12 }}>Open reports</Link>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
