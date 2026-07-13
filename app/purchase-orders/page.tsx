"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  MessageCircle,
  PackageCheck,
  Plus,
  ScanBarcode,
  Search,
  Sparkles,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import {
  CURRENCY_CODES,
  CURRENCY_LABELS,
  PO_BOARD_FLOW,
  nextPoStatus,
  srsLabel,
  type CurrencyCode,
  type PoStatus,
} from "../lib/srs";
import {
  BRANCHES,
  formatINR,
  useStore,
  type PurchaseOrder,
} from "../lib/store";

type ViewMode = "board" | "suppliers" | "analytics";

function hashN(key: string, mod: number) {
  return key.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % Math.max(mod, 1);
}

function etaFor(po: PurchaseOrder) {
  if (po.status === "closed" || po.status === "received") return "Arrived";
  if (po.status === "in_transit") return `${2 + hashN(po.id, 4)} days ETA`;
  if (po.status === "ordered") return `${5 + hashN(po.id, 5)} days ETA`;
  return "Pending schedule";
}

function grnFor(po: PurchaseOrder) {
  return `GRN-${po.number.replace(/[^0-9]/g, "").slice(-6)}`;
}

function scoreFor(name: string) {
  return 72 + hashN(name, 28);
}

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    suppliers,
    addSupplier,
    selectedBranch,
    baseCurrency,
    rates,
    items,
  } = useStore();

  const [view, setView] = useState<ViewMode>("board");
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(purchaseOrders[0]?.id ?? null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [supOpen, setSupOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    supplier: "",
    items: "",
    amount: "",
    currency: baseCurrency as CurrencyCode,
    branch: selectedBranch,
  });
  const [supForm, setSupForm] = useState({
    name: "",
    city: "",
    phone: "",
    paymentTerms: "Net 30",
    currency: baseCurrency as CurrencyCode,
  });
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      if (branchFilter !== "All" && (po.branch ?? "") !== branchFilter) return false;
      if (!q) return true;
      return (
        po.number.toLowerCase().includes(q) ||
        po.supplier.toLowerCase().includes(q) ||
        po.items.toLowerCase().includes(q) ||
        (po.branch ?? "").toLowerCase().includes(q)
      );
    });
  }, [purchaseOrders, query, branchFilter]);

  const selected = purchaseOrders.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const openValue = purchaseOrders
    .filter((p) => !["closed", "cancelled"].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const inTransit = purchaseOrders.filter((p) => p.status === "in_transit").length;
  const awaitingApproval = purchaseOrders.filter((p) => p.status === "draft" || p.status === "approved").length;

  const lowStock = items.filter((i) => i.stock <= 2).slice(0, 4);

  const kpis = [
    { label: "Open PO value", value: formatINR(openValue), note: `${purchaseOrders.length} orders`, tone: "gold", icon: ClipboardList },
    { label: "In transit", value: String(inTransit), note: "Track ETA", tone: "lavender", icon: Truck },
    { label: "Approvals", value: String(awaitingApproval), note: "Draft / approval", tone: "warn", icon: FileText },
    { label: "Live 22K", value: `₹ ${rates["22K"].toLocaleString("en-IN")}`, note: "Metal check", tone: "champagne", icon: TrendingUp },
    { label: "Suppliers", value: String(suppliers.length), note: "Scorecards", tone: "violet", icon: Sparkles },
    { label: "GRNs due", value: String(purchaseOrders.filter((p) => p.status === "received" || p.status === "partial").length), note: "Receive desk", tone: "lavender", icon: PackageCheck },
  ];

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function submitPo(event: React.FormEvent) {
    event.preventDefault();
    if (!form.supplier.trim() || !form.items.trim()) {
      setError("Supplier and items are required.");
      return;
    }
    addPurchaseOrder({
      supplier: form.supplier.trim(),
      items: form.items.trim(),
      amount: Number(form.amount) || 0,
      branch: form.branch || selectedBranch,
      currency: form.currency,
    });
    setForm({ supplier: "", items: "", amount: "", currency: baseCurrency, branch: selectedBranch });
    setError("");
    setOpen(false);
    flash("Purchase order drafted");
    setView("board");
  }

  function submitSupplier(event: React.FormEvent) {
    event.preventDefault();
    if (!supForm.name.trim()) return;
    addSupplier({
      name: supForm.name.trim(),
      city: supForm.city.trim(),
      phone: supForm.phone.trim(),
      paymentTerms: supForm.paymentTerms,
      currency: supForm.currency,
    });
    setSupForm({ name: "", city: "", phone: "", paymentTerms: "Net 30", currency: baseCurrency });
    setSupOpen(false);
    flash("Supplier added");
  }

  function moveTo(id: string, status: PoStatus) {
    updatePurchaseOrderStatus(id, status);
    flash(`PO → ${srsLabel(status)}`);
  }

  function onDropColumn(status: PoStatus) {
    if (!dragId) return;
    moveTo(dragId, status);
    setDragId(null);
  }

  const boardColumns = PO_BOARD_FLOW.map((status) => ({
    status,
    items: filtered.filter((po) => po.status === status),
  }));

  const rateCompare = [
    { metal: "22K gold", market: rates["22K"], vendor: Math.round(rates["22K"] * 0.992), save: "0.8%" },
    { metal: "18K gold", market: rates["18K"], vendor: Math.round(rates["18K"] * 1.01), save: "+1%" },
    { metal: "925 silver", market: rates["925"], vendor: Math.round(rates["925"] * 0.97), save: "3%" },
  ];

  return (
    <AppShell searchPlaceholder="Search PO, supplier, GRN…">
      <section className="page-content pur-v2">
        <header className="pur-v2-head">
          <div>
            <span className="pur-v2-eyebrow"><ClipboardList size={14} /> Purchasing · {selectedBranch}</span>
            <h1>Purchase Management</h1>
            <p>Kanban buying workflow — draft to completed with GRN, AI picks and live metal checks.</p>
          </div>
          <div className="pur-v2-head-actions">
            <button type="button" className="pur-v2-btn gold" onClick={() => setOpen(true)}>
              <Plus size={16} /> Quick PO
            </button>
            <button type="button" className="pur-v2-btn ghost" onClick={() => setSupOpen(true)}>
              <Plus size={16} /> Supplier
            </button>
            <button type="button" className="pur-v2-btn ghost" onClick={() => flash("RFID / barcode receiving armed")}>
              <ScanBarcode size={16} /> Receive scan
            </button>
          </div>
        </header>

        <section className="pur-v2-kpis" aria-label="Purchase KPIs">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className={`pur-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
                <div className="pur-v2-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        <div className="pur-v2-alerts" role="status">
          <span className="pur-v2-alert warn"><AlertTriangle size={15} /> {awaitingApproval} orders need approval or release</span>
          <span className="pur-v2-alert info"><Truck size={15} /> {inTransit} shipments in transit — match invoices on arrival</span>
          <span className="pur-v2-alert gold"><Sparkles size={15} /> AI suggests reorder on {lowStock.length || 2} low-stock SKUs</span>
        </div>

        <section className="pur-glass pur-v2-tools">
          <div className="pur-v2-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Smart search — PO #, supplier, items, branch…"
              aria-label="Search purchases"
            />
          </div>
          <div className="pur-v2-filters">
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} aria-label="Branch">
              <option value="All">All branches</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="pur-v2-view-toggle" role="group" aria-label="View">
              <button type="button" className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
              <button type="button" className={view === "suppliers" ? "active" : ""} onClick={() => setView("suppliers")}>Suppliers</button>
              <button type="button" className={view === "analytics" ? "active" : ""} onClick={() => setView("analytics")}>Insights</button>
            </div>
            <button type="button" className="pur-v2-btn ghost compact" onClick={() => setDrawerOpen((v) => !v)}>
              {drawerOpen ? "Hide panel" : "Show panel"}
            </button>
          </div>
        </section>

        {view === "board" ? (
          <div className={`pur-v2-layout ${drawerOpen ? "" : "wide"}`}>
            <div className="pur-v2-board" role="list">
              {boardColumns.map((col) => (
                <section
                  key={col.status}
                  className={`pur-glass pur-v2-col ${dragId ? "droppable" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropColumn(col.status)}
                >
                  <div className="pur-v2-col-head">
                    <h2>{srsLabel(col.status)}</h2>
                    <span>{col.items.length}</span>
                  </div>
                  <div className="pur-v2-col-body">
                    {col.items.map((po) => (
                      <article
                        key={po.id}
                        className={`pur-v2-card ${selected?.id === po.id ? "active" : ""}`}
                        draggable
                        onDragStart={() => setDragId(po.id)}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => { setSelectedId(po.id); setDrawerOpen(true); }}
                        role="listitem"
                      >
                        <div className="pur-v2-card-top">
                          <code>{po.number.slice(-7)}</code>
                          <em>{po.currency ?? "INR"}</em>
                        </div>
                        <strong>{po.supplier}</strong>
                        <small>{po.items}</small>
                        <div className="pur-v2-card-foot">
                          <span>{po.branch ?? "—"}</span>
                          <b>{formatINR(po.amount)}</b>
                        </div>
                        <div className="pur-v2-eta"><Truck size={12} /> {etaFor(po)}</div>
                      </article>
                    ))}
                    {col.items.length === 0 ? <div className="pur-v2-col-empty">Drop PO here</div> : null}
                  </div>
                </section>
              ))}
            </div>

            {drawerOpen && selected ? (
              <aside className="pur-v2-drawer">
                <DrawerPanel
                  po={selected}
                  score={scoreFor(selected.supplier)}
                  onAdvance={() => {
                    const next = nextPoStatus(selected.status);
                    if (next) moveTo(selected.id, next);
                  }}
                  onPartial={() => moveTo(selected.id, "partial")}
                  onGrn={() => flash(`GRN ${grnFor(selected)} generated`)}
                  onInvoice={() => flash("Supplier invoice matched to PO")}
                  onChat={() => flash("Supplier chat opened")}
                  onClose={() => setDrawerOpen(false)}
                />
              </aside>
            ) : null}
          </div>
        ) : null}

        {view === "suppliers" ? (
          <div className="pur-v2-sup-grid">
            {suppliers.map((s) => {
              const score = scoreFor(s.name);
              const pos = purchaseOrders.filter((p) => p.supplier === s.name);
              return (
                <article className="pur-glass pur-v2-sup-card" key={s.id}>
                  <div className="pur-v2-sup-top">
                    <strong>{s.name}</strong>
                    <em className={score >= 85 ? "good" : score >= 75 ? "ok" : "mid"}>{score}/100</em>
                  </div>
                  <small>{s.tradeName ?? s.code} · {s.city} · {s.paymentTerms ?? "Net 30"}</small>
                  <div className="pur-v2-sup-metrics">
                    <div><span>Payables</span><strong>{s.balance ? formatINR(s.balance) : "—"}</strong></div>
                    <div><span>POs</span><strong>{pos.length}</strong></div>
                    <div><span>On-time</span><strong>{80 + hashN(s.id, 15)}%</strong></div>
                  </div>
                  <div className="pur-v2-sup-actions">
                    <button type="button" className="pur-v2-btn ghost compact" onClick={() => { setForm((f) => ({ ...f, supplier: s.name })); setOpen(true); }}>
                      New PO
                    </button>
                    <button type="button" className="pur-v2-btn ghost compact" onClick={() => flash(`Chat · ${s.name}`)}>
                      <MessageCircle size={14} /> Chat
                    </button>
                    <Link className="pur-v2-btn ghost compact" href="/suppliers">Docs</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {view === "analytics" ? (
          <div className="pur-v2-analytics">
            <section className="pur-glass">
              <div className="pur-v2-section-head"><h2><TrendingUp size={16} /> Live metal rate comparison</h2></div>
              <div className="pur-v2-rate-table">
                {rateCompare.map((r) => (
                  <div key={r.metal}>
                    <strong>{r.metal}</strong>
                    <span>Market ₹{r.market.toLocaleString("en-IN")}</span>
                    <span>Vendor ₹{r.vendor.toLocaleString("en-IN")}</span>
                    <em>{r.save}</em>
                  </div>
                ))}
              </div>
            </section>
            <section className="pur-glass">
              <div className="pur-v2-section-head"><h2><Sparkles size={16} /> AI supplier & reorder</h2></div>
              <ul className="pur-v2-ai-list">
                <li>
                  <strong>Best price · diamonds</strong>
                  <small>Raj Gems scores {scoreFor("Raj Gems")}/100 — quote 2.4% under last parcel.</small>
                </li>
                <li>
                  <strong>Casting grain</strong>
                  <small>Kundan ETA shorter this week; lock before 22K spike.</small>
                </li>
                {lowStock.map((item) => (
                  <li key={item.id}>
                    <strong>Reorder · {item.name}</strong>
                    <small>Stock {item.stock} · suggest PO via preferred supplier.</small>
                  </li>
                ))}
              </ul>
            </section>
            <section className="pur-glass">
              <div className="pur-v2-section-head"><h2><BarChart3 size={16} /> Branch-wise purchasing</h2></div>
              <div className="pur-v2-bars">
                {BRANCHES.slice(0, 4).map((b) => {
                  const value = purchaseOrders.filter((p) => p.branch === b).reduce((s, p) => s + p.amount, 0);
                  const max = Math.max(...BRANCHES.map((x) => purchaseOrders.filter((p) => p.branch === x).reduce((s, p) => s + p.amount, 0)), 1);
                  return (
                    <div key={b}>
                      <div className="pur-v2-bar-top"><span>{b}</span><strong>{formatINR(value)}</strong></div>
                      <div className="pur-v2-bar-track"><span style={{ width: `${Math.round((value / max) * 100)}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}

        <button type="button" className="pur-v2-fab" onClick={() => setOpen(true)} aria-label="New purchase order">
          <Plus size={22} />
        </button>

        {toast ? <div className="pur-v2-toast" role="status">{toast}</div> : null}
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submitPo}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Quick purchase order</h2>
            <div className="form-grid">
              <label className="field"><span>Supplier *</span><div className="field-input">
                <input list="sup-list" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                <datalist id="sup-list">{suppliers.map((s) => <option key={s.id} value={s.name} />)}</datalist>
              </div></label>
              <label className="field"><span>Branch</span><div className="field-input">
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div></label>
              <label className="field" style={{ gridColumn: "1 / -1" }}><span>Items *</span><div className="field-input"><input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 22K casting grain 200g" /></div></label>
              <label className="field"><span>Amount (₹)</span><div className="field-input"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="250000" /></div></label>
              <label className="field"><span>Currency</span><div className="field-input"><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}>{CURRENCY_CODES.map((code) => <option key={code} value={code}>{CURRENCY_LABELS[code]}</option>)}</select></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Create PO</button>
            </div>
          </form>
        </div>
      ) : null}

      {supOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submitSupplier}>
            <button className="modal-close" type="button" onClick={() => setSupOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Add supplier</h2>
            <div className="form-grid">
              <label className="field"><span>Legal name *</span><div className="field-input"><input value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={supForm.city} onChange={(e) => setSupForm({ ...supForm, city: e.target.value })} /></div></label>
              <label className="field"><span>Phone</span><div className="field-input"><input value={supForm.phone} onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })} /></div></label>
              <label className="field"><span>Payment terms</span><div className="field-input"><input value={supForm.paymentTerms} onChange={(e) => setSupForm({ ...supForm, paymentTerms: e.target.value })} /></div></label>
              <label className="field"><span>Currency</span><div className="field-input"><select value={supForm.currency} onChange={(e) => setSupForm({ ...supForm, currency: e.target.value as CurrencyCode })}>{CURRENCY_CODES.map((code) => <option key={code} value={code}>{CURRENCY_LABELS[code]}</option>)}</select></div></label>
            </div>
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setSupOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Save supplier</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}

function DrawerPanel({
  po,
  score,
  onAdvance,
  onPartial,
  onGrn,
  onInvoice,
  onChat,
  onClose,
}: {
  po: PurchaseOrder;
  score: number;
  onAdvance: () => void;
  onPartial: () => void;
  onGrn: () => void;
  onInvoice: () => void;
  onChat: () => void;
  onClose: () => void;
}) {
  const next = nextPoStatus(po.status);
  const idx = PO_BOARD_FLOW.indexOf(po.status);

  return (
    <section className="pur-glass pur-v2-panel">
      <div className="pur-v2-panel-head">
        <div>
          <span className="pur-v2-eyebrow">{po.number}</span>
          <h2>{po.supplier}</h2>
          <p>{srsLabel(po.status)} · {po.branch ?? "—"}</p>
        </div>
        <button type="button" className="pur-v2-btn ghost compact" onClick={onClose} aria-label="Close panel"><X size={16} /></button>
      </div>

      <div className="pur-v2-timeline" aria-label="Purchase timeline">
        {PO_BOARD_FLOW.map((s, i) => (
          <div key={s} className={`pur-v2-step ${i <= idx ? "done" : ""} ${i === idx ? "current" : ""}`}>
            <i />
            <span>{srsLabel(s)}</span>
          </div>
        ))}
      </div>

      <div className="pur-v2-meta">
        <div><span>Items</span><strong>{po.items}</strong></div>
        <div><span>Amount</span><strong>{formatINR(po.amount)} {po.currency ?? ""}</strong></div>
        <div><span>ETA</span><strong>{etaFor(po)}</strong></div>
        <div><span>Supplier score</span><strong>{score}/100</strong></div>
        <div><span>GRN</span><strong>{grnFor(po)}</strong></div>
        <div><span>Payment</span><strong>{po.status === "closed" ? "Settled" : "Open"}</strong></div>
      </div>

      <div className="pur-v2-section-head"><h2>Documents & matching</h2></div>
      <div className="pur-v2-doc-row">
        <button type="button" className="pur-v2-btn ghost compact" onClick={onGrn}><PackageCheck size={14} /> Generate GRN</button>
        <button type="button" className="pur-v2-btn ghost compact" onClick={onInvoice}><FileText size={14} /> Match invoice</button>
        <button type="button" className="pur-v2-btn ghost compact" onClick={onPartial}>Partial receipt</button>
        <button type="button" className="pur-v2-btn ghost compact" onClick={onChat}><MessageCircle size={14} /> Supplier chat</button>
      </div>

      <div className="pur-v2-actions">
        {next ? (
          <button type="button" className="pur-v2-btn gold" onClick={onAdvance}>
            Advance · {srsLabel(next)} <ChevronRight size={16} />
          </button>
        ) : (
          <p className="pur-v2-done"><CheckCircle2 size={16} /> Workflow complete</p>
        )}
      </div>
    </section>
  );
}
