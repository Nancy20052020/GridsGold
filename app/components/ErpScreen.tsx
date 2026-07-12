import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { inventoryRows, sampleRows, screenConfigs, screenGroups, type ScreenConfig } from "../data";

const inventoryColumns = ["Item", "SKU / Barcode", "Category", "Purity", "Weight", "Status", "Location", "Value"];
const defaultColumns = ["Reference", "Party", "Description", "Amount", "Status", "Date"];
const inventoryTabs = ["All Items", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants", "Gold Bars", "Coins", "Diamonds"];

const defaultStats = [
  { label: "Open Records", value: "128", delta: "Actionable", tone: "gold" },
  { label: "Monthly Value", value: "₹ 2.46 Cr", delta: "8.7% up", tone: "green" },
  { label: "Pending Review", value: "24", delta: "Needs attention", tone: "red" },
  { label: "Branches", value: "4", delta: "Synced", tone: "blue" },
];

const inventoryStats = [
  { label: "Total Items", value: "12,842", delta: "12.5% vs last month", tone: "violet" },
  { label: "Total Weight", value: "4,285.670 g", delta: "5.3% vs last month", tone: "blue" },
  { label: "Total Value", value: "₹ 28,65,45,210", delta: "8.7% vs last month", tone: "gold" },
  { label: "Low Stock Items", value: "36", delta: "Reorder soon", tone: "red" },
  { label: "Out of Stock", value: "12", delta: "Action needed", tone: "red" },
];

function statsFor(screen: ScreenConfig) {
  if (screen.path === "/inventory") return inventoryStats;
  if (screen.path === "/pos") {
    return [
      { label: "Current Cart", value: "₹ 2,72,868", delta: "3 items", tone: "gold" },
      { label: "Today Sales", value: "₹ 8,42,650", delta: "28 invoices", tone: "green" },
      { label: "Gold Rate", value: "₹ 7,245/g", delta: "22K active", tone: "blue" },
      { label: "Open Holds", value: "7", delta: "Pickup pending", tone: "violet" },
    ];
  }
  if (screen.kind === "report") {
    return [
      { label: "Net Sales", value: "₹ 18.90 Cr", delta: "Current month", tone: "gold" },
      { label: "Gross Profit", value: "₹ 3.12 Cr", delta: "16.5% margin", tone: "green" },
      { label: "Exports", value: "PDF / Excel", delta: "Ready", tone: "blue" },
      { label: "Updated", value: "10:24 AM", delta: "30 Apr 2025", tone: "violet" },
    ];
  }
  return defaultStats;
}

function statusClass(value: string) {
  const text = value.toLowerCase();
  if (text.includes("out") || text.includes("review") || text.includes("pending")) return "danger";
  if (text.includes("low") || text.includes("transit") || text.includes("bench") || text.includes("draft")) return "warning";
  return "success";
}

function KpiStrip({ screen }: { screen: ScreenConfig }) {
  return (
    <section className="erp-kpis">
      {statsFor(screen).map((stat) => (
        <article className={`erp-kpi ${stat.tone}`} key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.delta}</small>
        </article>
      ))}
    </section>
  );
}

