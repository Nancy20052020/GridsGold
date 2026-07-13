"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Download,
  PackageMinus,
  PackagePlus,
  ScanBarcode,
  Search,
  Sparkles,
  Trash2,
  Truck,
  Upload,
  Warehouse,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { INVENTORY_CATEGORIES, SHOP_CATEGORIES, isRemovedCategory } from "../lib/categories";
import { downloadCsv } from "../lib/export";
import { srsLabel, srsPillTone, stockToItemStatus } from "../lib/srs";
import {
  BRANCHES,
  formatINR,
  itemPrice,
  itemStatus,
  useStore,
  type Item,
  type Karat,
} from "../lib/store";

type ViewMode = "cards" | "table";
type StatusFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";

const PURITIES: Array<"All" | Karat> = ["All", "24K", "22K", "18K", "925", "PT950"];
const COLLECTIONS = ["All", "Bridal", "Daily wear", "Temple", "Diamond", "Light weight"] as const;

function netWeight(item: Item) {
  return Math.max(item.weight - (item.stoneValue > 0 ? 0.12 : 0), 0.01);
}

function collectionFor(item: Item) {
  if (item.stoneValue > 20000) return "Diamond";
  if (item.weight >= 20) return "Bridal";
  if (item.weight <= 6) return "Light weight";
  if (item.category === "Necklaces" || item.category === "Bangles") return "Temple";
  return "Daily wear";
}

function serialFor(item: Item) {
  return `SN-${item.sku.replace(/[^A-Z0-9]/gi, "").slice(-8).toUpperCase()}`;
}

function batchFor(item: Item) {
  return `BAT-${item.branch.replace(/\s+/g, "").slice(0, 4).toUpperCase()}-${item.id.toUpperCase()}`;
}

