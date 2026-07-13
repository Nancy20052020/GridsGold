"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bookmark,
  CalendarClock,
  Download,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Mail,
  Printer,
  Save,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import {
  inventoryAgingBucket,
  receivablesAging,
  salesByCategory,
  sumInvoices,
  topSellingItems,
} from "../lib/analytics";
import { downloadCsv } from "../lib/export";
import {
  SRS_REPORT_CATEGORIES,
  type SrsReport,
  type SrsReportCategory,
  srsLabel,
  srsPillTone,
} from "../lib/srs";
import {
  BRANCHES,
  formatINR,
  itemPrice,
  useStore,
  type Karat,
} from "../lib/store";

const CATEGORY_ORDER = Object.keys(SRS_REPORT_CATEGORIES) as SrsReportCategory[];
const HUB_TABS = ["Dashboard", "Reports", "Saved", "Builder"] as const;
type HubTab = (typeof HUB_TABS)[number];

const DATE_PRESETS = ["Today", "7 days", "30 days", "This quarter", "YTD", "Custom"] as const;
const SALESPEOPLE = ["All", "Asha Verma", "Meera Shah", "Imran Khan", "Walk-in desk"] as const;
const PURITIES: Array<"All" | Karat> = ["All", "24K", "22K", "18K", "925", "PT950"];

const SAVED_REPORTS = [
  { name: "Weekly sales flash", owner: "Nancy", when: "Every Mon 9:00", format: "PDF" },
  { name: "Branch stock valuation", owner: "Accounts", when: "Daily 18:00", format: "Excel" },
  { name: "GST draft pack", owner: "Tax desk", when: "20th monthly", format: "CSV" },
  { name: "VIP customer CLV", owner: "CRM", when: "On demand", format: "PDF" },
];

const MONTHLY = [
  { m: "Jan", v: 42 },
  { m: "Feb", v: 38 },
  { m: "Mar", v: 55 },
  { m: "Apr", v: 61 },
  { m: "May", v: 48 },
  { m: "Jun", v: 72 },
];

