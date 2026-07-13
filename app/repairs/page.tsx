"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  Phone,
  Plus,
  QrCode,
  ScanBarcode,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import {
  ITEM_REFERENCE_TYPES,
  REPAIR_BOARD_FLOW,
  REPAIR_PRIORITIES,
  nextRepairStatus,
  srsLabel,
  srsPillTone,
  type RepairPriority,
  type RepairStatus,
} from "../lib/srs";
import {
  currencySymbol,
  formatINR,
  useStore,
  type Repair,
} from "../lib/store";

const TECHNICIANS = ["Ravi Nair", "Karim Ali", "Sonal Desai", "Imran Khan", "Unassigned"];
const PHOTO_POOL = [
  "/images/customer_2.png",
  "/images/customer_1.png",
  "/images/ring_1.png",
  "/images/bangle_1.png",
  "/images/necklace_1.png",
];
const PARTS_DEMO = ["Solder wire", "Rhodium flash", "Clasp", "Stone seating", "Polish compound"];

type ViewMode = "board" | "list" | "analytics";

function hashN(key: string, mod: number) {
  return key.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % Math.max(mod, 1);
}

function otpFor(repair: Repair) {
  return String(100000 + hashN(repair.id + repair.number, 900000));
}

function barcodeFor(repair: Repair) {
  return `RP-${repair.number.replace(/[^0-9]/g, "").slice(-8)}`;
}

function warrantyLeft(repair: Repair) {
  if (repair.status !== "delivered" && repair.status !== "ready") return "90 days on workmanship after delivery";
  return `${60 + hashN(repair.id, 30)} days remaining`;
}

function isOverdue(repair: Repair) {
  if (!repair.promisedDate || repair.status === "delivered" || repair.status === "cancelled") return false;
  // Demo heuristic: urgent / vip without ready are flagged overdue-ish
  return repair.priority === "urgent" || repair.priority === "vip" || hashN(repair.id, 3) === 0;
}

function statusIndex(status: RepairStatus) {
  return REPAIR_BOARD_FLOW.indexOf(status);
}

