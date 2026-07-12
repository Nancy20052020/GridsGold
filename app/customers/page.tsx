"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, UsersRound, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore } from "../lib/store";

export default function CustomersPage() {
  const { customers, addCustomer, invoices } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", city: "", type: "Retail" as const });
  const [error, setError] = useState("");

  const visible = useMemo(
    () => customers.filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.mobile.includes(query)),
    [customers, query],
  );

  function spend(name: string) {
    return invoices.filter((i) => i.customer === name).reduce((s, i) => s + i.total, 0);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Name and mobile are required.");
      return;
    }
    addCustomer({ name: form.name.trim(), mobile: form.mobile.trim(), email: form.email.trim(), city: form.city.trim(), type: form.type });
    setForm({ name: "", mobile: "", email: "", city: "", type: "Retail" });
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
              <span className="eyebrow">CRM</span>
              <h1>Customers</h1>
              <p>Retail, wholesale and VIP customers with purchase history.</p>
            </div>
          </div>
          <div className="heading-actions">
            <button className="export-button" type="button" onClick={() => setOpen(true)}><UserPlus size={16} /> Add Customer</button>
          </div>
        </div>

        <section className="erp-kpis">
          <article className="erp-kpi gold"><span>Total Customers</span><strong>{customers.length}</strong></article>
          <article className="erp-kpi violet"><span>VIP</span><strong>{customers.filter((c) => c.type === "VIP").length}</strong></article>
          <article className="erp-kpi blue"><span>Wholesale</span><strong>{customers.filter((c) => c.type === "Wholesale").length}</strong></article>
          <article className="erp-kpi green"><span>Retail</span><strong>{customers.filter((c) => c.type === "Retail").length}</strong></article>
        </section>

        <article className="erp-panel table-panel">
          <div className="table-toolbar">
            <div className="filter-search">
              <Search size={18} />
              <input placeholder="Search by name or mobile..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Mobile</th><th>City</th><th>Type</th><th>Total Spend</th></tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td><strong>{c.name}</strong><br /><small className="muted">{c.email || "—"}</small></td>
                    <td>{c.mobile}</td>
                    <td>{c.city || "—"}</td>
                    <td><span className={`status-pill ${c.type === "VIP" ? "warning" : c.type === "Wholesale" ? "success" : "success"}`}>{c.type}</span></td>
                    <td>{spend(c.name) ? "₹ " + spend(c.name).toLocaleString("en-IN") : "—"}</td>
                  </tr>
                ))}
                {visible.length === 0 ? <tr><td colSpan={6} className="empty-note">No customers found.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <form className="modal-card wide" onSubmit={submit}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            <h2>Add Customer</h2>
            <div className="form-grid">
              <label className="field"><span>Full name *</span><div className="field-input"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aisha Khan" /></div></label>
              <label className="field"><span>Mobile *</span><div className="field-input"><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 98765 43210" /></div></label>
              <label className="field"><span>Email</span><div className="field-input"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" /></div></label>
              <label className="field"><span>Type</span><div className="field-input"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}><option>Retail</option><option>Wholesale</option><option>VIP</option></select></div></label>
            </div>
            {error ? <p className="auth-error">{error}</p> : null}
            <div className="form-actions">
              <button className="ghost-action" type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="gold-action" type="submit">Save Customer</button>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