export default function ReportsPage() {
  const {
    invoices,
    items,
    customers,
    rates,
    repairs,
    purchaseOrders,
    suppliers,
    movements,
    expenses,
    workOrders,
    selectedBranch,
    currentUser,
  } = useStore();

  const [hub, setHub] = useState<HubTab>("Dashboard");
  const [category, setCategory] = useState<SrsReportCategory>("Sales");
  const [report, setReport] = useState<SrsReport>(SRS_REPORT_CATEGORIES.Sales[0]);
  const [datePreset, setDatePreset] = useState<(typeof DATE_PRESETS)[number]>("30 days");
  const [branch, setBranch] = useState(selectedBranch || "All");
  const [itemCategory, setItemCategory] = useState("All");
  const [purity, setPurity] = useState<(typeof PURITIES)[number]>("All");
  const [salesperson, setSalesperson] = useState<(typeof SALESPEOPLE)[number]>("All");
  const [toast, setToast] = useState("");
  const [builderMetrics, setBuilderMetrics] = useState<string[]>(["Net sales", "GST"]);
  const [builderDims, setBuilderDims] = useState<string[]>(["Branch", "Category"]);
  const [chartFocus, setChartFocus] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...new Set(items.map((i) => i.category))],
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      if (branch !== "All" && i.branch !== branch) return false;
      if (itemCategory !== "All" && i.category !== itemCategory) return false;
      if (purity !== "All" && i.karat !== purity) return false;
      return true;
    });
  }, [items, branch, itemCategory, purity]);

  const filteredInvoices = useMemo(() => {
    // Demo: salesperson/date act as soft filters via hash when not All/wide
    return invoices.filter((inv) => {
      if (salesperson !== "All") {
        const pick = SALESPEOPLE[1 + (inv.id.length % 3)];
        if (pick !== salesperson) return false;
      }
      return true;
    });
  }, [invoices, salesperson]);

  const receivables = useMemo(
    () => receivablesAging(customers, filteredInvoices, repairs),
    [customers, filteredInvoices, repairs],
  );
  const categorySales = useMemo(
    () => salesByCategory(filteredInvoices, items),
    [filteredInvoices, items],
  );
  const topProducts = useMemo(
    () => topSellingItems(filteredInvoices, items, rates, 8),
    [filteredInvoices, items, rates],
  );

  const netSales = sumInvoices(filteredInvoices);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const stockValue = filteredItems.reduce((s, i) => s + itemPrice(i, rates) * i.stock, 0);
  const taxTotal = filteredInvoices.reduce((s, i) => s + i.gst, 0);
  const payablesTotal = suppliers.reduce((s, sup) => s + sup.balance, 0);
  const receivablesTotal = receivables.reduce((s, row) => s + row.outstanding, 0);
  const profit = netSales - expenseTotal - Math.round(netSales * 0.62);
  const openRepairs = repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length;
  const maxMonth = Math.max(...MONTHLY.map((m) => m.v), 1);

  const topCustomers = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of filteredInvoices) map.set(inv.customer, (map.get(inv.customer) ?? 0) + inv.total);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredInvoices]);

  const kpis = [
    { label: "Net sales", value: formatINR(netSales), note: datePreset, tone: "gold", icon: BarChart3 },
    { label: "Gross profit", value: formatINR(Math.max(profit, 0)), note: "Est. after COGS", tone: "lavender", icon: Sparkles },
    { label: "Stock value", value: formatINR(stockValue), note: `${filteredItems.length} SKUs`, tone: "champagne", icon: LayoutDashboard },
    { label: "Receivables", value: formatINR(receivablesTotal), note: `${receivables.length} accounts`, tone: "violet", icon: Filter },
    { label: "GST collected", value: formatINR(taxTotal), note: "Output tax", tone: "lavender", icon: FileSpreadsheet },
    { label: "Open repairs", value: String(openRepairs), note: "Service pipeline", tone: "warn", icon: Bookmark },
  ];

  const categoryReports = SRS_REPORT_CATEGORIES[category];

  const { headers, rows, moneyCols } = useMemo(() => {
    if (report === "Sales Summary") {
      return {
        headers: ["Invoice #", "Customer", "Subtotal", "Tax", "Total", "Status", "Date"],
        rows: filteredInvoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, srsLabel(i.status), i.date] as (string | number)[]),
        moneyCols: new Set([2, 3, 4]),
      };
    }
    if (report === "Sales by Category") {
      return {
        headers: ["Category", "Sales (₹)", "Share %"],
        rows: categorySales.map((c) => [c.name, c.value, `${c.percent}%`]),
        moneyCols: new Set([1]),
      };
    }
    if (report === "Top Products") {
      return {
        headers: ["Product", "Qty", "Sales", "Share %"],
        rows: topProducts.map((p) => [p.name, p.qty, p.amount, `${p.share}%`]),
        moneyCols: new Set([2]),
      };
    }
    if (report === "Inventory Balance") {
      return {
        headers: ["SKU", "Item", "Branch", "Purity", "Stock", "Value"],
        rows: filteredItems.map((i) => [i.sku, i.name, i.branch, i.karat, i.stock, itemPrice(i, rates) * i.stock]),
        moneyCols: new Set([5]),
      };
    }
    if (report === "Inventory Aging") {
      return {
        headers: ["SKU", "Item", "Stock", "Value", "Aging"],
        rows: filteredItems.map((i) => [i.sku, i.name, i.stock, itemPrice(i, rates) * i.stock, inventoryAgingBucket(i.sku, i.stock)]),
        moneyCols: new Set([3]),
      };
    }
    if (report === "Stock Valuation") {
      return {
        headers: ["Branch", "SKUs", "Pcs", "Valuation"],
        rows: BRANCHES.map((b) => {
          const list = filteredItems.filter((i) => i.branch === b);
          return [
            b,
            list.length,
            list.reduce((s, i) => s + i.stock, 0),
            list.reduce((s, i) => s + itemPrice(i, rates) * i.stock, 0),
          ];
        }).filter((r) => Number(r[1]) > 0),
        moneyCols: new Set([3]),
      };
    }
    if (report === "Transfer History") {
      const transfers = movements.filter((m) => m.type === "Transfer");
      return {
        headers: ["Date", "Item", "Qty", "From", "To", "User"],
        rows: transfers.map((m) => [m.date, m.item, m.qty, m.from, m.to, m.user]),
        moneyCols: new Set<number>(),
      };
    }
    if (report === "Purchase History") {
      return {
        headers: ["PO #", "Supplier", "Branch", "Amount", "Status", "Date"],
        rows: purchaseOrders
          .filter((p) => branch === "All" || p.branch === branch)
          .map((p) => [p.number, p.supplier, p.branch ?? "—", p.amount, srsLabel(p.status), p.date]),
        moneyCols: new Set([3]),
      };
    }
    if (report === "Repair Pipeline") {
      return {
        headers: ["Repair #", "Customer", "Item", "Status", "Estimate", "Balance", "Priority"],
        rows: repairs.map((r) => [r.number, r.customer, r.item, srsLabel(r.status), r.estimate, r.balanceDue ?? 0, srsLabel(r.priority ?? "normal")]),
        moneyCols: new Set([4, 5]),
      };
    }
    if (report === "Manufacturing Pipeline") {
      return {
        headers: ["WO #", "Product", "Karigar", "Planned", "Done", "Status", "Due"],
        rows: workOrders.map((w) => [w.number, w.product, w.karigar, w.qtyPlanned, w.qtyDone, srsLabel(w.status), w.due]),
        moneyCols: new Set<number>(),
      };
    }
    if (report === "Customer History") {
      return {
        headers: ["Code", "Customer", "Type", "Invoices", "Spend", "Outstanding"],
        rows: customers.map((c) => {
          const custInvoices = filteredInvoices.filter((i) => i.customer === c.name);
          const spend = custInvoices.reduce((s, i) => s + i.total, 0);
          const outstanding = receivables.find((row) => row.customer === c.name)?.outstanding ?? 0;
          return [c.code, c.name, srsLabel(c.type), custInvoices.length, spend, outstanding];
        }),
        moneyCols: new Set([4, 5]),
      };
    }
    if (report === "Tax Summary") {
      return {
        headers: ["Invoice #", "Customer", "Taxable", "GST", "Total", "Status", "Date"],
        rows: filteredInvoices.map((i) => [i.number, i.customer, i.subtotal, i.gst, i.total, srsLabel(i.status), i.date]),
        moneyCols: new Set([2, 3, 4]),
      };
    }
    if (report === "Receivables Aging") {
      return {
        headers: ["Customer", "Code", "Outstanding", "0–30", "31–60", "61+"],
        rows: receivables.map((row) => [row.customer, row.code, row.outstanding, row.bucket0to30, row.bucket31to60, row.bucket61plus]),
        moneyCols: new Set([2, 3, 4, 5]),
      };
    }
    if (report === "Payables Aging") {
      return {
        headers: ["Supplier", "Code", "Balance", "Terms", "Bucket"],
        rows: suppliers.map((s) => [s.name, s.code, s.balance, s.paymentTerms ?? "—", s.balance > 500000 ? "31–60 days" : "0–30 days"]),
        moneyCols: new Set([2]),
      };
    }
    if (report === "Profit & Loss") {
      return {
        headers: ["Line", "Amount"],
        rows: [
          ["Jewellery sales", netSales],
          ["Less: GST", -taxTotal],
          ["Net revenue", netSales - taxTotal],
          ["COGS (est. 62%)", -Math.round(netSales * 0.62)],
          ["Operating expenses", -expenseTotal],
          ["Net profit", profit],
        ],
        moneyCols: new Set([1]),
      };
    }
    if (report === "Balance Sheet") {
      return {
        headers: ["Account", "Amount"],
        rows: [
          ["Cash & bank (memo)", Math.round(netSales * 0.35)],
          ["Receivables", receivablesTotal],
          ["Inventory", stockValue],
          ["Payables", -payablesTotal],
          ["GST payable", -Math.round(taxTotal * 0.4)],
          ["Equity + P&L", Math.round(netSales * 0.35) + receivablesTotal + stockValue - payablesTotal - Math.round(taxTotal * 0.4)],
        ],
        moneyCols: new Set([1]),
      };
    }
    return {
      headers: ["Metal / Karat", "Rate / g", "Currency", "Effective"],
      rows: Object.entries(rates).map(([k, v]) => [k, v, "INR", "Today"]),
      moneyCols: new Set([1]),
    };
  }, [
    report, filteredInvoices, categorySales, topProducts, filteredItems, rates, movements,
    purchaseOrders, branch, repairs, workOrders, customers, receivables, suppliers,
    netSales, taxTotal, expenseTotal, profit, receivablesTotal, stockValue, payablesTotal,
  ]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function selectCategory(next: SrsReportCategory) {
    setCategory(next);
    setReport(SRS_REPORT_CATEGORIES[next][0]);
    setHub("Reports");
  }

  function exportCsv() {
    downloadCsv(`report-${report.toLowerCase().replace(/\s+/g, "-")}`, headers, rows);
    flash("CSV downloaded");
  }

  function toggleBuilder(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <AppShell searchPlaceholder="Search reports, KPIs, saved packs…">
      <section className="page-content rpt-v2">
        <header className="rpt-v2-head">
          <div>
            <span className="rpt-v2-eyebrow"><BarChart3 size={14} /> Reports & Analytics · {selectedBranch}</span>
            <h1>Reports & Analytics</h1>
            <p>
              Real-time jewellery intelligence — sales, stock, finance, GST and AI insights for {currentUser?.name?.split(" ")[0] || "leadership"}.
            </p>
          </div>
          <div className="rpt-v2-head-actions">
            <button type="button" className="rpt-v2-btn ghost" onClick={() => window.print()}><Printer size={16} /> PDF</button>
            <button type="button" className="rpt-v2-btn ghost" onClick={exportCsv}><Download size={16} /> CSV / Excel</button>
            <button type="button" className="rpt-v2-btn ghost" onClick={() => flash("Report emailed to role inbox")}><Mail size={16} /> Email</button>
            <button type="button" className="rpt-v2-btn gold" onClick={() => { setHub("Saved"); flash("Report saved to library"); }}>
              <Save size={16} /> Save
            </button>
          </div>
        </header>

        <section className="rpt-v2-kpis" aria-label="Report KPIs">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className={`rpt-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
                <div className="rpt-v2-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rpt-glass rpt-v2-filters" aria-label="Advanced filters">
          <label>
            <span>Date</span>
            <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as typeof datePreset)}>
              {DATE_PRESETS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label>
            <span>Branch</span>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="All">All branches</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span>Purity</span>
            <select value={purity} onChange={(e) => setPurity(e.target.value as typeof purity)}>
              {PURITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label>
            <span>Salesperson</span>
            <select value={salesperson} onChange={(e) => setSalesperson(e.target.value as typeof salesperson)}>
              {SALESPEOPLE.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="rpt-v2-role">
            <ShieldCheck size={16} />
            <span>Role access · Admin</span>
          </div>
        </section>

        <nav className="rpt-glass rpt-v2-tabs" aria-label="Reports hub">
          {HUB_TABS.map((t) => (
            <button key={t} type="button" className={hub === t ? "active" : ""} onClick={() => setHub(t)}>{t}</button>
          ))}
        </nav>

        {hub === "Dashboard" ? (
          <div className="rpt-v2-dash">
            <section className="rpt-glass">
              <div className="rpt-v2-section-head">
                <h2><BarChart3 size={16} /> Sales trend</h2>
                <span>₹ Lakhs · interactive</span>
              </div>
              <div className="rpt-v2-chart" aria-label="Monthly sales trend">
                {MONTHLY.map((m) => (
                  <button
                    type="button"
                    className={`rpt-v2-col ${chartFocus === m.m ? "focus" : ""}`}
                    key={m.m}
                    onClick={() => {
                      setChartFocus(m.m);
                      flash(`Drill-down · ${m.m} sales ₹${m.v}L`);
                      setHub("Reports");
                      setCategory("Sales");
                      setReport("Sales Summary");
                    }}
                  >
                    <span style={{ height: `${(m.v / maxMonth) * 100}%` }} />
                    <em>{m.m}</em>
                    <small>{m.v}L</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="rpt-glass">
              <div className="rpt-v2-section-head">
                <h2>Category mix</h2>
                <button type="button" className="rpt-link" onClick={() => { selectCategory("Sales"); setReport("Sales by Category"); }}>Drill down</button>
              </div>
              <div className="rpt-v2-bars">
                {categorySales.map((c) => (
                  <button
                    type="button"
                    className="rpt-v2-bar-btn"
                    key={c.name}
                    onClick={() => {
                      setItemCategory(c.name);
                      selectCategory("Sales");
                      setReport("Sales by Category");
                      flash(`Filtered · ${c.name}`);
                    }}
                  >
                    <div className="rpt-v2-bar-top"><span>{c.name}</span><strong>{c.percent}%</strong></div>
                    <div className="rpt-v2-bar-track"><span style={{ width: `${c.percent}%`, background: c.color }} /></div>
                    <small>{formatINR(c.value)}</small>
                  </button>
                ))}
                {categorySales.length === 0 ? <p className="muted">No sales in filter.</p> : null}
              </div>
            </section>

            <aside className="rpt-v2-side">
              <section className="rpt-glass rpt-v2-ai">
                <div className="rpt-v2-section-head"><h2><Sparkles size={16} /> AI business insights</h2></div>
                <ul className="rpt-v2-ai-list">
                  <li><strong>Margin pulse</strong><small>Bridal attach lifts May profit; keep 22K making at current band.</small></li>
                  <li><strong>Stock vs sales</strong><small>Heavy necklaces aging — push exchange offers on Branch 2.</small></li>
                  <li><strong>Collections</strong><small>{topCustomers[0]?.[0] ?? "Top accounts"} leads spend; schedule VIP preview.</small></li>
                  <li><strong>Tax desk</strong><small>GST output {formatINR(taxTotal)} — reconcile e-invoices before GSTR-1.</small></li>
                </ul>
              </section>

              <section className="rpt-glass">
                <div className="rpt-v2-section-head">
                  <h2>Top customers</h2>
                  <button type="button" className="rpt-link" onClick={() => selectCategory("Customers")}>All</button>
                </div>
                <div className="rpt-v2-rank">
                  {topCustomers.map(([name, amt]) => (
                    <div key={name}><strong>{name}</strong><span>{formatINR(amt)}</span></div>
                  ))}
                  {topCustomers.length === 0 ? <p className="muted">No customer sales yet.</p> : null}
                </div>
              </section>

              <section className="rpt-glass">
                <div className="rpt-v2-section-head">
                  <h2>Top products</h2>
                  <button type="button" className="rpt-link" onClick={() => { selectCategory("Sales"); setReport("Top Products"); }}>Report</button>
                </div>
                <div className="rpt-v2-rank">
                  {topProducts.slice(0, 5).map((p) => (
                    <div key={p.name}><strong>{p.name}</strong><span>{formatINR(p.amount)}</span></div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {hub === "Reports" ? (
          <>
            <div className="rpt-v2-cats">
              {CATEGORY_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={key === category ? "active" : ""}
                  onClick={() => selectCategory(key)}
                >
                  {key}
                  <span>{SRS_REPORT_CATEGORIES[key].length}</span>
                </button>
              ))}
            </div>

            <div className="rpt-glass rpt-v2-report-tabs">
              {categoryReports.map((r) => (
                <button key={r} type="button" className={r === report ? "active" : ""} onClick={() => setReport(r)}>
                  {r}
                </button>
              ))}
            </div>

            <section className="rpt-glass rpt-v2-table-card">
              <div className="rpt-v2-section-head">
                <div>
                  <h2>{report}</h2>
                  <p className="rpt-v2-sub">{category} · {rows.length} rows · filters applied · drill-ready</p>
                </div>
                <div className="rpt-v2-head-actions">
                  <button type="button" className="rpt-v2-btn ghost compact" onClick={exportCsv}><FileSpreadsheet size={14} /> Export</button>
                  <button type="button" className="rpt-v2-btn ghost compact" onClick={() => window.print()}><Printer size={14} /> Print</button>
                </div>
              </div>
              <div className="rpt-v2-table-wrap">
                <table className="rpt-v2-table">
                  <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} onClick={() => flash(`Drill-down · ${String(row[0])}`)}>
                        {row.map((cell, ci) => (
                          <td key={ci}>
                            {typeof cell === "string" && /paid|posted|ready|closed|approved|partial|delivered/i.test(cell)
                              ? <span className={`status-pill ${srsPillTone(cell.toLowerCase().replace(/\s+/g, "_"))}`}>{cell}</span>
                              : moneyCols.has(ci) && typeof cell === "number" ? formatINR(cell) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length === 0 ? <tr><td colSpan={headers.length} className="empty-note">No data for this report.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {hub === "Saved" ? (
          <div className="rpt-v2-saved-grid">
            {SAVED_REPORTS.map((s) => (
              <article className="rpt-glass rpt-v2-saved" key={s.name}>
                <div className="rpt-v2-saved-top">
                  <Bookmark size={16} />
                  <em>{s.format}</em>
                </div>
                <strong>{s.name}</strong>
                <small>Owner {s.owner}</small>
                <div className="rpt-v2-saved-foot">
                  <span><CalendarClock size={14} /> {s.when}</span>
                  <button type="button" className="rpt-v2-btn gold compact" onClick={() => flash(`Running ${s.name}`)}>Run</button>
                </div>
              </article>
            ))}
            <article className="rpt-glass rpt-v2-saved add" onClick={() => setHub("Builder")} role="button" tabIndex={0}>
              <Wand2 size={22} />
              <strong>Schedule new pack</strong>
              <small>Custom metrics · email · role ACL</small>
            </article>
          </div>
        ) : null}

        {hub === "Builder" ? (
          <div className="rpt-v2-builder">
            <section className="rpt-glass">
              <div className="rpt-v2-section-head"><h2><Wand2 size={16} /> Custom report builder</h2></div>
              <p className="rpt-v2-sub">Pick metrics and dimensions, then preview or schedule.</p>
              <div className="rpt-v2-builder-cols">
                <div>
                  <h3>Metrics</h3>
                  {["Net sales", "GST", "Gross profit", "Stock value", "Repair revenue", "PO spend"].map((m) => (
                    <label key={m} className="rpt-v2-check">
                      <input type="checkbox" checked={builderMetrics.includes(m)} onChange={() => toggleBuilder(builderMetrics, setBuilderMetrics, m)} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <h3>Dimensions</h3>
                  {["Branch", "Category", "Purity", "Salesperson", "Customer type", "Month"].map((d) => (
                    <label key={d} className="rpt-v2-check">
                      <input type="checkbox" checked={builderDims.includes(d)} onChange={() => toggleBuilder(builderDims, setBuilderDims, d)} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rpt-v2-builder-actions">
                <button type="button" className="rpt-v2-btn gold" onClick={() => flash("Preview generated from builder")}>Preview</button>
                <button type="button" className="rpt-v2-btn ghost" onClick={() => { setHub("Saved"); flash("Scheduled · weekly email"); }}>
                  <CalendarClock size={15} /> Schedule
                </button>
              </div>
            </section>
            <aside className="rpt-glass rpt-v2-ai">
              <div className="rpt-v2-section-head"><h2><Sparkles size={16} /> Builder tip</h2></div>
              <p className="rpt-v2-tip">
                Combine <strong>{builderMetrics.join(", ") || "metrics"}</strong> by{" "}
                <strong>{builderDims.join(", ") || "dimensions"}</strong> for a board-ready pack. Role-based access keeps tax reports admin-only.
              </p>
              <Link className="rpt-v2-btn ghost" href="/analytics" style={{ marginTop: 12 }}>Open live analytics</Link>
            </aside>
          </div>
        ) : null}

        {toast ? <div className="rpt-v2-toast" role="status">{toast}</div> : null}
      </section>
    </AppShell>
  );
}
