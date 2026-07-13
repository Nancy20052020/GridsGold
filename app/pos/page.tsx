"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Gift,
  History,
  Keyboard,
  Minus,
  Percent,
  Plus,
  RotateCcw,
  ScanBarcode,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { SHOP_CATEGORIES } from "../lib/categories";
import {
  firstName,
  formatINR,
  itemPrice,
  itemStatus,
  useStore,
  type Item,
  type Karat,
} from "../lib/store";

type PaymentLine = { id: string; method: string; amount: number };
type HeldBill = {
  id: string;
  label: string;
  customer: string;
  cart: { itemId: string; qty: number }[];
  discountPct: number;
  savedAt: string;
};

const POS_PAYMENTS = ["Cash", "UPI", "Card", "EMI", "Split"] as const;
const PURITY_FILTERS: Array<"All" | Karat> = ["All", "24K", "22K", "18K", "925", "PT950"];
const PROMO_BANNERS = [
  "Akshaya Tritiya — extra 5% making charge off on sets",
  "UPI payments earn 2× loyalty points today",
  "Exchange old gold & stack on new purchases",
];

function money(n: number) {
  return formatINR(Math.max(0, Math.round(n)));
}

export default function PosPage() {
  const {
    items,
    rates,
    cart,
    addToCart,
    addToCartBySku,
    setQty,
    removeFromCart,
    clearCart,
    checkout,
    customers,
    invoices,
    selectedBranch,
    currentUser,
  } = useStore();

  const searchRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [category, setCategory] = useState<(typeof SHOP_CATEGORIES)[number]>("All");
  const [purity, setPurity] = useState<(typeof PURITY_FILTERS)[number]>("All");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [loyaltyRedeem, setLoyaltyRedeem] = useState(0);
  const [payments, setPayments] = useState<PaymentLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>(POS_PAYMENTS[0]);
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [receipt, setReceipt] = useState<{ number: string; total: number } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [toast, setToast] = useState("");

  const selectedCustomer = useMemo(() => {
    const byName = customers.find((c) => c.name === customerName);
    if (byName) return byName;
    const phone = customerPhone.trim();
    if (!phone) return null;
    return customers.find((c) => c.mobile.includes(phone) || (c.whatsapp ?? "").includes(phone)) ?? null;
  }, [customers, customerName, customerPhone]);

  const customerHistory = useMemo(() => {
    const name = selectedCustomer?.name ?? customerName;
    if (!name || name === "Walk-in Customer") return [];
    return invoices.filter((inv) => inv.customer === name).slice(0, 4);
  }, [invoices, selectedCustomer, customerName]);

  const catalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (purity !== "All" && item.karat !== purity) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.karat.toLowerCase().includes(q)
      );
    });
  }, [items, query, category, purity]);

  const lines = cart
    .map((line) => {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) return null;
      const unit = itemPrice(item, rates);
      return {
        item,
        qty: line.qty,
        unit,
        metal: Math.round(item.weight * (rates[item.karat] ?? 0)),
        making: item.making,
        stone: item.stoneValue,
        amount: unit * line.qty,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const makingTotal = lines.reduce((sum, l) => sum + l.making * l.qty, 0);
  const discountAmt = Math.round(subtotal * (discountPct / 100));
  const afterDiscount = Math.max(subtotal - discountAmt, 0);
  const gst = Math.round(afterDiscount * 0.03);
  const loyaltyValue = Math.min(loyaltyRedeem, afterDiscount + gst);
  const total = Math.max(afterDiscount + gst - loyaltyValue, 0);
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(total - paid, 0);
  const earnPoints = Math.floor(total / 100) * (selectedCustomer?.vipFlag || selectedCustomer?.type === "vip" ? 2 : 1);

  const recommendations = (() => {
    const inCart = new Set(cart.map((c) => c.itemId));
    const categoriesInCart = new Set(
      cart
        .map((c) => items.find((i) => i.id === c.itemId)?.category)
        .filter((c): c is string => Boolean(c)),
    );
    return items
      .filter((item) => !inCart.has(item.id) && item.stock > 0)
      .map((item) => {
        let score = 0;
        if (categoriesInCart.has(item.category)) score += 3;
        if (item.stock <= 3) score += 1;
        if (item.stoneValue > 0) score += 1;
        if (cart.some((c) => items.find((i) => i.id === c.itemId)?.karat === item.karat)) score += 1;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score || itemPrice(b.item, rates) - itemPrice(a.item, rates))
      .slice(0, 4)
      .map((s) => s.item);
  })();

  const upsell = (() => {
    if (!cart.length) {
      return items.filter((i) => i.stock > 0).sort((a, b) => b.stoneValue - a.stoneValue).slice(0, 2);
    }
    const maxUnit = Math.max(
      ...cart.map((c) => {
        const item = items.find((i) => i.id === c.itemId);
        return item ? itemPrice(item, rates) : 0;
      }),
      0,
    );
    return items
      .filter((i) => i.stock > 0 && itemPrice(i, rates) > maxUnit && !cart.some((c) => c.itemId === i.id))
      .sort((a, b) => itemPrice(a, rates) - itemPrice(b, rates))
      .slice(0, 2);
  })();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const checkoutRef = useRef<() => void>(() => {});

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "F3") {
        e.preventDefault();
        scanRef.current?.focus();
      }
      if (e.key === "F8") {
        e.preventDefault();
        checkoutRef.current();
      }
      if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function flash(message: string) {
    setToast(message);
  }

  function doScan() {
    if (!scanValue.trim()) return;
    const ok = addToCartBySku(scanValue);
    flash(ok ? `Scanned ${scanValue}` : "SKU not found");
    setScanValue("");
  }

  function addPayment() {
    if (outstanding <= 0 && total <= 0) return;
    const amount = outstanding > 0 ? outstanding : total;
    setPayments((prev) => [...prev, { id: `pay-${Date.now()}`, method: paymentMethod, amount }]);
  }

  function holdBill() {
    if (!cart.length) return;
    const bill: HeldBill = {
      id: `hold-${Date.now()}`,
      label: `Hold ${heldBills.length + 1} · ${customerName}`,
      customer: customerName,
      cart: cart.map((c) => ({ ...c })),
      discountPct,
      savedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setHeldBills((prev) => [bill, ...prev]);
    clearCart();
    setPayments([]);
    setDiscountPct(0);
    setLoyaltyRedeem(0);
    flash("Bill held");
  }

  function resumeBill(bill: HeldBill) {
    clearCart();
    bill.cart.forEach((line) => {
      for (let i = 0; i < line.qty; i += 1) addToCart(line.itemId);
    });
    setCustomerName(bill.customer);
    setDiscountPct(bill.discountPct);
    setHeldBills((prev) => prev.filter((b) => b.id !== bill.id));
    setPayments([]);
    flash("Bill resumed");
  }

  function doCheckout() {
    if (!lines.length) return;
    if (outstanding > 0 && payments.length === 0) {
      setPayments([{ id: `pay-${Date.now()}`, method: paymentMethod, amount: total }]);
    }
    const inv = checkout(customerName);
    setReceipt({ number: inv.number, total: inv.total });
    setPayments([]);
    setDiscountPct(0);
    setLoyaltyRedeem(0);
  }

  useEffect(() => {
    checkoutRef.current = doCheckout;
  });

  function pickCustomer(name: string) {
    setCustomerName(name);
    const match = customers.find((c) => c.name === name);
    if (match) setCustomerPhone(match.mobile);
  }

  return (
    <AppShell searchPlaceholder="Search POS item, customer or SKU...">
      <section className="page-content pos-v2">
        <div className="pos-v2-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/moment_image.png" alt="" className="pos-v2-bg-img" />
          <div className="pos-v2-bg-veil" />
          <div className="pos-v2-sparkle pos-v2-sparkle-a" />
          <div className="pos-v2-sparkle pos-v2-sparkle-b" />
          <div className="pos-v2-sparkle pos-v2-sparkle-c" />
        </div>

        <div className="pos-v2-promo" role="status">
          <Gift size={16} />
          <span key={promoIndex} className="pos-v2-promo-text">{PROMO_BANNERS[promoIndex]}</span>
          <button type="button" className="pos-v2-chip" onClick={() => setShowShortcuts(true)}>
            <Keyboard size={14} /> Shortcuts
          </button>
        </div>

        <header className="pos-v2-top">
          <div>
            <span className="pos-v2-eyebrow"><Sparkles size={14} /> Live counter · {selectedBranch}</span>
            <h1>Point of Sale</h1>
            <p>Hi {firstName(currentUser) || "Cashier"} — scan, sell and checkout with gold rates live.</p>
          </div>
          <div className="pos-v2-rates">
            {(["22K", "18K", "24K"] as Karat[]).map((k) => (
              <div key={k}>
                <span>{k}</span>
                <strong>₹ {rates[k].toLocaleString("en-IN")}</strong>
              </div>
            ))}
            <Link href="/gold-rates" className="pos-v2-link">Rates <TrendingUp size={14} /></Link>
          </div>
        </header>

        <div className="pos-v2-grid">
          <div className="pos-v2-main">
            <section className="pos-glass pos-v2-tools">
              <div className="pos-v2-search">
                <Search size={18} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Smart search — name, SKU, category (F2)"
                  aria-label="Search products"
                />
                {query ? (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>
                ) : null}
              </div>
              <div className="pos-v2-scan">
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
                  placeholder="Barcode / RFID scan (F3)"
                  aria-label="Scan barcode"
                />
                <button type="button" className="pos-v2-btn gold" onClick={doScan}>Add</button>
              </div>
            </section>

            <section className="pos-glass pos-v2-filters">
              <div className="pos-v2-chips">
                {SHOP_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={category === cat ? "active" : ""}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="pos-v2-chips compact">
                {PURITY_FILTERS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={purity === k ? "active" : ""}
                    onClick={() => setPurity(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </section>

            <section className="pos-glass pos-v2-catalog">
              <div className="pos-v2-section-head">
                <h2>Visual catalog</h2>
                <span>{catalog.length} items in stock view</span>
              </div>
              <div className="pos-v2-catalog-grid">
                {catalog.map((item) => (
                  <CatalogTile
                    key={item.id}
                    item={item}
                    price={itemPrice(item, rates)}
                    onAdd={() => {
                      if (item.stock <= 0) {
                        flash("Out of stock");
                        return;
                      }
                      addToCart(item.id);
                      flash(`Added ${item.name}`);
                    }}
                  />
                ))}
                {catalog.length === 0 ? (
                  <div className="pos-v2-empty">
                    <ShoppingBag size={36} />
                    <strong>No pieces match</strong>
                    <p>Try another category, purity or search term.</p>
                  </div>
                ) : null}
              </div>
            </section>

            {(recommendations.length > 0 || upsell.length > 0) ? (
              <section className="pos-glass pos-v2-ai">
                <div className="pos-v2-section-head">
                  <h2><Sparkles size={16} /> AI picks & upsell</h2>
                  <span>Cross-sell from cart & purity</span>
                </div>
                <div className="pos-v2-ai-grid">
                  {recommendations.map((item) => (
                    <button key={item.id} type="button" className="pos-v2-ai-card" onClick={() => addToCart(item.id)}>
                      <ItemImage item={item} className="product-img tile-img" />
                      <div>
                        <em>Recommend</em>
                        <strong>{item.name}</strong>
                        <small>{item.karat} · {money(itemPrice(item, rates))}</small>
                      </div>
                      <Plus size={16} />
                    </button>
                  ))}
                  {upsell.map((item) => (
                    <button key={`up-${item.id}`} type="button" className="pos-v2-ai-card upsell" onClick={() => addToCart(item.id)}>
                      <ItemImage item={item} className="product-img tile-img" />
                      <div>
                        <em>Upsell</em>
                        <strong>{item.name}</strong>
                        <small>Premium · {money(itemPrice(item, rates))}</small>
                      </div>
                      <Plus size={16} />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="pos-v2-side">
            <section className="pos-glass pos-v2-customer">
              <div className="pos-v2-section-head">
                <h2><UserRound size={16} /> Customer</h2>
                <Link href="/customers" className="pos-v2-link">+ New</Link>
              </div>
              <label className="pos-v2-field">
                <span>Quick lookup</span>
                <select value={customerName} onChange={(e) => pickCustomer(e.target.value)}>
                  <option>Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} · {c.type}</option>
                  ))}
                </select>
              </label>
              <label className="pos-v2-field">
                <span>Phone / WhatsApp</span>
                <input
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    const match = customers.find((c) => c.mobile.includes(e.target.value) || (c.whatsapp ?? "").includes(e.target.value));
                    if (match) setCustomerName(match.name);
                  }}
                  placeholder="+91 …"
                />
              </label>
              {selectedCustomer ? (
                <div className="pos-v2-customer-card">
                  <strong>{selectedCustomer.name}</strong>
                  <small>{selectedCustomer.city} · {selectedCustomer.type}{selectedCustomer.vipFlag ? " · VIP" : ""}</small>
                  <span>{earnPoints} pts will be earned</span>
                </div>
              ) : null}
              {customerHistory.length ? (
                <div className="pos-v2-history">
                  <div className="pos-v2-history-head"><History size={14} /> Purchase history</div>
                  {customerHistory.map((inv) => (
                    <div key={inv.id} className="pos-v2-history-row">
                      <span>{inv.number.slice(-8)}</span>
                      <strong>{money(inv.total)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="pos-glass pos-v2-cart">
              <div className="pos-v2-section-head">
                <h2><ShoppingBag size={16} /> Cart</h2>
                <span>{lines.length} lines</span>
              </div>

              {lines.length === 0 ? (
                <div className="pos-v2-empty compact">
                  <ShoppingBag size={28} />
                  <strong>Cart is empty</strong>
                  <p>Tap a piece or scan a barcode.</p>
                </div>
              ) : (
                <div className="pos-v2-cart-lines">
                  {lines.map(({ item, qty, amount, making, metal, stone, unit }) => (
                    <div className="pos-v2-cart-line" key={item.id}>
                      <ItemImage item={item} className="product-img cart-thumb" />
                      <div className="pos-v2-cart-copy">
                        <strong>{item.name}</strong>
                        <small>{item.sku}</small>
                        <small className="breakup">
                          Metal {money(metal)} · Making {money(making)}
                          {stone ? ` · Stone ${money(stone)}` : ""} · {money(unit)}/pc
                        </small>
                      </div>
                      <div className="pos-v2-qty">
                        <button type="button" onClick={() => setQty(item.id, qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => setQty(item.id, qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                      </div>
                      <div className="pos-v2-cart-amt">
                        <strong>{money(amount)}</strong>
                        <button type="button" onClick={() => removeFromCart(item.id)} aria-label="Remove"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pos-v2-adjust">
                <label>
                  <Percent size={14} /> Discount %
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Math.min(40, Math.max(0, Number(e.target.value) || 0)))}
                  />
                </label>
                <label>
                  <Tag size={14} /> Loyalty redeem ₹
                  <input
                    type="number"
                    min={0}
                    value={loyaltyRedeem}
                    onChange={(e) => setLoyaltyRedeem(Math.max(0, Number(e.target.value) || 0))}
                  />
                </label>
              </div>

              <div className="pos-v2-totals">
                <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                <div><span>Making in bill</span><strong>{money(makingTotal)}</strong></div>
                <div><span>Discount ({discountPct}%)</span><strong>-{money(discountAmt)}</strong></div>
                <div><span>GST 3%</span><strong>{money(gst)}</strong></div>
                <div><span>Loyalty</span><strong>-{money(loyaltyValue)}</strong></div>
                <div className="grand"><span>Total</span><strong>{money(total)}</strong></div>
              </div>
            </section>

            <section className="pos-glass pos-v2-pay">
              <div className="pos-v2-section-head">
                <h2><WalletCards size={16} /> Payments</h2>
                <button type="button" className="pos-v2-link" onClick={addPayment} disabled={total <= 0}>+ Split</button>
              </div>
              <div className="pos-v2-pay-methods">
                {POS_PAYMENTS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={paymentMethod === method ? "active" : ""}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === "Cash" ? <Banknote size={15} /> : null}
                    {method === "Card" || method === "EMI" ? <CreditCard size={15} /> : null}
                    {method}
                  </button>
                ))}
              </div>
              <div className="pos-v2-pay-summary">
                <div><span>Paid</span><strong>{money(paid)}</strong></div>
                <div><span>Due</span><strong className={outstanding === 0 && total > 0 ? "ok" : ""}>{money(outstanding)}</strong></div>
              </div>
              {payments.length ? (
                <div className="pos-v2-pay-list">
                  {payments.map((p) => (
                    <div key={p.id}>
                      <span>{p.method}</span>
                      <strong>{money(p.amount)}</strong>
                      <button type="button" onClick={() => setPayments((prev) => prev.filter((x) => x.id !== p.id))} aria-label="Remove payment"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              ) : null}

              <button className="pos-v2-btn gold full" type="button" disabled={!lines.length} onClick={doCheckout}>
                Checkout · Collect (F8)
              </button>
              <div className="pos-v2-actions">
                <button type="button" className="pos-v2-btn ghost" disabled={!cart.length} onClick={holdBill}>Hold bill</button>
                <button type="button" className="pos-v2-btn ghost" disabled={!cart.length} onClick={() => { clearCart(); setPayments([]); flash("Sale cleared"); }}>Clear</button>
                <button type="button" className="pos-v2-btn ghost" onClick={() => setShowReturns(true)}><RotateCcw size={14} /> Returns</button>
              </div>

              {heldBills.length ? (
                <div className="pos-v2-held">
                  <div className="pos-v2-history-head">Held bills</div>
                  {heldBills.map((bill) => (
                    <button key={bill.id} type="button" className="pos-v2-held-row" onClick={() => resumeBill(bill)}>
                      <span>{bill.label}</span>
                      <small>{bill.savedAt} · resume</small>
                    </button>
                  ))}
                </div>
              ) : null}
            </section>
          </aside>
        </div>

        {toast ? <div className="pos-v2-toast" role="status">{toast}</div> : null}
      </section>

      {receipt ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card pos-v2-receipt">
            <button className="modal-close" type="button" onClick={() => setReceipt(null)} aria-label="Close"><X size={18} /></button>
            <span className="modal-icon"><CheckCircle2 size={30} /></span>
            <h2>Payment successful</h2>
            <p>Invoice <strong>{receipt.number}</strong> is ready. Loyalty +{earnPoints} pts.</p>
            <div className="modal-total">{money(receipt.total)}</div>
            <Link className="ghost-action" href="/sales/invoices" style={{ width: "100%", justifyContent: "center" }}>View / print receipt</Link>
            <button className="gold-action full" type="button" onClick={() => setReceipt(null)}>New sale</button>
          </div>
        </div>
      ) : null}

      {showShortcuts ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowShortcuts(false)}>
          <div className="modal-card pos-v2-shortcuts" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setShowShortcuts(false)} aria-label="Close"><X size={18} /></button>
            <h2>Keyboard shortcuts</h2>
            <ul>
              <li><kbd>F2</kbd> Focus smart search</li>
              <li><kbd>F3</kbd> Focus barcode / RFID</li>
              <li><kbd>F8</kbd> Checkout & collect</li>
              <li><kbd>Enter</kbd> Confirm scan</li>
            </ul>
          </div>
        </div>
      ) : null}

      {showReturns ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button className="modal-close" type="button" onClick={() => setShowReturns(false)} aria-label="Close"><X size={18} /></button>
            <h2>Returns & exchanges</h2>
            <p>Look up an invoice to start a return or exchange. Hallmark-linked pieces reverse stock and adjust loyalty automatically.</p>
            <label className="pos-v2-field">
              <span>Invoice number</span>
              <input placeholder="INV-SA-JED-…" />
            </label>
            <button type="button" className="gold-action full" onClick={() => { setShowReturns(false); flash("Return ticket drafted"); }}>
              Start return
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function CatalogTile({
  item,
  price,
  onAdd,
}: {
  item: Item;
  price: number;
  onAdd: () => void;
}) {
  const status = itemStatus(item.stock);
  return (
    <button type="button" className={`pos-v2-tile ${status === "Out of Stock" ? "soldout" : ""}`} onClick={onAdd}>
      <div className="pos-v2-tile-media">
        <ItemImage item={item} className="product-img tile-img" />
        <em className={`pos-v2-stock ${status === "In Stock" ? "ok" : status === "Low Stock" ? "low" : "out"}`}>
          {status === "Out of Stock" ? "Out" : `${item.stock} left`}
        </em>
      </div>
      <strong>{item.name}</strong>
      <small>{item.category} · {item.karat} · {item.weight}g</small>
      <span className="pos-v2-tile-price">{money(price)}</span>
    </button>
  );
}
