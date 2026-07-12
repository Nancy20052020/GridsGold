"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Plus, Search } from "lucide-react";
import { INVENTORY_TABS, isRemovedCategory } from "../lib/categories";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { useStore, itemPrice, itemStatus, formatINR } from "../lib/store";

const tabs = [...INVENTORY_TABS];

export default function InventoryPage() {
  const { items, rates } = useStore();
  const [tab, setTab] = useState("All Items");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");

  const visible = useMemo(
    () =>
      items.filter((item) => {
        if (isRemovedCategory(item.category)) return false;
        const inTab = tab === "All Items" || item.category === tab;
        const inQuery =
          !query ||
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.sku.toLowerCase().includes(query.toLowerCase());
        const inStatus = status === "All Status" || itemStatus(item.stock) === status;
        return inTab && inQuery && inStatus;
      }),
    [items, tab, query, status],
  );

  const totalValue = items.reduce((sum, i) => sum + itemPrice(i, rates) * i.stock, 0);
  const totalWeight = items.reduce((sum, i) => sum + i.weight * i.stock, 0);
  const low = items.filter((i) => itemStatus(i.stock) === "Low Stock").length;
  const out = items.filter((i) => itemStatus(i.stock) === "Out of Stock").length;

  const kpis = [
    { label: "Total Items", value: items.length.toLocaleString("en-IN"), tone: "violet" },
    { label: "Total Weight", value: totalWeight.toFixed(2) + " g", tone: "blue" },
    { label: "Stock Value", value: formatINR(totalValue), tone: "gold" },
    { label: "Low Stock", value: String(low), tone: "red" },
    { label: "Out of Stock", value: String(out), tone: "red" },
  ];

  return (
    <AppShell searchPlaceholder="Search item, SKU, karat or location...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Boxes size={28} />
            <div>
              <span className="eyebrow">Inventory</span>
              <h1>Inventory Overview</h1>
              <p>Track stock, weight and value across all locations. Prices use the live gold rate.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="export-button" href="/inventory/new"><Plus size={16} /> Add New Item</Link>
          </div>
        </div>

        <section className="erp-kpis erp-kpis-5">
          {kpis.map((kpi) => (
            <article className={`erp-kpi ${kpi.tone}`} key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </article>
          ))}
        </section>

        <div className="category-tabs">
          {tabs.map((t) => (
            <button className={t === tab ? "active" : ""} key={t} type="button" onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <article className="erp-panel table-panel">
          <div className="table-toolbar">
            <div className="filter-search">
              <Search size={18} />
              <input placeholder="Search in inventory..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="select-plain" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th><th>SKU</th><th>Category</th><th>Purity</th><th>Weight</th><th>Pcs</th><th>Status</th><th>Location</th><th>Value</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const s = itemStatus(item.stock);
                  return (
                    <tr key={item.id}>
                      <td>
                        <Link className="cell-link" href={`/inventory/item-details?id=${item.id}`}>
                          <ItemImage item={item} className="product-img cell-img" /> {item.name}
                        </Link>
                      </td>
                      <td>{item.sku}</td>
                      <td>{item.category}</td>
                      <td>{item.karat}</td>
                      <td>{item.weight.toFixed(3)} g</td>
                      <td>{item.stock}</td>
                      <td><span className={`status-pill ${s === "In Stock" ? "success" : s === "Low Stock" ? "warning" : "danger"}`}>{s}</span></td>
                      <td>{item.branch}</td>
                      <td>{item.stock ? formatINR(itemPrice(item, rates)) : "—"}</td>
                    </tr>
                  );
                })}
                {visible.length === 0 ? (
                  <tr><td colSpan={9} className="empty-note">No items match your filters.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