export default function RepairsPage() {
  const {
    repairs,
    addRepair,
    updateRepairStatus,
    assignRepairTechnician,
    customers,
    selectedBranch,
  } = useStore();
  const money = currencySymbol();

  const [view, setView] = useState<ViewMode>("board");
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | RepairPriority>("All");
  const [selectedId, setSelectedId] = useState<string | null>(repairs[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [otpVerified, setOtpVerified] = useState<Record<string, boolean>>({});
  const [otpInput, setOtpInput] = useState("");
  const [form, setForm] = useState({
    customer: "",
    item: "",
    issue: "",
    estimate: "",
    deposit: "",
    promisedDate: "",
    priority: "normal" as RepairPriority,
    itemReferenceType: "external_item" as const,
    observedCondition: "",
    metalDetails: "",
    stoneDetails: "",
    technician: TECHNICIANS[0],
  });
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return repairs.filter((r) => {
      if (priorityFilter !== "All" && (r.priority ?? "normal") !== priorityFilter) return false;
      if (!q) return true;
      return (
        r.number.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q) ||
        r.issue.toLowerCase().includes(q) ||
        (r.technician ?? "").toLowerCase().includes(q) ||
        barcodeFor(r).toLowerCase().includes(q)
      );
    });
  }, [repairs, query, priorityFilter]);

  const selected = repairs.find((r) => r.id === selectedId) ?? filtered[0] ?? null;
  const overdue = repairs.filter(isOverdue);
  const readyPickup = repairs.filter((r) => r.status === "ready");
  const active = repairs.filter((r) => r.status !== "delivered" && r.status !== "cancelled");

  const pipeline = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of REPAIR_BOARD_FLOW) counts[s] = repairs.filter((r) => r.status === s).length;
    return counts;
  }, [repairs]);

  const kpis = [
    { label: "Open jobs", value: String(active.length), note: `${repairs.length} total`, tone: "gold", icon: Wrench },
    { label: "Ready pickup", value: String(readyPickup.length), note: "OTP desk", tone: "lavender", icon: CheckCircle2 },
    { label: "Overdue", value: String(overdue.length), note: "Needs chase", tone: "warn", icon: AlertTriangle },
    { label: "In workshop", value: String(pipeline.in_progress ?? 0), note: "Repairing", tone: "violet", icon: ClipboardList },
    { label: "Est. value", value: formatINR(active.reduce((s, r) => s + r.estimate, 0)), note: "Open pipeline", tone: "champagne", icon: BarChart3 },
    { label: "Deposits held", value: formatINR(active.reduce((s, r) => s + (r.deposit ?? 0), 0)), note: "Liability", tone: "lavender", icon: ShieldCheck },
  ];

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.customer.trim() || !form.item.trim() || !form.issue.trim()) {
      setError("Customer, item and issue are required.");
      return;
    }
    const estimate = Number(form.estimate) || 0;
    const deposit = Number(form.deposit) || 0;
    addRepair({
      customer: form.customer.trim(),
      item: form.item.trim(),
      issue: form.issue.trim(),
      estimate,
      approvedAmount: estimate,
      deposit,
      promisedDate: form.promisedDate.trim() || undefined,
      priority: form.priority,
      itemReferenceType: form.itemReferenceType,
      observedCondition: form.observedCondition.trim() || undefined,
      metalDetails: form.metalDetails.trim() || undefined,
      stoneDetails: form.stoneDetails.trim() || undefined,
      technician: form.technician === "Unassigned" ? undefined : form.technician,
    });
    setForm({
      customer: "", item: "", issue: "", estimate: "", deposit: "", promisedDate: "",
      priority: "normal", itemReferenceType: "external_item",
      observedCondition: "", metalDetails: "", stoneDetails: "", technician: TECHNICIANS[0],
    });
    setError("");
    setOpen(false);
    flash("Repair ticket created · barcode printed");
  }

  function moveTo(id: string, status: RepairStatus) {
    updateRepairStatus(id, status);
    flash(`Moved to ${srsLabel(status)}`);
  }

  function verifyOtp() {
    if (!selected) return;
    if (otpInput.trim() === otpFor(selected)) {
      setOtpVerified((p) => ({ ...p, [selected.id]: true }));
      flash("OTP verified — ready for handover");
      setOtpInput("");
    } else {
      flash("Invalid OTP");
    }
  }

  function notify(channel: "WhatsApp" | "SMS") {
    if (!selected) return;
    flash(`${channel} update sent for ${selected.number}`);
  }

  const boardColumns = REPAIR_BOARD_FLOW.map((status) => ({
    status,
    items: filtered.filter((r) => r.status === status),
  }));

  return (
    <AppShell searchPlaceholder="Search repair #, customer, barcode…">
      <section className="page-content rep-v2">
        <header className="rep-v2-head">
          <div>
            <span className="rep-v2-eyebrow"><Wrench size={14} /> Repairs · {selectedBranch}</span>
            <h1>Repair Management</h1>
            <p>Click a job to open the side panel — change status, assign tech, and notify from one place.</p>
          </div>
          <div className="rep-v2-head-actions">
            <button type="button" className="rep-v2-btn gold" onClick={() => setOpen(true)}>
              <Plus size={16} /> New repair
            </button>
            <button type="button" className="rep-v2-btn ghost" onClick={() => flash("Barcode scan ready")}>
              <ScanBarcode size={16} /> Scan ticket
            </button>
            <button type="button" className="rep-v2-btn ghost" onClick={() => notify("WhatsApp")}>
              <MessageCircle size={16} /> Notify
            </button>
          </div>
        </header>

        <section className="rep-v2-kpis" aria-label="Repair KPIs">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className={`rep-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
                <div className="rep-v2-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        {(overdue.length > 0 || readyPickup.length > 0) ? (
          <div className="rep-v2-alerts" role="status">
            {overdue.length ? (
              <span className="rep-v2-alert danger">
                <AlertTriangle size={15} /> {overdue.length} overdue / priority jobs need attention
              </span>
            ) : null}
            {readyPickup.length ? (
              <span className="rep-v2-alert info">
                <CalendarDays size={15} /> {readyPickup.length} upcoming pickups — send OTP reminders
              </span>
            ) : null}
            <span className="rep-v2-alert gold">
              <ShieldCheck size={15} /> Warranty clock starts on delivery
            </span>
          </div>
        ) : null}

        <section className="rep-glass rep-v2-tools">
          <div className="rep-v2-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Quick search — ticket, customer, item, technician, QR…"
              aria-label="Search repairs"
            />
          </div>
          <div className="rep-v2-filters">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)} aria-label="Priority filter">
              <option value="All">All priorities</option>
              {REPAIR_PRIORITIES.map((p) => <option key={p} value={p}>{srsLabel(p)}</option>)}
            </select>
            <div className="rep-v2-view-toggle" role="group" aria-label="View">
              <button type="button" className={view === "board" ? "active" : ""} onClick={() => setView("board")}>Board</button>
              <button type="button" className={view === "list" ? "active" : ""} onClick={() => setView("list")}>List</button>
              <button type="button" className={view === "analytics" ? "active" : ""} onClick={() => setView("analytics")}>Analytics</button>
            </div>
            <button type="button" className="rep-v2-btn ghost compact" onClick={() => setDrawerOpen((v) => !v)}>
              {drawerOpen ? "Hide panel" : "Show panel"}
            </button>
          </div>
        </section>

        {view === "board" ? (
          <div className={`rep-v2-layout ${drawerOpen ? "" : "wide"}`}>
            <div className="rep-v2-board" role="list">
              {boardColumns.map((col) => (
                <section key={col.status} className="rep-glass rep-v2-col">
                  <div className="rep-v2-col-head">
                    <h2>{srsLabel(col.status)}</h2>
                    <span>{col.items.length}</span>
                  </div>
                  <div className="rep-v2-col-body">
                    {col.items.map((r) => (
                      <article
                        key={r.id}
                        className={`rep-v2-card ${selected?.id === r.id ? "active" : ""} ${isOverdue(r) ? "overdue" : ""}`}
                        onClick={() => { setSelectedId(r.id); setDrawerOpen(true); }}
                        role="listitem"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedId(r.id);
                            setDrawerOpen(true);
                          }
                        }}
                      >
                        <div className="rep-v2-card-top">
                          <code>{r.number.slice(-8)}</code>
                          <em className={`prio ${(r.priority ?? "normal")}`}>{srsLabel(r.priority ?? "normal")}</em>
                        </div>
                        <strong>{r.item}</strong>
                        <small>{r.customer}</small>
                        <p>{r.issue}</p>
                        <div className="rep-v2-card-foot">
                          <span>{r.technician ?? "Unassigned"}</span>
                          <b>{formatINR(r.estimate)}</b>
                        </div>
                        {r.promisedDate ? <div className="rep-v2-due"><CalendarDays size={12} /> {r.promisedDate}</div> : null}
                      </article>
                    ))}
                    {col.items.length === 0 ? (
                      <div className="rep-v2-col-empty">No jobs here · open a card and set status in the panel</div>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>

            {drawerOpen ? (
              <aside className="rep-v2-detail">
                {selected ? (
                  <DetailPanel
                    repair={selected}
                    note={notes[selected.id] ?? ""}
                    setNote={(v) => setNotes((p) => ({ ...p, [selected.id]: v }))}
                    otpInput={otpInput}
                    setOtpInput={setOtpInput}
                    otpOk={Boolean(otpVerified[selected.id])}
                    onVerifyOtp={verifyOtp}
                    onAssign={(tech) => { assignRepairTechnician(selected.id, tech); flash(`Assigned ${tech || "Unassigned"}`); }}
                    onSetStatus={(status) => moveTo(selected.id, status)}
                    onAdvance={() => {
                      const next = nextRepairStatus(selected.status);
                      if (next) moveTo(selected.id, next);
                    }}
                    onNotify={notify}
                    flash={flash}
                  />
                ) : (
                  <section className="rep-glass rep-v2-empty">
                    <Wrench size={36} />
                    <strong>Select a job</strong>
                    <p>Click any card — change status from the side panel.</p>
                  </section>
                )}
              </aside>
            ) : null}
          </div>
        ) : null}

        {view === "list" ? (
          <section className="rep-glass">
            <div className="rep-v2-table-wrap">
              <table className="rep-v2-table">
                <thead>
                  <tr>
                    <th>Ticket</th><th>Customer</th><th>Item</th><th>Tech</th><th>Estimate</th>
                    <th>Due</th><th>Priority</th><th>Status</th><th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const next = nextRepairStatus(r.status);
                    return (
                      <tr key={r.id} className={selected?.id === r.id ? "active" : ""} onClick={() => setSelectedId(r.id)}>
                        <td><code>{r.number}</code><br /><small>{barcodeFor(r)}</small></td>
                        <td>{r.customer}</td>
                        <td>{r.item}<br /><small>{r.issue}</small></td>
                        <td>{r.technician ?? "—"}</td>
                        <td>{formatINR(r.estimate)}</td>
                        <td>{r.promisedDate || "—"}</td>
                        <td><em className={`prio ${(r.priority ?? "normal")}`}>{srsLabel(r.priority ?? "normal")}</em></td>
                        <td><span className={`status-pill ${srsPillTone(r.status)}`}>{srsLabel(r.status)}</span></td>
                        <td>
                          {next ? (
                            <button type="button" className="rep-v2-btn ghost compact" onClick={(e) => { e.stopPropagation(); moveTo(r.id, next); }}>
                              <ChevronRight size={14} />
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 ? <tr><td colSpan={9} className="empty-note">No repairs match.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {view === "analytics" ? (
          <div className="rep-v2-analytics">
            <section className="rep-glass">
              <div className="rep-v2-section-head"><h2><BarChart3 size={16} /> Pipeline mix</h2></div>
              <div className="rep-v2-bars">
                {REPAIR_BOARD_FLOW.map((s) => {
                  const count = pipeline[s] ?? 0;
                  const max = Math.max(...REPAIR_BOARD_FLOW.map((x) => pipeline[x] ?? 0), 1);
                  return (
                    <div key={s}>
                      <div className="rep-v2-bar-top"><span>{srsLabel(s)}</span><strong>{count}</strong></div>
                      <div className="rep-v2-bar-track"><span style={{ width: `${Math.round((count / max) * 100)}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="rep-glass rep-v2-ai">
              <div className="rep-v2-section-head"><h2><Sparkles size={16} /> Repair insights</h2></div>
              <ul className="rep-v2-ai-list">
                <li><strong>Bottleneck</strong><small>Most tickets stall at approval — nudge WhatsApp for estimate sign-off.</small></li>
                <li><strong>Bench load</strong><small>{TECHNICIANS[0]} and {TECHNICIANS[1]} hold the active resize jobs.</small></li>
                <li><strong>Pickup desk</strong><small>{readyPickup.length} ready — batch OTP SMS before close of day.</small></li>
              </ul>
            </section>
          </div>
        ) : null}

        {toast ? <div className="rep-v2-toast" role="status">{toast}</div> : null}
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide rep-v2-modal" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Repair intake</h2>
            <div className="form-grid">
              <label className="field"><span>Customer *</span><div className="field-input">
                <input list="cust-list" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" />
                <datalist id="cust-list">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
              </div></label>
              <label className="field"><span>Item *</span><div className="field-input"><input value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. Gold Ring" /></div></label>
              <label className="field" style={{ gridColumn: "1 / -1" }}><span>Issue *</span><div className="field-input"><input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="e.g. Ring resizing to US 7" /></div></label>
              <label className="field"><span>Item reference</span><div className="field-input"><select value={form.itemReferenceType} onChange={(e) => setForm({ ...form, itemReferenceType: e.target.value as typeof form.itemReferenceType })}>{ITEM_REFERENCE_TYPES.map((t) => <option key={t} value={t}>{srsLabel(t)}</option>)}</select></div></label>
              <label className="field"><span>Technician</span><div className="field-input"><select value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })}>{TECHNICIANS.map((t) => <option key={t}>{t}</option>)}</select></div></label>
              <label className="field" style={{ gridColumn: "1 / -1" }}><span>Observed condition</span><div className="field-input"><input value={form.observedCondition} onChange={(e) => setForm({ ...form, observedCondition: e.target.value })} placeholder="Scratches, dents, missing stones..." /></div></label>
              <label className="field"><span>Metal</span><div className="field-input"><input value={form.metalDetails} onChange={(e) => setForm({ ...form, metalDetails: e.target.value })} placeholder="22K yellow gold" /></div></label>
              <label className="field"><span>Stone</span><div className="field-input"><input value={form.stoneDetails} onChange={(e) => setForm({ ...form, stoneDetails: e.target.value })} placeholder="0.25 ct diamond" /></div></label>
              <label className="field"><span>Estimate ({money})</span><div className="field-input"><input type="number" value={form.estimate} onChange={(e) => setForm({ ...form, estimate: e.target.value })} placeholder="1200" /></div></label>
              <label className="field"><span>Deposit ({money})</span><div className="field-input"><input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} placeholder="500" /></div></label>
              <label className="field"><span>Promised date</span><div className="field-input"><input value={form.promisedDate} onChange={(e) => setForm({ ...form, promisedDate: e.target.value })} placeholder="e.g. 15 May, 2025" /></div></label>
              <label className="field"><span>Priority</span><div className="field-input"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as RepairPriority })}>{REPAIR_PRIORITIES.map((p) => <option key={p} value={p}>{srsLabel(p)}</option>)}</select></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Create repair</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}

