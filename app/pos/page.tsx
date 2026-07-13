"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { AddSaleItemModal } from "../components/AddSaleItemModal";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { useStore, itemPrice, formatINR } from "../lib/store";

type PaymentLine = { id: string; method: string; amount: number };

export default function PosPage() {
  const { items, rates, cart, addToCart, addToCartBySku, setQty, removeFromCart, clearCart, checkout, customers } = useStore();
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [receipt, setReceipt] = useState<{ number: string; total: number } | null>(null);
  const [scanValue, setScanValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentLine[]>([]);

  const lines = cart
    .map((line) => {
      const item = items.find((i) => i.id === line.itemId);
      return item ? { item, qty: line.qty, amount: itemPrice(item, rates) * line.qty } : null;
    })
    .filter((line): line is { item: (typeof items)[number]; qty: number; amount: number } => line !== null);

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const gst = Math.round(subtotal * 0.03);
  const total = subtotal + gst;
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(total - paid, 0);

  const filteredBrowse = useMemo(
    () =>
      items.filter((item) => {
        if (!query) return false;
        return (
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.sku.toLowerCase().includes(query.toLowerCase())
        );
      }).slice(0, 6),
    [items, query],
  );

  function doScan() {
    if (!scanValue.trim()) return;
    addToCartBySku(scanValue);
    setScanValue("");
  }

  function addPayment() {
    const amount = outstanding > 0 ? outstanding : total;
    if (amount <= 0) return;
    setPayments((prev) => [
      ...prev,
      { id: `pay-${Date.now()}`, method: "Cash", amount },
    ]);
  }

  return (
    <AppShell searchPlaceholder="Search item, SKU or scan barcode...">
      <section className="page-content sales-workspace-page">
        <div className="sales-workspace-head">
          <div>
            <span className="eyebrow">Sales</span>
            <h1>Sales counter</h1>
          </div>
          <div className="sales-workspace-toolbar">
            <button type="button" className="gold-action" onClick={() => setAddOpen(true)}>+ Add item</button>
            <Link className="export-button subtle" href="/sales/invoices">Invoices</Link>
          </div>
        </div>

        <div className="sales-workspace">
          <article className="sales-main erp-panel">
            {lines.length === 0 ? (
              <div className="sales-empty">
                <ShoppingCart size={42} />
                <strong>No items added yet</strong>
                <p>Search for a product or scan a barcode to start a sale.</p>
                <button type="button" className="gold-action" onClick={() => setAddOpen(true)}>+ Add item</button>
              </div>
            ) : (
              <div className="cart-lines sales-cart-lines">
                {lines.map(({ item, qty, amount }) => (
                  <div className="cart-line" key={item.id}>
                    <ItemImage item={item} className="product-img cart-thumb" />
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.sku} · {formatINR(itemPrice(item, rates))} each</small>
                    </div>
                    <div className="qty-control">
                      <button type="button" onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span>{qty}</span>
                      <button type="button" onClick={() => setQty(item.id, qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <span className="cart-amount">{formatINR(amount)}</span>
                    <button type="button" className="cart-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="sales-scan-row">
              <div className="field-input sales-scan-input">
                <ScanBarcode size={18} />
                <input
                  placeholder="Scan or type barcode"
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doScan(); } }}
                />
              </div>
              <button type="button" className="ghost-action" onClick={doScan}>Add</button>
            </div>

            {query ? (
              <div className="sales-quick-picks">
                {filteredBrowse.map((item) => (
                  <button key={item.id} type="button" className="sale-item-pick compact" onClick={() => addToCart(item.id)}>
                    <strong>{item.name}</strong>
                    <em>{formatINR(itemPrice(item, rates))}</em>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="sales-main-search">
              <Search size={16} />
              <input placeholder="Quick search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </article>

          <aside className="sales-sidepanel">
            <section className="sales-side-block">
              <div className="sales-side-block-head">
                <h3>Customer</h3>
                <Link href="/customers" className="link-plain">+ Add new</Link>
              </div>
              <label className="field">
                <span>Select a customer</span>
                <div className="field-input">
                  <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
                    <option>Walk-in Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="field">
                <span>Search by phone number</span>
                <div className="field-input">
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone" />
                </div>
              </label>
            </section>

            <section className="sales-side-block">
              <div className="sales-side-block-head">
                <h3>Transactions</h3>
                <button type="button" className="link-plain" onClick={addPayment} disabled={total <= 0}>+ Add transaction</button>
              </div>
              <div className="sales-txn-summary">
                <div><span>Total amount</span><strong>{formatINR(total)}</strong></div>
                <div><span>Outstanding</span><strong className={outstanding === 0 && total > 0 ? "ok" : ""}>{formatINR(outstanding)} {outstanding === 0 && total > 0 ? "✓" : ""}</strong></div>
              </div>
              <div className="sales-txn-list">
                {payments.length === 0 ? (
                  <p className="muted">No payments recorded yet.</p>
                ) : (
                  payments.map((p) => (
                    <div className="sales-txn-row" key={p.id}>
                      <span>{p.method}</span>
                      <strong>{formatINR(p.amount)}</strong>
                    </div>
                  ))
                )}
              </div>
              <div className="totals compact-totals">
                <div><span>Subtotal</span><strong>{formatINR(subtotal)}</strong></div>
                <div><span>GST (3%)</span><strong>{formatINR(gst)}</strong></div>
              </div>
              <button
                className="gold-action full"
                type="button"
                disabled={lines.length === 0}
                onClick={() => {
                  const inv = checkout(customer);
                  setReceipt({ number: inv.number, total: inv.total });
                  setPayments([]);
                }}
              >
                Checkout &amp; Collect Payment
              </button>
              {cart.length ? (
                <button type="button" className="ghost-action full" onClick={clearCart}>Clear sale</button>
              ) : null}
            </section>
          </aside>
        </div>
      </section>

      <AddSaleItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(itemId, qty) => {
          for (let i = 0; i < qty; i += 1) addToCart(itemId);
        }}
      />

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
