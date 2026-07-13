"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Cake,
  CalendarDays,
  ClipboardList,
  FileText,
  Gift,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  Star,
  Ticket,
  UserPlus,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { CUSTOMER_TYPES, srsLabel, srsPillTone, type CustomerType } from "../lib/srs";
import {
  BRANCHES,
  formatINR,
  itemPrice,
  useStore,
  type Customer,
  type Item,
  type Rates,
} from "../lib/store";

const CRM_TABS = [
  "Directory",
  "Leads",
  "Appointments",
  "Loyalty",
  "Tickets",
  "Analytics",
] as const;
type CrmTab = (typeof CRM_TABS)[number];

const PROFILE_TABS = [
  "360°",
  "History",
  "Loyalty",
  "Wishlist",
  "Comms",
  "Payments",
  "Appointments",
  "Docs",
  "Service",
  "Notes",
] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

const SEGMENTS = ["All", "VIP", "Retail", "Wholesale", "Walk-in", "Birthday month"] as const;

const LEADS = [
  { id: "l1", name: "Ananya Rao", interest: "Bridal set · 22K", source: "Instagram", owner: "Asha", stage: "Hot", value: 480000 },
  { id: "l2", name: "Omar Al-Farsi", interest: "Diamond studs", source: "Walk-in enquiry", owner: "Meera", stage: "Warm", value: 125000 },
  { id: "l3", name: "Sneha Kapoor", interest: "Temple necklace", source: "Referral", owner: "Asha", stage: "New", value: 210000 },
  { id: "l4", name: "Vikram Seth", interest: "Corporate gift batch", source: "Email", owner: "Imran", stage: "Qualified", value: 890000 },
];

const APPOINTMENTS = [
  { id: "a1", customer: "John Smith", type: "Try-on · Bridal", when: "Today · 4:30 PM", branch: "Main Branch", status: "Confirmed" },
  { id: "a2", customer: "Priya Mehta", type: "Repair pickup", when: "Tomorrow · 11:00 AM", branch: "Main Branch", status: "Reminded" },
  { id: "a3", customer: "Raj Gems (B2B)", type: "Wholesale viewing", when: "15 May · 2:00 PM", branch: "Vault", status: "Scheduled" },
];

const TICKETS = [
  { id: "t1", customer: "Priya Mehta", subject: "Resize delay enquiry", channel: "WhatsApp", priority: "Medium", status: "Open" },
  { id: "t2", customer: "John Smith", subject: "Certificate PDF missing", channel: "Email", priority: "High", status: "In progress" },
  { id: "t3", customer: "Zara Jewels (B2B)", subject: "Bulk invoice GST mismatch", channel: "Phone", priority: "High", status: "Waiting" },
];

const WISHLIST_IMGS = ["/images/customer_1.png", "/images/customer_2.png", "/images/customer_3.png"] as const;

function hashN(key: string, mod: number) {
  return key.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % Math.max(mod, 1);
}

function tierFor(spend: number, type: CustomerType) {
  if (type === "vip" || spend >= 500000) return { name: "Platinum", pts: Math.floor(spend / 80) };
  if (type === "wholesale" || spend >= 150000) return { name: "Gold", pts: Math.floor(spend / 100) };
  if (spend >= 40000) return { name: "Silver", pts: Math.floor(spend / 120) };
  return { name: "Member", pts: Math.floor(spend / 150) };
}

