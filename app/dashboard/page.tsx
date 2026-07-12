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

const kpis = [
  { label: "Total Sales", value: "₹ 18,90,45,000", delta: "12.5%", icon: ShoppingCart, tone: "blue" },
  { label: "Total Profit", value: "₹ 2,46,80,000", delta: "8.7%", icon: WalletCards, tone: "green" },
  { label: "Transactions", value: "24,540", delta: "9.3%", icon: TrendingUp, tone: "violet" },
  { label: "Customers", value: "3,254", delta: "11.8%", icon: UserRound, tone: "gold" },
  { label: "Gold Price (22K)", value: "₹ 7,245 /gm", delta: "1.21%", icon: CircleDollarSign, tone: "gold" },
];

const categories = [
  ["Rings", "32%", "₹ 6.05 Cr", "#f7b839"],
  ["Necklaces", "28%", "₹ 5.29 Cr", "#1d64d8"],
  ["Bangles", "18%", "₹ 3.40 Cr", "#6e43d8"],
  ["Earrings", "12%", "₹ 2.27 Cr", "#2aa868"],
  ["Others", "10%", "₹ 1.89 Cr", "#88a0c1"],
];

const items = [
  ["22K Gold Ring", "5.25 Cr", "15.2%", "ring"],
  ["Gold Necklace Set", "4.10 Cr", "12.5%", "necklace"],
  ["Gold Bangle", "3.75 Cr", "9.8%", "bangle"],
  ["Diamond Earrings", "2.15 Cr", "8.1%", "earrings"],
  ["Gold Pendant", "1.65 Cr", "7.3%", "pendant"],
];

const activities = [
  ["New order #ORD-1258 received", "10:30 AM"],
  ["Gold price updated (22K)", "09:15 AM"],
  ["Payment received from John Smith", "Yesterday"],
  ["Repair #REP-1023 completed", "Yesterday"],
  ["Stock transfer to Branch 2", "28 Apr, 2025"],
];

const stockAlerts = [
  ["Gold Chain (22K)", "Stock: 3 Pcs"],
  ["Gold Bangles (22K)", "Stock: 5 Pcs"],
  ["Diamond Ring", "Stock: 2 Pcs"],
  ["Gold Earrings (18K)", "Stock: 4 Pcs"],
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

const trendPoints = [12, 24, 23, 27, 42, 56, 38, 45, 34, 52, 44, 57, 48, 69, 61, 82, 74, 92];
const barGroups = [28, 42, 55, 35, 72, 48, 62, 78, 43, 70, 50, 86];

function LineChart() {
  const points = trendPoints
    .map((value, index) => `${(index / (trendPoints.length - 1)) * 100},${100 - value}`)
    .join(" ");

  return (
    <div className="chart line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="goldFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f5b638" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#f5b638" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#goldFill)" />
        <polyline points={points} fill="none" stroke="#e7a823" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="chart-tooltip">
        <span>22 Apr, 2025</span>
        <strong>₹ 18.75 Cr</strong>
      </div>
      <div className="axis-labels">
        <span>1 Apr</span>
        <span>8 Apr</span>
        <span>15 Apr</span>
        <span>22 Apr</span>
        <span>30 Apr</span>
      </div>
    </div>
  );
}

function DonutChart() {
  return (
    <div className="donut-wrap">
      <div className="donut" />
      <div className="category-list">
        {categories.map(([name, percent, value, color]) => (
          <div className="category-row" key={name}>
            <span className="dot" style={{ background: color }} />
            <span>{name}</span>
            <strong>{percent}</strong>
            <small>{value}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart() {
  return (
    <div className="bars" aria-hidden="true">
      {barGroups.map((height, index) => (
        <span key={index} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="dashboard page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Crown size={28} />
            <div>
              <h1>Executive Overview</h1>
              <p>Welcome back, Admin</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="date-button" type="button">
              30 Apr, 2025 <CalendarDays size={16} />
            </button>
            <button className="export-button" type="button">Export Report</button>
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
                <div className={`kpi-icon ${kpi.tone}`}>
                  <Icon size={24} />
                </div>
              </article>
            );
          })}
        </section>

        <section className="dashboard-grid">
          <article className="panel panel-wide">
            <div className="panel-head">
              <h2>Sales Trend</h2>
              <button type="button">This Month <ChevronDown size={14} /></button>
            </div>
            <LineChart />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Sales by Category</h2>
              <button type="button">This Month <ChevronDown size={14} /></button>
            </div>
            <DonutChart />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Top Selling Items</h2>
              <button type="button">This Month <ChevronDown size={14} /></button>
            </div>
            <div className="item-list">
              {items.map(([name, value, delta, icon]) => (
                <div className="item-row" key={name}>
                  <span className={`jewel-icon ${icon}`} />
                  <span>{name}</span>
                  <strong>{value}</strong>
                  <em>↑ {delta}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel summary-panel">
            <div className="panel-head">
              <h2>Today&apos;s Summary</h2>
            </div>
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
            <BarChart />
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Branch Comparison</h2>
              <button type="button">This Month <ChevronDown size={14} /></button>
            </div>
            <table className="branch-table">
              <thead>
                <tr><th>Branch</th><th>Sales</th><th>Profit</th><th>Orders</th></tr>
              </thead>
              <tbody>
                {branchRows.map((row) => (
                  <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <button className="link-button" type="button">View All Branches</button>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Recent Activities</h2>
            </div>
            <div className="activity-list">
              {activities.map(([text, time], index) => (
                <div className="activity-row" key={text}>
                  <span>{index + 1}</span>
                  <p>{text}</p>
                  <time>{time}</time>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2>Low Stock Alerts</h2>
              <button type="button">View All</button>
            </div>
            <div className="stock-list">
              {stockAlerts.map(([name, stock], index) => (
                <div className="stock-row" key={name}>
                  <span className={`jewel-icon ${index % 2 ? "bangle" : "chain"}`} />
                  <div><strong>{name}</strong><small>{stock}</small></div>
                  <em>Low Stock</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-head">
              <h2><Sparkles size={19} /> Insights</h2>
            </div>
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
