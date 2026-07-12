"use client";

import { ChartNoAxesCombined } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR } from "../lib/store";

const monthly = [
  ["Jan", 62], ["Feb", 74], ["Mar", 68], ["Apr", 92], ["May", 81], ["Jun", 88],
];

const categoryShare = [
  ["Rings", 32, "#f7b839"],
  ["Necklaces", 28, "#1d64d8"],
  ["Bangles", 18, "#6e43d8"],
  ["Earrings", 12, "#2aa868"],
  ["Others", 10, "#88a0c1"],
];

export default function AnalyticsPage() {
  const { invoices, customers } = useStore();
  const netSales = invoices.reduce((s, i) => s + i.total, 0);
  const avgOrder = invoices.length ? netSales / invoices.length : 0;

  const kpis = [
    { label: "Avg. Order Value", value: formatINR(avgOrder), tone: "gold" },
    { label: "Conversion Rate", value: "7.95%", tone: "green" },
    { label: "Repeat Customers", value: "45%", tone: "violet" },
    { label: "Active Customers", value: customers.length.toLocaleString("en-IN"), tone: "blue" },
  ];

  return (
    <AppShell searchPlaceholder="Search analytics...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <ChartNoAxesCombined size={28} />
            <div>
              <span className="eyebrow">Analytics</span>
              <h1>Business Analytics</h1>
              <p>Trends and performance across sales, categories and customers.</p>
            </div>
          </div>
        </div>

        <div className="stat-cards">
          {kpis.map((k) => <article className={`erp-kpi ${k.tone}`} key={k.label}><span>{k.label}</span><strong>{k.value}</strong></article>)}
        </div>

        <div className="two-col">
          <article className="erp-panel">
            <div className="panel-title-row"><h2>Monthly Sales (₹ Cr)</h2></div>
            <div className="bars" style={{ height: 200 }}>
              {monthly.map(([m, h]) => (
                <span key={m as string} style={{ height: `${h as number}%` }} title={`${m}: ${((h as number) / 5).toFixed(1)} Cr`} />
              ))}
            </div>
            <div className="trend-axis">{monthly.map(([m]) => <span key={m as string}>{m}</span>)}</div>
          </article>

          <article className="erp-panel">
            <div className="panel-title-row"><h2>Sales by Category</h2></div>
            <div className="analytics-shares">
              {categoryShare.map(([name, pct, color]) => (
                <div className="share-row" key={name as string}>
                  <div className="share-top"><span>{name}</span><strong>{pct}%</strong></div>
                  <div className="progress"><span style={{ width: `${pct}%`, background: color as string }} /></div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
