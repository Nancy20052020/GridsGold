"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Minus, Plus, ScanBarcode, Search, Trash2, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, itemPrice, itemStatus, formatINR } from "../lib/store";

const categories = ["All", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants", "Chains"];

export default function PosPage() {
  const { items, rates, cart, addToCart, addToCartBySku, setQty, removeFromCart, clearCart, checkout, customers } = useStore();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [receipt, setReceipt] = useState<{ number: string; total: number } | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const [scanMsg, setScanMsg] = useState("");

  function doScan() {
    const ok = addToCartBySku(scanValue);
    if (ok) {
      setScanMsg(`Added ${scanValue.toUpperCase()} to sale.`);
      setScanValue("");
    } else {
      setScanMsg("No in-stock item with that SKU/barcode.");
    }
  }

  const visible = useMemo(
    () =>
      items.filter((item) => {
        const inCat = category === "All" || item.category === category;
        const inQuery =
          !query ||
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.sku.toLowerCase().includes(query.toLowerCase());
        return inCat && inQuery;
      }),
    [items, category, query],
  );

  const lines = cart
    .map((line) => {
      const item = items.find((i) => i.id === line.itemId);
      return item ? { item, qty: line.qty, amount: itemPrice(item, rates) * line.qty } : null;
    })
    .filter((line): line is { item: (typeof items)[number]; qty: number; amount: number } => line !== null);

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const gst = Math.round(subtotal * 0.03);
  const total = subtotal + gst;

  return (
    <AppShell searchPlaceholder="Search item, SKU or scan barcode...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <div>
              <span className="eyebrow">Sales Counter</span>
              <h1>Point of Sale</h1>
              <p>Add items, apply the live gold rate, and collect payment.</p>
            </div>
          </div>
        </div>

        <div className="pos-layout">
          <article className="erp-panel">
            <div className="table-toolbar">
              <div className="filter-search">
                <Search size={18} />
                <input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <button type="button" onClick={() => { setScanOpen(true); setScanMsg(""); }}><ScanBarcode size={17} /> Scan</button>
            </div>
            <div className="category-tabs compact-tabs">
              {categories.map((tab) => (
                <button className={tab === category ? "active" : ""} key={tab} type="button" onClick={() => setCategory(tab)}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="product-grid">
              {visible.map((item) => {
                const status = itemStatus(item.stock);
                const disabled = status === "Out of Stock";
                return (
                  <button
                    className="product-tile"
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => addToCart(item.id)}
                  >
                    <span className={`jewel-icon ${item.icon}`} />
                    <strong>{item.name}</strong>
                    <small>{item.karat} · {item.weight} g</small>
                    <em>{formatINR(itemPrice(item, rates))}</em>
                    <span className={`status-pill ${status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "danger"}`}>
                      {status}
                    </span>
                  </button>
                );
              })}
              {visible.length === 0 ? <p className="empty-note">No products match your search.</p> : null}
            </div>
          </article>

          <article className="erp-panel invoice-card">
            <div className="panel-title-row">
              <h2>Current Sale</h2>
              {cart.length ? (
                <button type="button" className="link-plain" onClick={clearCart}>Clear</button>
              ) : null}
            </div>

            <label className="field">
              <span>Customer</span>
              <div className="field-input">
                <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
                  <option>Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </label>

            <div className="cart-lines">
              {lines.length === 0 ? (
                <p className="empty-note">Cart is empty. Tap a product to add it.</p>
              ) : (
                lines.map(({ item, qty, amount }) => (
                  <div className="cart-line" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{formatINR(itemPrice(item, rates))} each</small>
                    </div>
                    <div className="qty-control">
                      <button type="button" onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => setQty(item.id, qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <span className="cart-amount">{formatINR(amount)}</span>
                    <button type="button" className="cart-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove"><Trash2 size={15} /></button>
                  </div>
                ))
              )}
            </div>

            <div className="totals">
              <div><span>Sub Total</span><strong>{formatINR(subtotal)}</strong></div>
              <div><span>GST (3%)</span><strong>{formatINR(gst)}</strong></div>
              <div className="grand"><span>Total</span><strong>{formatINR(total)}</strong></div>
            </div>

            <button
              className="gold-action full"
              type="button"
              disabled={lines.length === 0}
              onClick={() => {
                const inv = checkout(customer);
                setReceipt({ number: inv.number, total: inv.total });
              }}
            >
              Checkout &amp; Collect Payment
            </button>
          </article>
        </div>
      </section>

      {scanOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={(e) => { e.preventDefault(); doScan(); }}>
            <button className="modal-close" type="button" onClick={() => setScanOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Scan / Enter Barcode</h2>
            <p className="muted">Type or scan an item SKU / barcode and press Enter to add it to the sale.</p>
            <label className="field">
              <span>SKU / Barcode</span>
              <div className="field-input">
                <ScanBarcode size={17} />
                <input autoFocus value={scanValue} onChange={(e) => setScanValue(e.target.value)} placeholder="e.g. RG22K-00124" />
              </div>
            </label>
            <p className="muted" style={{ fontSize: 12 }}>Try: {items.slice(0, 4).map((i) => i.sku).join(", ")}</p>
            {scanMsg ? <p className={scanMsg.startsWith("Added") ? "banner-success" : "auth-error"}>{scanMsg}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setScanOpen(false)}>Done</button>
              <button className="gold-action" type="submit">Add to Sale</button>
            </div>
          </form>
        </div>
      ) : null}

      {receipt ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button className="modal-close" type="button" onClick={() => setReceipt(null)} aria-label="Close"><X size={18} /></button>
            <span className="modal-icon"><CheckCircle2 size={30} /></span>
            <h2>Payment Successful</h2>
            <p>Invoice <strong>{receipt.number}</strong> created.</p>
            <div className="modal-total">{formatINR(receipt.total)}</div>
            <Link className="ghost-action" href="/sales/invoices" style={{ width: "100%", justifyContent: "center" }}>View Receipt</Link>
            <button className="gold-action full" type="button" onClick={() => setReceipt(null)}>New Sale</button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