function ScreenTable({ screen }: { screen: ScreenConfig }) {
  const isInventory = screen.path === "/inventory";
  const columns = isInventory ? inventoryColumns : defaultColumns;
  const rows = isInventory ? inventoryRows : sampleRows;

  return (
    <article className="erp-panel table-panel">
      <div className="table-toolbar">
        <div className="filter-search">
          <Search size={18} />
          <input placeholder={`Search ${screen.title.toLowerCase()}...`} />
        </div>
        <button type="button"><SlidersHorizontal size={17} /> Filters</button>
        <button className="gold-action subtle" type="button">Export</button>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell, index) => (
                  <td key={cell + index}>
                    {index === 5 || (index === 4 && !isInventory) ? <span className={`status-pill ${statusClass(cell)}`}>{cell}</span> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function PosScreen() {
  const products = ["22K Ring", "Gold Necklace", "Bangle Bracelet", "Diamond Ring", "Gold Pendant", "22K Pendant"];
  return (
    <section className="pos-layout">
      <article className="erp-panel">
        <div className="panel-title-row">
          <h2>Quick Sale</h2>
          <button type="button">Scan Barcode</button>
        </div>
        <div className="category-tabs compact-tabs">
          {["All", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants"].map((tab, index) => (
            <button className={index === 0 ? "active" : ""} key={tab} type="button">{tab}</button>
          ))}
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <button className="product-tile" key={product} type="button">
              <span className={`jewel-icon ${index % 3 === 0 ? "ring" : index % 3 === 1 ? "necklace" : "bangle"}`} />
              <strong>{product}</strong>
              <small>{index % 2 ? "18.350 g" : "4.120 g"}</small>
              <em>{index % 2 ? "₹ 1,45,280" : "₹ 32,560"}</em>
            </button>
          ))}
        </div>
      </article>
      <article className="erp-panel invoice-card">
        <div className="panel-title-row">
          <h2>Invoice #INV-10248</h2>
          <button type="button">Add Customer</button>
        </div>
        <ScreenTable screen={{ path: "/pos-cart", title: "Cart", module: "Sales", kind: "table", subtitle: "" }} />
        <div className="totals">
          <div><span>Sub Total</span><strong>₹ 2,64,920</strong></div>
          <div><span>GST (3%)</span><strong>₹ 7,948</strong></div>
          <div className="grand"><span>Total Amount</span><strong>₹ 2,72,868</strong></div>
        </div>
      </article>
    </section>
  );
}