function DetailPanel({
  repair,
  note,
  setNote,
  otpInput,
  setOtpInput,
  otpOk,
  onVerifyOtp,
  onAssign,
  onSetStatus,
  onAdvance,
  onNotify,
  flash,
}: {
  repair: Repair;
  note: string;
  setNote: (v: string) => void;
  otpInput: string;
  setOtpInput: (v: string) => void;
  otpOk: boolean;
  onVerifyOtp: () => void;
  onAssign: (tech: string) => void;
  onSetStatus: (status: RepairStatus) => void;
  onAdvance: () => void;
  onNotify: (c: "WhatsApp" | "SMS") => void;
  flash: (m: string) => void;
}) {
  const next = nextRepairStatus(repair.status);
  const idx = statusIndex(repair.status);
  const photo = PHOTO_POOL[hashN(repair.id, PHOTO_POOL.length)];
  const parts = PARTS_DEMO.filter((_, i) => hashN(repair.id + String(i), 2) === 0).slice(0, 3);

  return (
    <section className="rep-glass rep-v2-panel">
      <div className="rep-v2-panel-head">
        <div>
          <span className="rep-v2-eyebrow">{repair.number}</span>
          <h2>{repair.item}</h2>
          <p>{repair.customer} · {srsLabel(repair.status)}</p>
        </div>
        <em className={`prio ${(repair.priority ?? "normal")}`}>{srsLabel(repair.priority ?? "normal")}</em>
      </div>

      <div className="rep-v2-section-head">
        <h2>Change status</h2>
        <span>Click a stage</span>
      </div>
      <div className="rep-v2-status-grid" role="listbox" aria-label="Repair status">
        {REPAIR_BOARD_FLOW.map((s) => (
          <button
            type="button"
            key={s}
            role="option"
            aria-selected={repair.status === s}
            className={`rep-v2-status-chip ${repair.status === s ? "active" : ""}`}
            onClick={() => onSetStatus(s)}
          >
            {srsLabel(s)}
          </button>
        ))}
      </div>

      <div className="rep-v2-timeline" aria-label="Repair timeline">
        {REPAIR_BOARD_FLOW.map((s, i) => (
          <button
            type="button"
            key={s}
            className={`rep-v2-step ${i <= idx ? "done" : ""} ${i === idx ? "current" : ""}`}
            onClick={() => onSetStatus(s)}
          >
            <i />
            <span>{srsLabel(s)}</span>
          </button>
        ))}
      </div>

      <div className="rep-v2-photo-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="rep-v2-photo" />
        <div className="rep-v2-meta">
          <div><span>Barcode / QR</span><strong><QrCode size={14} /> {barcodeFor(repair)}</strong></div>
          <div><span>Estimate</span><strong>{formatINR(repair.estimate)}</strong></div>
          <div><span>Deposit</span><strong>{repair.deposit ? formatINR(repair.deposit) : "—"}</strong></div>
          <div><span>Balance</span><strong>{repair.balanceDue ? formatINR(repair.balanceDue) : "—"}</strong></div>
          <div><span>Due</span><strong>{repair.promisedDate || "—"}</strong></div>
          <div><span>Warranty</span><strong>{warrantyLeft(repair)}</strong></div>
        </div>
      </div>

      <label className="rep-v2-field">
        <span><UserRound size={14} /> Technician</span>
        <select
          value={repair.technician || "Unassigned"}
          onChange={(e) => onAssign(e.target.value === "Unassigned" ? "" : e.target.value)}
        >
          {TECHNICIANS.map((t) => <option key={t} value={t === "Unassigned" ? "Unassigned" : t}>{t}</option>)}
        </select>
      </label>

      <div className="rep-v2-section-head"><h2>Parts / materials</h2></div>
      <div className="rep-v2-parts">
        {(parts.length ? parts : ["Inspection kit"]).map((p) => (
          <span key={p}>{p}</span>
        ))}
        <button type="button" onClick={() => flash("Part line added")}>+ Add part</button>
      </div>

      <div className="rep-v2-section-head"><h2>Repair notes</h2></div>
      <textarea
        className="rep-v2-notes"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Bench notes, stone condition, customer instructions…"
      />
      <button type="button" className="rep-v2-btn ghost compact" onClick={() => flash("Note saved")}>Save note</button>

      {(repair.status === "ready" || repair.status === "delivered") ? (
        <div className="rep-v2-otp">
          <div className="rep-v2-section-head">
            <h2>OTP pickup</h2>
            <span>{otpOk ? "Verified" : `Demo OTP ${otpFor(repair)}`}</span>
          </div>
          {!otpOk ? (
            <div className="rep-v2-otp-row">
              <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter 6-digit OTP" />
              <button type="button" className="rep-v2-btn gold compact" onClick={onVerifyOtp}>Verify</button>
            </div>
          ) : (
            <p className="rep-v2-otp-ok"><CheckCircle2 size={16} /> Customer verified — release piece</p>
          )}
        </div>
      ) : null}

      <div className="rep-v2-actions">
        {next ? (
          <button type="button" className="rep-v2-btn gold" onClick={onAdvance}>
            Advance · {srsLabel(next)} <ChevronRight size={16} />
          </button>
        ) : null}
        <button type="button" className="rep-v2-btn ghost" onClick={() => onNotify("WhatsApp")}><MessageCircle size={15} /> WhatsApp</button>
        <button type="button" className="rep-v2-btn ghost" onClick={() => onNotify("SMS")}><Phone size={15} /> SMS</button>
      </div>

      <div className="rep-v2-history">
        <h3>History</h3>
        <div><strong>Intake</strong><span>{repair.date}</span></div>
        <div><strong>Condition</strong><span>{repair.observedCondition || repair.metalDetails || "—"}</span></div>
        <div><strong>Issue</strong><span>{repair.issue}</span></div>
      </div>
    </section>
  );
}