export default function InventoryPage() {
  const { items, rates, movements, suppliers, selectedBranch, removeItem } = useStore();
  const scanRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [category, setCategory] = useState("All");
  const [purity, setPurity] = useState<(typeof PURITIES)[number]>("All");
  const [collection, setCollection] = useState<(typeof COLLECTIONS)[number]>("All");
  const [branch, setBranch] = useState("All");
  const [supplier, setSupplier] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [toast, setToast] = useState("");

  const catalog = useMemo(
    () => items.filter((item) => !isRemovedCategory(item.category)),
    [items],
  );

  const totalValue = catalog.reduce((sum, i) => sum + itemPrice(i, rates) * i.stock, 0);
  const lowStock = catalog.filter((i) => itemStatus(i.stock) === "Low Stock");
  const outStock = catalog.filter((i) => itemStatus(i.stock) === "Out of Stock");
  const deadStock = catalog.filter((i) => i.stock > 0 && i.stoneValue === 0 && i.weight >= 10).slice(0, 8);
  const goldGrams = catalog.reduce((sum, i) => sum + (i.karat.includes("K") ? i.weight * i.stock : 0), 0);
  const silverGrams = catalog.reduce((sum, i) => sum + (i.karat === "925" ? i.weight * i.stock : 0), 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minW = minWeight ? Number(minWeight) : null;
    const maxW = maxWeight ? Number(maxWeight) : null;

    return catalog.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (purity !== "All" && item.karat !== purity) return false;
      if (collection !== "All" && collectionFor(item) !== collection) return false;
      if (branch !== "All" && item.branch !== branch) return false;
      if (supplier !== "All") {
        const hash = item.sku.length % Math.max(suppliers.length, 1);
        if (suppliers[hash]?.name !== supplier) return false;
      }
      if (status !== "All" && itemStatus(item.stock) !== status) return false;
      if (minW !== null && !Number.isNaN(minW) && item.weight < minW) return false;
      if (maxW !== null && !Number.isNaN(maxW) && item.weight > maxW) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.branch.toLowerCase().includes(q) ||
        serialFor(item).toLowerCase().includes(q) ||
        batchFor(item).toLowerCase().includes(q)
      );
    });
  }, [catalog, query, category, purity, collection, branch, supplier, status, minWeight, maxWeight, suppliers]);

  const categoryMix = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of catalog) {
      map.set(item.category, (map.get(item.category) ?? 0) + itemPrice(item, rates) * item.stock);
    }
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    const colors: Record<string, string> = {
      Rings: "#f2b33d",
      Necklaces: "#8b7cf6",
      Bangles: "#1d64d8",
      Earrings: "#2aa868",
      Pendants: "#e6a520",
      Others: "#94a3b8",
    };
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / total) * 100),
        color: colors[name] ?? "#94a3b8",
      }));
  }, [catalog, rates]);

  const branchMix = useMemo(() => {
    return BRANCHES.map((b) => {
      const value = catalog
        .filter((i) => i.branch === b)
        .reduce((sum, i) => sum + itemPrice(i, rates) * i.stock, 0);
      return { branch: b, value };
    }).filter((b) => b.value > 0);
  }, [catalog, rates]);

  const maxBranch = Math.max(...branchMix.map((b) => b.value), 1);

  const reorderSuggestions = useMemo(() => {
    return [...lowStock, ...outStock]
      .slice(0, 5)
      .map((item) => ({
        item,
        reason: item.stock <= 0 ? "Out of stock — urgent PO" : `Only ${item.stock} left · forecast demand up`,
        qty: Math.max(4 - item.stock, 2),
      }));
  }, [lowStock, outStock]);

  const recentMoves = movements.slice(0, 6);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function doScan() {
    const code = scanValue.trim().toLowerCase();
    if (!code) return;
    const match = catalog.find(
      (i) =>
        i.sku.toLowerCase() === code ||
        serialFor(i).toLowerCase() === code ||
        i.name.toLowerCase().includes(code),
    );
    if (match) {
      setQuery(match.sku);
      setCategory("All");
      setStatus("All");
      flash(`Found ${match.name}`);
    } else {
      flash("No match for scan");
    }
    setScanValue("");
  }

  function exportInventory() {
    downloadCsv(
      "inventory-export",
      ["SKU", "Name", "Category", "Karat", "Gross g", "Net g", "Stock", "Branch", "Value", "Serial", "Batch"],
      filtered.map((item) => [
        item.sku,
        item.name,
        item.category,
        item.karat,
        item.weight.toFixed(3),
        netWeight(item).toFixed(3),
        String(item.stock),
        item.branch,
        String(itemPrice(item, rates) * item.stock),
        serialFor(item),
        batchFor(item),
      ]),
    );
    flash("Inventory CSV exported");
  }

  function confirmRemove(item: Item) {
    if (!window.confirm(`Remove “${item.name}” from inventory? This cannot be undone.`)) return;
    removeItem(item.id);
    flash(`Removed ${item.name}`);
  }

  const kpis = [
    { label: "Stock value", value: formatINR(totalValue), note: `${catalog.length} SKUs`, tone: "gold", icon: Boxes },
    { label: "Live 22K", value: `₹ ${rates["22K"].toLocaleString("en-IN")}`, note: "Gold / gram", tone: "champagne", icon: Sparkles },
    { label: "Live 925", value: `₹ ${rates["925"].toLocaleString("en-IN")}`, note: "Silver / gram", tone: "lavender", icon: Sparkles },
    { label: "Low stock", value: String(lowStock.length), note: "Reorder soon", tone: "warn", icon: AlertTriangle },
    { label: "Out of stock", value: String(outStock.length), note: "Urgent", tone: "danger", icon: PackageMinus },
    { label: "Dead stock", value: String(deadStock.length), note: "Review aging", tone: "violet", icon: Warehouse },
  ];

  return (
    <AppShell searchPlaceholder="Search inventory SKU, serial or branch...">
      <section className="page-content inv-v2">
        <header className="inv-v2-head">
          <div>
            <span className="inv-v2-eyebrow"><Boxes size={14} /> Inventory · {selectedBranch}</span>
            <h1>Inventory Management</h1>
            <p>
              Real-time stock for jewellery — {goldGrams.toFixed(0)}g gold · {silverGrams.toFixed(0)}g silver across branches.
            </p>
          </div>
          <div className="inv-v2-head-actions">
            <Link className="inv-v2-btn gold" href="/inventory/new"><PackagePlus size={16} /> Add item</Link>
            <Link className="inv-v2-btn ghost" href="/inventory/transfers"><ArrowLeftRight size={16} /> Transfer</Link>
            <Link className="inv-v2-btn ghost" href="/inventory/adjustments"><ClipboardList size={16} /> Adjust</Link>
            <button type="button" className="inv-v2-btn ghost" onClick={exportInventory}><Download size={16} /> Export</button>
          </div>
        </header>

        <section className="inv-v2-kpis" aria-label="Inventory KPIs">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className={`inv-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
                <div className="inv-v2-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        {(lowStock.length > 0 || outStock.length > 0) ? (
          <div className="inv-v2-alerts" role="status">
            {outStock.length ? (
              <span className="inv-v2-alert danger">
                <PackageMinus size={15} /> {outStock.length} out of stock — create purchase orders
              </span>
            ) : null}
            {lowStock.length ? (
              <span className="inv-v2-alert warn">
                <AlertTriangle size={15} /> {lowStock.length} low-stock SKUs need restock
              </span>
            ) : null}
            {deadStock.length ? (
              <span className="inv-v2-alert info">
                <Warehouse size={15} /> {deadStock.length} heavy pieces flagged as slow movers
              </span>
            ) : null}
          </div>
        ) : null}

        <section className="inv-glass inv-v2-tools">
          <div className="inv-v2-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Fast search — name, SKU, serial, batch, branch…"
              aria-label="Search inventory"
            />
          </div>
          <div className="inv-v2-scan">
            <ScanBarcode size={18} />
            <input
              ref={scanRef}
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  doScan();
                }
              }}
              placeholder="Barcode / RFID / QR"
              aria-label="Scan barcode"
            />
            <button type="button" className="inv-v2-btn gold compact" onClick={doScan}>Scan</button>
          </div>
          <div className="inv-v2-view-toggle" role="group" aria-label="View mode">
            <button type="button" className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>Cards</button>
            <button type="button" className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Table</button>
          </div>
        </section>

        <section className="inv-glass inv-v2-filters">
          <label>
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All</option>
              {[...new Set([...SHOP_CATEGORIES.filter((c) => c !== "All"), ...INVENTORY_CATEGORIES])].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Purity</span>
            <select value={purity} onChange={(e) => setPurity(e.target.value as typeof purity)}>
              {PURITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            <span>Collection</span>
            <select value={collection} onChange={(e) => setCollection(e.target.value as typeof collection)}>
              {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span>Branch</span>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="All">All</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label>
            <span>Supplier</span>
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              <option value="All">All</option>
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </label>
          <label>
            <span>Min weight (g)</span>
            <input type="number" min={0} step="0.1" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} />
          </label>
          <label>
            <span>Max weight (g)</span>
            <input type="number" min={0} step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
          </label>
        </section>

        <div className="inv-v2-grid">
          <div className="inv-v2-main">
            <section className="inv-glass inv-v2-catalog">
              <div className="inv-v2-section-head">
                <h2>{view === "cards" ? "Product cards" : "Stock table"}</h2>
                <span>{filtered.length} of {catalog.length} items</span>
              </div>

              {view === "cards" ? (
                <div className="inv-v2-cards">
                  {filtered.map((item) => {
                    const st = itemStatus(item.stock);
                    const value = itemPrice(item, rates);
                    return (
                      <article className={`inv-v2-card status-${st.replace(/\s+/g, "-").toLowerCase()}`} key={item.id}>
                        <Link className="inv-v2-card-link" href={`/inventory/item-details?id=${item.id}`}>
                          <div className="inv-v2-card-media">
                            <ItemImage item={item} className="product-img tile-img" />
                            <em className={`inv-v2-stock ${st === "In Stock" ? "ok" : st === "Low Stock" ? "low" : "out"}`}>
                              {st === "Out of Stock" ? "Out" : `${item.stock} pcs`}
                            </em>
                          </div>
                          <strong>{item.name}</strong>
                          <small>{item.sku} · {collectionFor(item)}</small>
                          <div className="inv-v2-card-meta">
                            <span>{item.karat}</span>
                            <span>{item.weight.toFixed(2)}g</span>
                            <span>{item.branch}</span>
                          </div>
                          <div className="inv-v2-card-foot">
                            <b>{formatINR(value)}</b>
                            <span>{srsLabel(stockToItemStatus(item.stock))}</span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className="inv-v2-card-remove"
                          aria-label={`Remove ${item.name}`}
                          title="Remove from inventory"
                          onClick={() => confirmRemove(item)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </article>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <div className="inv-v2-empty">
                      <Boxes size={36} />
                      <strong>No pieces match</strong>
                      <p>Try clearing filters or scanning another code.</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="inv-v2-table-wrap">
                  <table className="inv-v2-table">
                    <thead>
                      <tr>
                        <th className="col-item">Item</th>
                        <th>SKU</th>
                        <th>Purity</th>
                        <th>Gross</th>
                        <th>Net</th>
                        <th>Stone</th>
                        <th>Cert</th>
                        <th>Serial</th>
                        <th>Batch</th>
                        <th>Location</th>
                        <th className="col-num">Pcs</th>
                        <th>Status</th>
                        <th className="col-num">Value</th>
                        <th className="col-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const srs = stockToItemStatus(item.stock);
                        return (
                          <tr key={item.id}>
                            <td className="col-item">
                              <Link className="inv-v2-row-item" href={`/inventory/item-details?id=${item.id}`}>
                                <span className="inv-v2-row-thumb" aria-hidden>
                                  <ItemImage item={item} className="product-img cell-img" />
                                </span>
                                <span className="inv-v2-row-copy">
                                  <strong>{item.name}</strong>
                                  <small>{item.category} · {collectionFor(item)}</small>
                                </span>
                              </Link>
                            </td>
                            <td><code>{item.sku}</code></td>
                            <td>{item.karat}</td>
                            <td>{item.weight.toFixed(3)} g</td>
                            <td>{netWeight(item).toFixed(3)} g</td>
                            <td>{item.stoneValue ? formatINR(item.stoneValue) : "—"}</td>
                            <td>{item.stoneValue > 0 ? "IGI" : "BIS HUID"}</td>
                            <td><code>{serialFor(item)}</code></td>
                            <td><code>{batchFor(item)}</code></td>
                            <td>{item.branch}</td>
                            <td className="col-num">{item.stock}</td>
                            <td><span className={`status-pill ${srsPillTone(srs)}`}>{srsLabel(srs)}</span></td>
                            <td className="col-num">{item.stock ? formatINR(itemPrice(item, rates) * item.stock) : "—"}</td>
                            <td className="col-actions">
                              <button
                                type="button"
                                className="inv-v2-btn ghost compact danger"
                                onClick={() => confirmRemove(item)}
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 ? (
                        <tr><td colSpan={14} className="empty-note">No items match your filters.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className="inv-v2-side">
            <section className="inv-glass">
              <div className="inv-v2-section-head">
                <h2><BarChart3 size={16} /> Category value</h2>
              </div>
              <div className="inv-v2-bars">
                {categoryMix.map((c) => (
                  <div key={c.name}>
                    <div className="inv-v2-bar-top">
                      <span>{c.name}</span>
                      <strong>{c.percent}%</strong>
                    </div>
                    <div className="inv-v2-bar-track">
                      <span style={{ width: `${c.percent}%`, background: c.color }} />
                    </div>
                    <small>{formatINR(c.value)}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="inv-glass">
              <div className="inv-v2-section-head">
                <h2>Branch inventory</h2>
              </div>
              <div className="inv-v2-bars">
                {branchMix.map((b) => (
                  <div key={b.branch}>
                    <div className="inv-v2-bar-top">
                      <span>{b.branch}</span>
                      <strong>{formatINR(b.value)}</strong>
                    </div>
                    <div className="inv-v2-bar-track">
                      <span style={{ width: `${Math.round((b.value / maxBranch) * 100)}%`, background: "#8b7cf6" }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="inv-glass inv-v2-ai">
              <div className="inv-v2-section-head">
                <h2><Sparkles size={16} /> AI restock</h2>
                <Link href="/purchase-orders">POs</Link>
              </div>
              <div className="inv-v2-ai-list">
                {reorderSuggestions.length === 0 ? (
                  <p className="muted">Stock levels look healthy.</p>
                ) : (
                  reorderSuggestions.map(({ item, reason, qty }) => (
                    <div className="inv-v2-ai-row" key={item.id}>
                      <ItemImage item={item} className="product-img cell-img" />
                      <div>
                        <strong>{item.name}</strong>
                        <small>{reason}</small>
                      </div>
                      <em>+{qty}</em>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="inv-glass">
              <div className="inv-v2-section-head">
                <h2>Movements</h2>
                <Link href="/inventory/movements">All <ArrowRight size={14} /></Link>
              </div>
              <div className="inv-v2-moves">
                {recentMoves.map((m) => (
                  <div key={m.id}>
                    <strong>{m.type}</strong>
                    <span>{m.item}</span>
                    <small>{m.qty > 0 ? `+${m.qty}` : m.qty} · {m.date}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="inv-glass inv-v2-quick">
              <div className="inv-v2-section-head">
                <h2>Quick actions</h2>
              </div>
              <div className="inv-v2-quick-grid">
                <Link href="/inventory/transfers"><ArrowLeftRight size={16} /> Stock transfer</Link>
                <Link href="/inventory/adjustments"><ClipboardList size={16} /> Stock adjustment</Link>
                <Link href="/inventory/cycle-count"><Warehouse size={16} /> Cycle count</Link>
                <Link href="/purchase-orders"><Truck size={16} /> Purchase receipt</Link>
                <Link href="/suppliers"><Boxes size={16} /> Suppliers</Link>
                <button type="button" onClick={() => flash("Bulk import ready — drop a CSV anytime")}>
                  <Upload size={16} /> Bulk import
                </button>
              </div>
            </section>
          </aside>
        </div>

        {toast ? <div className="inv-v2-toast" role="status">{toast}</div> : null}
      </section>
    </AppShell>
  );
}