function clvFor(spend: number, visits: number) {
  return Math.round(spend * (1 + Math.min(visits, 8) * 0.08));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function birthdayLabel(id: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${8 + hashN(id, 20)} ${months[hashN(id + "b", 12)]}`;
}

export default function CustomersPage() {
  const { customers, addCustomer, invoices, repairs, items, rates, selectedBranch } = useStore();
  const [tab, setTab] = useState<CrmTab>("Directory");
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>("360°");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [note, setNote] = useState("");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "",
    type: "retail" as CustomerType,
    preferredLanguage: "en",
    consentSms: false,
    consentWhatsapp: true,
    consentEmail: false,
  });
  const [error, setError] = useState("");

  const spendMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of invoices) map.set(inv.customer, (map.get(inv.customer) ?? 0) + inv.total);
    return map;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (segment === "VIP" && !(c.type === "vip" || c.vipFlag)) return false;
      if (segment === "Retail" && c.type !== "retail") return false;
      if (segment === "Wholesale" && c.type !== "wholesale") return false;
      if (segment === "Walk-in" && c.type !== "walk_in") return false;
      if (segment === "Birthday month" && hashN(c.id, 12) !== 6) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [customers, query, segment]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  function openProfile(id: string) {
    setSelectedId(id);
    setProfileTab("360°");
    setExpanded(true);
  }

  function closeProfile() {
    setExpanded(false);
  }

  const customerInvoices = useMemo(
    () => (selected ? invoices.filter((i) => i.customer === selected.name) : []),
    [invoices, selected],
  );
  const customerRepairs = useMemo(
    () => (selected ? repairs.filter((r) => r.customer === selected.name) : []),
    [repairs, selected],
  );

  const spend = selected ? spendMap.get(selected.name) ?? 0 : 0;
  const tier = selected ? tierFor(spend, selected.type) : null;
  const clv = selected ? clvFor(spend, customerInvoices.length + 2) : 0;

  const recommendations = useMemo(() => {
    if (!selected) return [];
    return [...items]
      .filter((i) => i.stock > 0)
      .sort((a, b) => {
        const score = (item: typeof a) =>
          (selected.type === "vip" ? item.stoneValue : 0) +
          item.weight * 10 +
          hashN(selected.id + item.id, 50);
        return score(b) - score(a);
      })
      .slice(0, 4);
  }, [items, selected]);

  const kpis = [
    { label: "Customers", value: String(customers.length), note: `${filtered.length} in view`, tone: "gold", icon: UsersRound },
    { label: "VIP / Platinum", value: String(customers.filter((c) => c.type === "vip" || c.vipFlag).length), note: "High CLV", tone: "champagne", icon: Star },
    { label: "Open leads", value: String(LEADS.length), note: "Enquiry pipeline", tone: "lavender", icon: Sparkles },
    { label: "Appointments", value: String(APPOINTMENTS.length), note: "This week", tone: "violet", icon: CalendarDays },
    { label: "Loyalty pts", value: customers.reduce((s, c) => s + tierFor(spendMap.get(c.name) ?? 0, c.type).pts, 0).toLocaleString("en-IN"), note: "Earnable pool", tone: "lavender", icon: Gift },
    { label: "Open tickets", value: String(TICKETS.filter((t) => t.status !== "Closed").length), note: "Support queue", tone: "warn", icon: Ticket },
  ];

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Name and mobile are required.");
      return;
    }
    addCustomer({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      whatsapp: form.whatsapp.trim() || form.mobile.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      type: form.type,
      preferredLanguage: form.preferredLanguage,
      consentSms: form.consentSms,
      consentWhatsapp: form.consentWhatsapp,
      consentEmail: form.consentEmail,
    });
    setForm({ name: "", mobile: "", whatsapp: "", email: "", city: "", type: "retail", preferredLanguage: "en", consentSms: false, consentWhatsapp: true, consentEmail: false });
    setError("");
    setOpen(false);
    flash("Customer added to CRM");
    setTab("Directory");
  }

  function saveNote() {
    if (!note.trim()) return;
    flash("Note saved on profile");
    setNote("");
  }

  return (
    <AppShell searchPlaceholder="Search CRM customer, lead or ticket…">
      <section className="page-content crm-v2">
        <header className="crm-v2-head">
          <div>
            <span className="crm-v2-eyebrow"><UsersRound size={14} /> CRM · {selectedBranch}</span>
            <h1>Customer Management</h1>
            <p>Hover a card to peek · click to expand a fluid 360° profile with Apple-smooth motion.</p>
          </div>
          <div className="crm-v2-head-actions">
            <button type="button" className="crm-v2-btn gold" onClick={() => setOpen(true)}>
              <UserPlus size={16} /> Add customer
            </button>
            <button type="button" className="crm-v2-btn ghost" onClick={() => { setTab("Leads"); flash("Lead capture ready"); }}>
              <Plus size={16} /> New lead
            </button>
            <Link className="crm-v2-btn ghost" href="/pos"><Sparkles size={16} /> Start sale</Link>
          </div>
        </header>

        <section className="crm-v2-kpis" aria-label="CRM KPIs">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article className={`crm-v2-kpi tone-${kpi.tone}`} key={kpi.label}>
                <div className="crm-v2-kpi-icon"><Icon size={18} /></div>
                <div>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        <div className="crm-v2-alerts" role="status">
          <span className="crm-v2-alert info"><Cake size={15} /> 2 birthdays this week — personalized offers ready</span>
          <span className="crm-v2-alert warn"><Bell size={15} /> 3 follow-ups overdue on bridal leads</span>
          <span className="crm-v2-alert gold"><Gift size={15} /> Anniversary reward codes generated for VIP tier</span>
        </div>

        <nav className="crm-glass crm-v2-tabs" aria-label="CRM sections">
          {CRM_TABS.map((t) => (
            <button key={t} type="button" className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>

        {tab === "Directory" ? (
          <>
            <section className="crm-glass crm-v2-tools">
              <div className="crm-v2-search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Smart search — name, mobile, code, city, email…"
                  aria-label="Search customers"
                />
              </div>
              <div className="crm-v2-segments" role="group" aria-label="Segments">
                {SEGMENTS.map((s) => (
                  <button key={s} type="button" className={segment === s ? "active" : ""} onClick={() => setSegment(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <section className="crm-v2-deck-wrap">
              <div className="crm-v2-section-head crm-v2-deck-head">
                <h2>Directory cards</h2>
                <span>{filtered.length} profiles · hover peek · click expand</span>
              </div>
              <div className={`crm-v2-deck ${expanded ? "has-expand" : ""}`}>
                {filtered.map((c, index) => {
                  const cSpend = spendMap.get(c.name) ?? 0;
                  const t = tierFor(cSpend, c.type);
                  const cClv = clvFor(cSpend, 2 + hashN(c.id, 5));
                  const isActive = selected?.id === c.id && expanded;
                  const isPeek = hoveredId === c.id && !isActive;
                  return (
                    <article
                      key={c.id}
                      className={`crm-glass crm-v2-exp-card ${isActive ? "expanded" : ""} ${isPeek ? "peek" : ""}`}
                      style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
                      onMouseEnter={() => setHoveredId(c.id)}
                      onMouseLeave={() => setHoveredId((id) => (id === c.id ? null : id))}
                      onClick={() => openProfile(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openProfile(c.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isActive}
                    >
                      <div className="crm-v2-exp-face">
                        <span className="crm-v2-avatar">{initials(c.name)}</span>
                        <div className="crm-v2-exp-copy">
                          <strong>{c.name}</strong>
                          <small>{c.code} · {c.city || "—"}</small>
                        </div>
                        <em className={`tier ${t.name.toLowerCase()}`}>{t.name}</em>
                      </div>
                      <div className="crm-v2-exp-meta">
                        <span>{srsLabel(c.type)}</span>
                        <b>{cSpend ? formatINR(cSpend) : "New"}</b>
                      </div>
                      <div className={`crm-v2-exp-peek ${isPeek ? "show" : ""}`} aria-hidden={!isPeek}>
                        <div><span>CLV</span><strong>{formatINR(cClv)}</strong></div>
                        <div><span>Loyalty</span><strong>{t.pts.toLocaleString("en-IN")} pts</strong></div>
                        <div><span>Mobile</span><strong>{c.mobile}</strong></div>
                        <div className="crm-v2-exp-peek-cta">Click to open 360°</div>
                      </div>
                    </article>
                  );
                })}
                {filtered.length === 0 ? (
                  <div className="crm-glass crm-v2-empty crm-v2-deck-empty">
                    <UsersRound size={32} />
                    <strong>No matches</strong>
                    <p>Try another segment or clear search.</p>
                  </div>
                ) : null}
              </div>

              <div className={`crm-v2-expand-stage ${expanded && selected && tier ? "open" : ""}`} aria-hidden={!expanded}>
                {expanded && selected && tier ? (
                  <Profile360
                    key={selected.id}
                    customer={selected}
                    spend={spend}
                    clv={clv}
                    tier={tier}
                    profileTab={profileTab}
                    setProfileTab={setProfileTab}
                    invoices={customerInvoices}
                    repairs={customerRepairs}
                    recommendations={recommendations}
                    rates={rates}
                    note={note}
                    setNote={setNote}
                    onSaveNote={saveNote}
                    flash={flash}
                    onClose={closeProfile}
                  />
                ) : null}
              </div>
            </section>
          </>
        ) : null}

        {tab === "Leads" ? (
          <div className="crm-v2-grid equal">
            <section className="crm-glass">
              <div className="crm-v2-section-head">
                <h2><Sparkles size={16} /> Lead & enquiry pipeline</h2>
                <button type="button" className="crm-v2-btn gold compact" onClick={() => flash("Lead form opened")}>
                  <Plus size={14} /> Capture
                </button>
              </div>
              <div className="crm-v2-table-wrap">
                <table className="crm-v2-table">
                  <thead>
                    <tr><th>Lead</th><th>Interest</th><th>Source</th><th>Owner</th><th>Stage</th><th>Est. value</th></tr>
                  </thead>
                  <tbody>
                    {LEADS.map((l) => (
                      <tr key={l.id}>
                        <td><strong>{l.name}</strong></td>
                        <td>{l.interest}</td>
                        <td>{l.source}</td>
                        <td>{l.owner}</td>
                        <td><em className={l.stage === "Hot" ? "hot" : "warm"}>{l.stage}</em></td>
                        <td><strong>{formatINR(l.value)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="crm-glass crm-v2-ai">
              <div className="crm-v2-section-head"><h2><Sparkles size={16} /> AI lead tips</h2></div>
              <ul className="crm-v2-ai-list">
                <li><strong>Hot bridal</strong><small>Ananya Rao — send sapphire set lookbook within 2 hours.</small></li>
                <li><strong>Referral unlock</strong><small>Sneha Kapoor — attach thank-you voucher to referrer wallet.</small></li>
                <li><strong>B2B nurture</strong><small>Vikram Seth — schedule vault viewing with rate lock.</small></li>
              </ul>
            </section>
          </div>
        ) : null}

        {tab === "Appointments" ? (
          <div className="crm-v2-grid equal">
            <section className="crm-glass">
              <div className="crm-v2-section-head">
                <h2><CalendarDays size={16} /> Appointments & follow-ups</h2>
                <button type="button" className="crm-v2-btn ghost compact" onClick={() => flash("Reminder SMS queued")}>
                  <Bell size={14} /> Remind all
                </button>
              </div>
              <div className="crm-v2-cards">
                {APPOINTMENTS.map((a) => (
                  <article className="crm-v2-soft-card" key={a.id}>
                    <strong>{a.customer}</strong>
                    <span>{a.type}</span>
                    <small>{a.when} · {a.branch}</small>
                    <em>{a.status}</em>
                  </article>
                ))}
              </div>
            </section>
            <section className="crm-glass">
              <div className="crm-v2-section-head"><h2>Tasks</h2></div>
              <div className="crm-v2-task-list">
                {[
                  "Call John Smith — diamond studs follow-up",
                  "Send Priya Mehta repair photo via WhatsApp",
                  "Prepare GST docs for Zara Jewels",
                  "Book vault slot for Raj Gems viewing",
                ].map((t) => (
                  <label key={t} className="crm-v2-task">
                    <input type="checkbox" onChange={() => flash("Task updated")} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "Loyalty" ? (
          <div className="crm-v2-grid">
            <section className="crm-glass">
              <div className="crm-v2-section-head"><h2><Gift size={16} /> Membership tiers</h2></div>
              <div className="crm-v2-tier-grid">
                {[
                  { name: "Member", perks: "1 pt / ₹150 · birthday SMS" },
                  { name: "Silver", perks: "Priority repair · 5% making off" },
                  { name: "Gold", perks: "Rate lock windows · exclusive previews" },
                  { name: "Platinum", perks: "Personal jeweller · vault appointments" },
                ].map((t) => (
                  <article key={t.name} className={`crm-v2-tier-card ${t.name.toLowerCase()}`}>
                    <strong>{t.name}</strong>
                    <small>{t.perks}</small>
                    <span>{customers.filter((c) => tierFor(spendMap.get(c.name) ?? 0, c.type).name === t.name).length} customers</span>
                  </article>
                ))}
              </div>
            </section>
            <aside className="crm-v2-side">
              <section className="crm-glass">
                <div className="crm-v2-section-head"><h2>Personalized offers</h2></div>
                <div className="crm-v2-list">
                  <div><strong>VIP bridal boost</strong><span>-8% making</span><small>Expires Sunday</small></div>
                  <div><strong>Referral reward</strong><span>₹5,000</span><small>Wallet credit</small></div>
                  <div><strong>Anniversary sparkle</strong><span>Free polish</span><small>Auto-SMS</small></div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {tab === "Tickets" ? (
          <section className="crm-glass">
            <div className="crm-v2-section-head">
              <h2><Ticket size={16} /> Support tickets</h2>
              <button type="button" className="crm-v2-btn gold compact" onClick={() => flash("Ticket draft created")}><Plus size={14} /> New ticket</button>
            </div>
            <div className="crm-v2-table-wrap">
              <table className="crm-v2-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Subject</th><th>Channel</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {TICKETS.map((t) => (
                    <tr key={t.id}>
                      <td><code>{t.id.toUpperCase()}</code></td>
                      <td>{t.customer}</td>
                      <td>{t.subject}</td>
                      <td>{t.channel}</td>
                      <td><em className={t.priority === "High" ? "hot" : "warm"}>{t.priority}</em></td>
                      <td>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {tab === "Analytics" ? (
          <div className="crm-v2-grid">
            <section className="crm-glass">
              <div className="crm-v2-section-head"><h2>Spending by segment</h2></div>
              <div className="crm-v2-bars">
                {(["vip", "retail", "wholesale", "walk_in"] as CustomerType[]).map((type) => {
                  const value = customers
                    .filter((c) => c.type === type)
                    .reduce((s, c) => s + (spendMap.get(c.name) ?? 0), 0);
                  const max = Math.max(...CUSTOMER_TYPES.map((t) =>
                    customers.filter((c) => c.type === t).reduce((s, c) => s + (spendMap.get(c.name) ?? 0), 0),
                  ), 1);
                  const pct = Math.round((value / max) * 100);
                  return (
                    <div key={type}>
                      <div className="crm-v2-bar-top"><span>{srsLabel(type)}</span><strong>{formatINR(value)}</strong></div>
                      <div className="crm-v2-bar-track"><span style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
            <aside className="crm-v2-side">
              <section className="crm-glass crm-v2-ai">
                <div className="crm-v2-section-head"><h2><Sparkles size={16} /> CRM insights</h2></div>
                <ul className="crm-v2-ai-list">
                  <li><strong>CLV leaders</strong><small>Wholesale accounts drive 60%+ of posted revenue this quarter.</small></li>
                  <li><strong>Retention</strong><small>VIPs with 2+ invoices show highest repair attach rate.</small></li>
                  <li><strong>Branch mix</strong><small>{selectedBranch} leads bridal appointments; push upsell kits.</small></li>
                </ul>
              </section>
              <section className="crm-glass">
                <div className="crm-v2-section-head"><h2>Quick actions</h2></div>
                <div className="crm-v2-quick-grid">
                  <button type="button" onClick={() => setOpen(true)}><UserPlus size={16} /> Add customer</button>
                  <button type="button" onClick={() => flash("Broadcast queued")}><Mail size={16} /> Email blast</button>
                  <button type="button" onClick={() => flash("WhatsApp template ready")}><MessageCircle size={16} /> WhatsApp</button>
                  <button type="button" onClick={() => flash("Referral codes generated")}><Heart size={16} /> Referrals</button>
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {toast ? <div className="crm-v2-toast" role="status">{toast}</div> : null}
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide crm-v2-modal" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Customer intake</h2>
            <div className="form-grid">
              <label className="field"><span>Full name *</span><div className="field-input"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aisha Khan" /></div></label>
              <label className="field"><span>Mobile *</span><div className="field-input"><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 98765 43210" /></div></label>
              <label className="field"><span>WhatsApp</span><div className="field-input"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Same as mobile if blank" /></div></label>
              <label className="field"><span>Email</span><div className="field-input"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" /></div></label>
              <label className="field"><span>Customer type</span><div className="field-input"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}>{CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{srsLabel(t)}</option>)}</select></div></label>
              <label className="field"><span>Preferred language</span><div className="field-input"><select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}><option value="en">English</option><option value="ar">Arabic</option></select></div></label>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <span>Communication consent</span>
                <div className="consent-row">
                  <label><input type="checkbox" checked={form.consentSms} onChange={(e) => setForm({ ...form, consentSms: e.target.checked })} /> SMS</label>
                  <label><input type="checkbox" checked={form.consentWhatsapp} onChange={(e) => setForm({ ...form, consentWhatsapp: e.target.checked })} /> WhatsApp</label>
                  <label><input type="checkbox" checked={form.consentEmail} onChange={(e) => setForm({ ...form, consentEmail: e.target.checked })} /> Email</label>
                </div>
              </div>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Save customer</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}

function Profile360({
  customer,
  spend,
  clv,
  tier,
  profileTab,
  setProfileTab,
  invoices,
  repairs,
  recommendations,
  rates,
  note,
  setNote,
  onSaveNote,
  flash,
  onClose,
}: {
  customer: Customer;
  spend: number;
  clv: number;
  tier: { name: string; pts: number };
  profileTab: ProfileTab;
  setProfileTab: (t: ProfileTab) => void;
  invoices: { id: string; number: string; total: number; status: string; date: string; lines: { name: string; qty: number; amount: number }[] }[];
  repairs: { id: string; number: string; item: string; issue: string; status: string; balanceDue?: number; date: string }[];
  recommendations: Item[];
  rates: Rates;
  note: string;
  setNote: (v: string) => void;
  onSaveNote: () => void;
  flash: (m: string) => void;
  onClose: () => void;
}) {
  const gstin = `29${customer.code.replace(/\D/g, "").slice(-8) || "AABCU"}1Z5`;
  const kycId = `KYC-${customer.code.slice(-6)}`;
  const appts = APPOINTMENTS.filter((a) => a.customer === customer.name);
  const fallbackAppts = appts.length
    ? appts
    : [
        { id: "x1", customer: customer.name, type: "Try-on · curated pieces", when: "Fri · 5:00 PM", branch: BRANCHES[0], status: "Suggested" },
        { id: "x2", customer: customer.name, type: "Anniversary consult", when: "Next week", branch: BRANCHES[hashN(customer.id, BRANCHES.length)], status: "Open" },
      ];

  return (
    <section className="crm-glass crm-v2-profile crm-v2-profile-animate">
      <button type="button" className="crm-v2-profile-close" onClick={onClose} aria-label="Close profile">
        <X size={18} />
      </button>

      <div className="crm-v2-profile-hero crm-v2-stagger">
        <span className="crm-v2-avatar lg">{initials(customer.name)}</span>
        <div>
          <span className="crm-v2-eyebrow-inline">{customer.code} · {srsLabel(customer.status ?? "active")}</span>
          <h2>{customer.name}</h2>
          <p>
            {srsLabel(customer.type)} · {tier.name} · {customer.city || "—"}
          </p>
        </div>
        <div className="crm-v2-profile-actions">
          <button type="button" className="crm-v2-btn ghost compact" onClick={() => flash("WhatsApp chat opened")}><MessageCircle size={14} /> WA</button>
          <button type="button" className="crm-v2-btn ghost compact" onClick={() => flash("Call started")}><Phone size={14} /> Call</button>
          <Link className="crm-v2-btn gold compact" href="/pos">Sell</Link>
        </div>
      </div>

      <div className="crm-v2-profile-kpis crm-v2-stagger">
        <article><span>Lifetime spend</span><strong>{spend ? formatINR(spend) : "—"}</strong></article>
        <article><span>CLV</span><strong>{formatINR(clv)}</strong></article>
        <article><span>Loyalty pts</span><strong>{tier.pts.toLocaleString("en-IN")}</strong></article>
        <article><span>Orders</span><strong>{invoices.length}</strong></article>
        <article><span>Repairs</span><strong>{repairs.length}</strong></article>
        <article><span>Wishlist</span><strong>3</strong></article>
      </div>

      <div className="crm-v2-profile-tabs crm-v2-stagger" role="tablist">
        {PROFILE_TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={profileTab === t} className={profileTab === t ? "active" : ""} onClick={() => setProfileTab(t)}>{t}</button>
        ))}
      </div>

      <div className="crm-v2-profile-panel crm-v2-fade" key={profileTab}>
        {profileTab === "360°" ? (
          <div className="crm-v2-profile-body">
            <div className="crm-v2-info-grid">
              <div><span>Mobile</span><strong>{customer.mobile}</strong></div>
              <div><span>WhatsApp</span><strong>{customer.whatsapp || customer.mobile}</strong></div>
              <div><span>Email</span><strong>{customer.email || "—"}</strong></div>
              <div><span>Language</span><strong>{(customer.preferredLanguage ?? "en").toUpperCase()}</strong></div>
              <div><span>Birthday</span><strong>{birthdayLabel(customer.id)}</strong></div>
              <div><span>Consent</span><strong>{[customer.consentSms && "SMS", customer.consentWhatsapp && "WA", customer.consentEmail && "Email"].filter(Boolean).join(", ") || "—"}</strong></div>
            </div>
            <div className="crm-v2-section-head" style={{ marginTop: 14 }}>
              <h2><Sparkles size={16} /> AI recommendations</h2>
            </div>
            <div className="crm-v2-reco-grid">
              {recommendations.map((item, idx) => (
                <button key={item.id} type="button" className="crm-v2-reco" onClick={() => flash(`Offered ${item.name}`)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WISHLIST_IMGS[idx % WISHLIST_IMGS.length]} alt="" />
                  <strong>{item.name}</strong>
                  <small>{item.karat} · {formatINR(itemPrice(item, rates))}</small>
                </button>
              ))}
            </div>
            <div className="crm-v2-insight-strip">
              <Sparkles size={14} />
              <p>
                Personalized insight: prefer {customer.type === "vip" ? "high-stone bridal" : "daily-wear 22K"} —
                CLV trending {clv > spend ? "up" : "steady"} with {tier.name} perks unlocked.
              </p>
            </div>
            <div className="crm-v2-timeline">
              <h3>Communication & activity</h3>
              {[
                { t: "2h ago", text: "Follow-up reminder sent on WhatsApp" },
                { t: "Yesterday", text: invoices[0] ? `Invoice ${invoices[0].number} · ${formatINR(invoices[0].total)}` : "Browsed bridal catalog in-store" },
                { t: "3d ago", text: "Wishlist updated · sapphire halo set" },
                { t: "Last week", text: repairs[0] ? `Repair ${repairs[0].number} · ${repairs[0].issue}` : "Loyalty points credited" },
              ].map((row) => (
                <div key={row.t + row.text}>
                  <strong>{row.t}</strong>
                  <span>{row.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {profileTab === "History" ? (
          <div className="crm-v2-table-wrap">
            <table className="crm-v2-table">
              <thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td><code>{inv.number}</code></td>
                    <td>{inv.lines.map((l) => l.name).join(", ")}</td>
                    <td><strong>{formatINR(inv.total)}</strong></td>
                    <td><span className={`status-pill ${srsPillTone(inv.status as never)}`}>{srsLabel(inv.status as never)}</span></td>
                    <td>{inv.date}</td>
                  </tr>
                ))}
                {invoices.length === 0 ? <tr><td colSpan={5} className="empty-note">No purchases yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {profileTab === "Loyalty" ? (
          <div className="crm-v2-profile-body">
            <div className="crm-v2-tier-banner">
              <Star size={18} />
              <div>
                <strong>{tier.name} member</strong>
                <small>{tier.pts.toLocaleString("en-IN")} points · redeem at POS</small>
              </div>
              <button type="button" className="crm-v2-btn gold compact" onClick={() => flash("Reward voucher issued")}>Issue reward</button>
            </div>
            <div className="crm-v2-list">
              <div><strong>Points earned (YTD)</strong><span>+{tier.pts}</span><small>From invoices & referrals</small></div>
              <div><strong>Referral credits</strong><span>{formatINR(5000)}</span><small>1 successful invite</small></div>
              <div><strong>Next tier</strong><span>{tier.name === "Platinum" ? "Max" : "Gold / Platinum"}</span><small>Keep bridal attach high</small></div>
            </div>
          </div>
        ) : null}

        {profileTab === "Wishlist" ? (
          <div className="crm-v2-wish-grid">
            {WISHLIST_IMGS.map((src, i) => (
              <article key={src} className="crm-v2-wish">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
                <strong>{["Sapphire halo set", "Gold studs pair", "Cocktail diamond ring"][i]}</strong>
                <small>Saved · notify when in showroom</small>
                <button type="button" className="crm-v2-btn ghost compact" onClick={() => flash("Wishlist item shared via WhatsApp")}>
                  <Heart size={14} /> Share
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {profileTab === "Comms" ? (
          <div className="crm-v2-comms">
            {[
              { icon: MessageCircle, channel: "WhatsApp", text: "Sent try-on appointment confirmation", when: "Today 10:12" },
              { icon: Mail, channel: "Email", text: "Invoice PDF + hallmark certificate", when: "12 May" },
              { icon: Phone, channel: "SMS", text: "Birthday offer — 5% making off", when: "08 May" },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.when + c.channel} className="crm-v2-comm-row">
                  <span className="crm-v2-comm-icon"><Icon size={16} /></span>
                  <div>
                    <strong>{c.channel}</strong>
                    <small>{c.text}</small>
                  </div>
                  <em>{c.when}</em>
                </div>
              );
            })}
            <div className="crm-v2-quick-grid" style={{ marginTop: 12 }}>
              <button type="button" onClick={() => flash("WhatsApp composer ready")}><MessageCircle size={16} /> WhatsApp</button>
              <button type="button" onClick={() => flash("Email composer ready")}><Mail size={16} /> Email</button>
              <button type="button" onClick={() => flash("SMS queued")}><Phone size={16} /> SMS</button>
            </div>
          </div>
        ) : null}

        {profileTab === "Payments" ? (
          <div className="crm-v2-table-wrap">
            <table className="crm-v2-table">
              <thead><tr><th>Payment</th><th>Method</th><th>Amount</th><th>Against</th><th>Date</th></tr></thead>
              <tbody>
                {(invoices.length ? invoices : [{ id: "p0", number: "—", total: 0, status: "draft", date: "—", lines: [] }]).slice(0, 6).map((inv, i) => (
                  <tr key={`pay-${inv.id}`}>
                    <td><code>PAY-{String(1000 + i)}</code></td>
                    <td>{["UPI", "Card", "Cash", "Bank"][hashN(customer.id + String(i), 4)]}</td>
                    <td><strong>{inv.total ? formatINR(inv.total) : "—"}</strong></td>
                    <td>{inv.number}</td>
                    <td>{inv.date}</td>
                  </tr>
                ))}
                {invoices.length === 0 ? <tr><td colSpan={5} className="empty-note">No payment history yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {profileTab === "Appointments" ? (
          <div className="crm-v2-cards">
            {fallbackAppts.map((a) => (
              <article className="crm-v2-soft-card" key={a.id}>
                <strong>{a.type}</strong>
                <span>{a.when}</span>
                <small>{a.branch}</small>
                <em>{a.status}</em>
                <button type="button" className="crm-v2-btn ghost compact" onClick={() => flash("Appointment reminder sent")}>
                  <Bell size={14} /> Remind
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {profileTab === "Docs" ? (
          <div className="crm-v2-profile-body">
            <div className="crm-v2-info-grid">
              <div><span>KYC ID</span><strong>{kycId}</strong></div>
              <div><span>GSTIN</span><strong>{customer.type === "wholesale" ? gstin : "—"}</strong></div>
              <div><span>ID proof</span><strong>Aadhaar · verified</strong></div>
              <div><span>PAN</span><strong>{customer.type !== "walk_in" ? "ABCDE1234F" : "—"}</strong></div>
            </div>
            <h3 style={{ marginTop: 14 }}>Addresses</h3>
            <div className="crm-v2-list">
              <div><strong>Billing</strong><span>{BRANCHES[0]}</span><small>{customer.city || "India"} · Primary</small></div>
              <div><strong>Delivery</strong><span>Home</span><small><MapPin size={12} /> Same as billing</small></div>
              <div><strong>Branch preference</strong><span>{BRANCHES[hashN(customer.id, BRANCHES.length)]}</span><small>Most visits</small></div>
            </div>
            <div className="crm-v2-docs">
              <button type="button" onClick={() => flash("Document uploaded")}><FileText size={16} /> Upload KYC</button>
              <button type="button" onClick={() => flash("GST certificate attached")}><ClipboardList size={16} /> GST docs</button>
              <button type="button" onClick={() => flash("Invoice pack emailed")}><Mail size={16} /> Share docs</button>
            </div>
          </div>
        ) : null}

        {profileTab === "Service" ? (
          <div className="crm-v2-table-wrap">
            <table className="crm-v2-table">
              <thead><tr><th>Ticket / Repair</th><th>Item</th><th>Issue</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {repairs.map((r) => (
                  <tr key={r.id}>
                    <td><code>{r.number}</code></td>
                    <td>{r.item}</td>
                    <td>{r.issue}</td>
                    <td>{formatINR(r.balanceDue ?? 0)}</td>
                    <td><span className={`status-pill ${srsPillTone(r.status as never)}`}>{srsLabel(r.status as never)}</span></td>
                  </tr>
                ))}
                {TICKETS.filter((t) => t.customer === customer.name).map((t) => (
                  <tr key={t.id}>
                    <td><code>{t.id.toUpperCase()}</code></td>
                    <td>—</td>
                    <td>{t.subject}</td>
                    <td>{t.channel}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
                {repairs.length === 0 && !TICKETS.some((t) => t.customer === customer.name) ? (
                  <tr><td colSpan={5} className="empty-note"><Wrench size={14} /> No open service items.</td></tr>
                ) : null}
              </tbody>
            </table>
            <Link className="crm-v2-btn ghost compact" href="/repairs" style={{ marginTop: 10 }}>Open repairs</Link>
          </div>
        ) : null}

        {profileTab === "Notes" ? (
          <div className="crm-v2-profile-body">
            <label className="crm-v2-note-field">
              <span>Add note / feedback</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Preference: prefers 22K temple sets, avoid cold calls after 8 PM…" rows={3} />
            </label>
            <button type="button" className="crm-v2-btn gold" onClick={onSaveNote}><Plus size={15} /> Save note</button>
            <div className="crm-v2-list" style={{ marginTop: 12 }}>
              <div><strong>Staff note</strong><span>Asha</span><small>Loves sapphire tones · showed halo set from gallery</small></div>
              <div><strong>Review</strong><span>★★★★★</span><small>“Beautiful try-on experience at Main Branch.”</small></div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
