"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, UsersRound, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { CUSTOMER_TYPES, srsLabel, srsPillTone } from "../lib/srs";
import { useStore, formatINR, type Customer } from "../lib/store";

export default function CustomersPage() {
  const { customers, addCustomer, invoices } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    whatsapp: "",
    email: "",
    city: "",
    type: "retail" as const,
    preferredLanguage: "en",
  });
  const [error, setError] = useState("");

  const visible = useMemo(
    () =>
      customers.filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.mobile.includes(query) ||
          c.code.toLowerCase().includes(query.toLowerCase()),
      ),
    [customers, query],
  );

  function spend(name: string) {
    return invoices.filter((i) => i.customer === name).reduce((s, i) => s + i.total, 0);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Name and mobile are required (FR-032).");
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
    });
    setForm({ name: "", mobile: "", whatsapp: "", email: "", city: "", type: "retail", preferredLanguage: "en" });
    setError("");
    setOpen(false);
  }

  return (
    <AppShell searchPlaceholder="Search customers...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <UsersRound size={28} />
            <div>
              <span className="eyebrow">CRM · SCR-05</span>
              <h1>Customers</h1>
              <p>Unified profiles for retail, wholesale, walk-in and VIP customers.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => setOpen(true)}><UserPlus size={16} /> Add Customer</button>
          </div>
        </div>

        <section className="erp-kpis">
          <article className="erp-kpi gold"><span>Total Customers</span><strong>{customers.length}</strong></article>
          <article className="erp-kpi violet"><span>VIP</span><strong>{customers.filter((c) => c.type === "vip").length}</strong></article>
          <article className="erp-kpi blue"><span>Wholesale</span><strong>{customers.filter((c) => c.type === "wholesale").length}</strong></article>
          <article className="erp-kpi green"><span>Retail</span><strong>{customers.filter((c) => c.type === "retail").length}</strong></article>
        </section>

        <article className="erp-panel table-panel">
          <div className="table-toolbar">
            <div className="filter-search">
              <Search size={18} />
              <input placeholder="Search by name, mobile or customer code..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Mobile / WhatsApp</th><th>City</th><th>Type</th><th>Language</th><th>Total Spend</th></tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} className="clickable" onClick={() => setDetail(c)}>
                    <td>{c.code}</td>
                    <td><strong>{c.name}</strong><br /><small className="muted">{c.email || "—"}</small></td>
                    <td>{c.mobile}{c.whatsapp && c.whatsapp !== c.mobile ? <><br /><small className="muted">WA: {c.whatsapp}</small></> : null}</td>
                    <td>{c.city || "—"}</td>
                    <td><span className={`status-pill ${c.type === "vip" ? "warning" : "success"}`}>{srsLabel(c.type)}</span></td>
                    <td>{(c.preferredLanguage ?? "en").toUpperCase()}</td>
                    <td>{spend(c.name) ? formatINR(spend(c.name)) : "—"}</td>
                  </tr>
                ))}
                {visible.length === 0 ? <tr><td colSpan={7} className="empty-note">No customers found.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Customer Intake</h2>
            <div className="form-grid">
              <label className="field"><span>Full name *</span><div className="field-input"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aisha Khan" /></div></label>
              <label className="field"><span>Mobile *</span><div className="field-input"><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 98765 43210" /></div></label>
              <label className="field"><span>WhatsApp</span><div className="field-input"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Same as mobile if blank" /></div></label>
              <label className="field"><span>Email</span><div className="field-input"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" /></div></label>
              <label className="field"><span>Customer type</span><div className="field-input"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>{CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{srsLabel(t)}</option>)}</select></div></label>
              <label className="field"><span>Preferred language</span><div className="field-input"><select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}><option value="en">English</option><option value="ar">Arabic</option></select></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Save Customer</button>
            </div>
          </form>
        </div>
      ) : null}

      {detail ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card wide">
            <button className="modal-close" type="button" onClick={() => setDetail(null)} aria-label="Close"><X size={18} /></button>
            <h2>{detail.name}</h2>
            <p className="muted" style={{ marginBottom: 16 }}>{detail.code} · {srsLabel(detail.type)} · {srsLabel(detail.status ?? "active")}</p>
            <div className="form-grid">
              <div className="field"><span>Mobile</span><strong>{detail.mobile}</strong></div>
              <div className="field"><span>Email</span><strong>{detail.email || "—"}</strong></div>
              <div className="field"><span>City</span><strong>{detail.city || "—"}</strong></div>
              <div className="field"><span>Lifetime spend</span><strong>{spend(detail.name) ? formatINR(spend(detail.name)) : "—"}</strong></div>
            </div>
            <h3 style={{ marginTop: 20, marginBottom: 10 }}>Transaction timeline</h3>
            <div className="table-scroll">
              <table className="data-table compact">
                <thead><tr><th>Document</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {invoices.filter((i) => i.customer === detail.name).map((i) => (
                    <tr key={i.id}>
                      <td>{i.number}</td>
                      <td>{formatINR(i.total)}</td>
                      <td><span className={`status-pill ${srsPillTone(i.status)}`}>{srsLabel(i.status)}</span></td>
                      <td>{i.date}</td>
                    </tr>
                  ))}
                  {invoices.filter((i) => i.customer === detail.name).length === 0 ? (
                    <tr><td colSpan={4} className="empty-note">No invoices yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