function DetailScreen({ screen }: { screen: ScreenConfig }) {
  return (
    <section className="detail-layout">
      <article className="erp-panel media-panel">
        <div className="product-photo">
          <span className="jewel-icon necklace" />
        </div>
        <div className="thumbnail-row">
          {["ring", "necklace", "bangle", "earrings"].map((item) => <span className={`jewel-icon ${item}`} key={item} />)}
        </div>
      </article>
      <article className="erp-panel">
        <div className="panel-title-row">
          <h2>{screen.title}</h2>
          <span className="status-pill success">Active</span>
        </div>
        <div className="spec-grid">
          {[
            ["Reference", screen.path.includes("customer") ? "CUST-1001" : "RG22K-00124"],
            ["Category", screen.module],
            ["Purity", "22K (916)"],
            ["Weight", "5.250 g"],
            ["Location", "Main Branch"],
            ["Updated", "30 Apr, 2025"],
          ].map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
      </article>
      <article className="erp-panel timeline-panel">
        <h2>Activity Timeline</h2>
        {["Created by Admin", "Stock updated", "Customer notified", "Document attached"].map((item, index) => (
          <div className="timeline-row" key={item}>
            <span>{index + 1}</span>
            <div><strong>{item}</strong><small>{index === 0 ? "12 Apr, 2025" : "30 Apr, 2025"}</small></div>
          </div>
        ))}
      </article>
    </section>
  );
}

function FormScreen({ screen }: { screen: ScreenConfig }) {
  const fields = ["Name / Title", "Reference Code", "Category", "Branch", "Status", "Notes"];
  return (
    <article className="erp-panel form-panel">
      <div className="form-grid">
        {fields.map((field, index) => (
          <label key={field}>
            <span>{field}</span>
            <input defaultValue={index === 0 ? screen.title.replace("Add ", "") : index === 3 ? "Main Branch" : ""} placeholder={field} />
          </label>
        ))}
      </div>
      <div className="form-actions">
        <button className="ghost-action" type="button">Cancel</button>
        <button className="gold-action" type="button">{screen.primaryAction ?? "Save"}</button>
      </div>
    </article>
  );
}

function WorkflowScreen({ screen }: { screen: ScreenConfig }) {
  return (
    <section className="workflow-grid">
      {["Received", "In Review", "Approved", "Completed"].map((stage, index) => (
        <article className="workflow-column" key={stage}>
          <h2>{stage}</h2>
          {[1, 2].map((item) => (
            <div className="work-card" key={item}>
              <strong>{screen.title} #{index + 1}{item}</strong>
              <span>Main Branch</span>
              <small>{index === 3 ? "Completed today" : "Due 02 May, 2025"}</small>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}

function SettingsScreen({ screen }: { screen: ScreenConfig }) {
  return (
    <section className="settings-grid">
      {[
        ["Default Branch", "Main Branch", "Used for billing and inventory"],
        ["Print Template", "Jewellery 80mm", "Invoice, tag, and receipt format"],
        ["Approval Mode", "Enabled", "Protects finance and stock changes"],
      ].map(([title, value, detail]) => (
        <article className="erp-panel setting-card" key={title}>
          <ShieldCheck size={24} />
          <span>{title}</span>
          <strong>{value}</strong>
          <p>{detail}</p>
        </article>
      ))}
      <FormScreen screen={screen} />
    </section>
  );
}

function HubScreen({ screen }: { screen: ScreenConfig }) {
  const group = screenGroups.find((item) => item.title === screen.module || screen.title.includes(item.title));
  const paths = group?.paths ?? screenConfigs.slice(0, 8).map((item) => item.path);
  return (
    <section className="hub-grid">
      {paths.map((path) => {
        const target = screenConfigs.find((item) => item.path === path);
        if (!target) return null;
        return (
          <Link className="hub-card" href={target.path} key={target.path}>
            <span><ArrowUpRight size={18} /></span>
            <strong>{target.title}</strong>
            <small>{target.subtitle}</small>
          </Link>
        );
      })}
    </section>
  );
}

function ReportsScreen({ screen }: { screen: ScreenConfig }) {
  return (
    <section className="report-layout">
      <article className="erp-panel report-chart">
        <div className="panel-title-row">
          <h2>{screen.title}</h2>
          <button type="button">This Month</button>
        </div>
        <div className="bars report-bars">
          {[62, 84, 55, 78, 68, 92, 74, 88].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </article>
      <ScreenTable screen={screen} />
    </section>
  );
}

function ScreenIndex() {
  return (
    <section className="screen-map">
      {screenGroups.map((group) => (
        <article className="erp-panel screen-group" key={group.title}>
          <h2>{group.title}</h2>
          <div>
            {group.paths.map((path) => {
              const screen = screenConfigs.find((item) => item.path === path);
              return screen ? <Link href={screen.path} key={screen.path}>{screen.title}</Link> : null;
            })}
          </div>
        </article>
      ))}
    </section>
  );
}

export function ErpScreen({ screen }: { screen: ScreenConfig }) {
  const isIndex = screen.path === "/screens";

  return (
    <section className="erp-page page-content">
      <div className="page-heading">
        <div className="heading-copy">
          <Sparkles size={28} />
          <div>
            <span className="eyebrow">{screen.module}</span>
            <h1>{screen.title}</h1>
            <p>{screen.subtitle}</p>
          </div>
        </div>
        <div className="heading-actions">
          <button className="date-button" type="button">30 Apr, 2025 <CalendarDays size={16} /></button>
          {screen.primaryAction ? <button className="export-button" type="button">{screen.primaryAction}</button> : null}
        </div>
      </div>

      {isIndex ? null : <KpiStrip screen={screen} />}

      {screen.path === "/inventory" ? (
        <div className="category-tabs">
          {inventoryTabs.map((tab, index) => <button className={index === 0 ? "active" : ""} key={tab} type="button">{tab}</button>)}
        </div>
      ) : null}

      {screen.path === "/pos" ? <PosScreen /> : null}
      {isIndex ? <ScreenIndex /> : null}
      {screen.kind === "table" && screen.path !== "/pos" ? <ScreenTable screen={screen} /> : null}
      {screen.kind === "detail" ? <DetailScreen screen={screen} /> : null}
      {screen.kind === "form" ? <FormScreen screen={screen} /> : null}
      {screen.kind === "workflow" ? <WorkflowScreen screen={screen} /> : null}
      {screen.kind === "settings" ? <SettingsScreen screen={screen} /> : null}
      {screen.kind === "hub" && !isIndex ? <HubScreen screen={screen} /> : null}
      {screen.kind === "report" ? <ReportsScreen screen={screen} /> : null}
    </section>
  );
}
