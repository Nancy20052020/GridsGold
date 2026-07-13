"use client";

import { useState } from "react";
import { CheckCircle2, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { COMPANY_CODE, DEFAULT_BRANCH_CODE, INVOICE_NUMBER_PATTERN } from "../lib/srs";
import { BRANCHES, useStore } from "../lib/store";

const BRANCH_CODES: Record<string, string> = {
  "Main Branch": DEFAULT_BRANCH_CODE,
  "Branch 2": "JED-02",
  "Branch 3": "JED-03",
  "Branch 4": "JED-04",
  Vault: "VAULT-01",
};

const tabs = ["Company", "Branches", "Invoice", "Users & Roles", "Preferences"] as const;

const roles = [
  ["System Administrator", "Full access · company-wide"],
  ["Branch Manager", "Operations, approvals, branch reports"],
  ["Cashier / Salesperson", "POS, payments, customer lookup"],
  ["Inventory Controller", "Receiving, transfers, counts, tags"],
  ["Accountant", "Journals, tax, AP/AR, reporting"],
];

export default function SettingsPage() {
  const { theme, toggleTheme, selectedBranch, setBranch } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Company");
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({ trade: "Grids Gold", legal: "Grids Gold Jewellers Pvt Ltd", gstin: "29ABCDE1234F1Z5", currency: "INR (₹)", address: "MG Road, Bengaluru" });
  const [invoice, setInvoice] = useState({ prefix: INVOICE_NUMBER_PATTERN, gst: "3", footer: "Thank you for shopping with Grids Gold.", bilingual: true });

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell searchPlaceholder="Search settings...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <SettingsIcon size={28} />
            <div>
              <span className="eyebrow">Settings</span>
              <h1>Settings</h1>
              <p>Configure your company, branches, invoicing, users and preferences.</p>
            </div>
          </div>
        </div>

        {saved ? <div className="banner-success"><CheckCircle2 size={18} /> Settings saved.</div> : null}

        <div className="settings-layout">
          <aside className="settings-nav">
            {tabs.map((t) => <button key={t} className={t === tab ? "active" : ""} type="button" onClick={() => setTab(t)}>{t}</button>)}
          </aside>

          <div className="settings-body">
            {tab === "Company" ? (
              <article className="erp-panel form-panel">
                <div className="form-grid">
                  <label className="field"><span>Company code</span><div className="field-input"><input readOnly value={COMPANY_CODE} /></div></label>
                  <label className="field"><span>Trade name</span><div className="field-input"><input value={company.trade} onChange={(e) => setCompany({ ...company, trade: e.target.value })} /></div></label>
                  <label className="field"><span>Legal name</span><div className="field-input"><input value={company.legal} onChange={(e) => setCompany({ ...company, legal: e.target.value })} /></div></label>
                  <label className="field"><span>GSTIN</span><div className="field-input"><input value={company.gstin} onChange={(e) => setCompany({ ...company, gstin: e.target.value })} /></div></label>
                  <label className="field"><span>Base currency</span><div className="field-input"><input value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })} /></div></label>
                  <label className="field" style={{ gridColumn: "1 / -1" }}><span>Address</span><div className="field-input"><input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div></label>
                </div>
                <div className="form-actions"><button className="gold-action" type="button" onClick={save}>Save Changes</button></div>
              </article>
            ) : null}

            {tab === "Branches" ? (
              <article className="erp-panel table-panel">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Branch</th><th>Branch code</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                      {BRANCHES.map((b) => (
                        <tr key={b}><td><strong>{b}</strong></td><td>{BRANCH_CODES[b] ?? "—"}</td><td>{b === "Vault" ? "Safe / Vault" : "Showroom"}</td><td><span className="status-pill success">Active</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ) : null}

            {tab === "Invoice" ? (
              <article className="erp-panel form-panel">
                <div className="form-grid">
                  <label className="field"><span>Numbering pattern</span><div className="field-input"><input value={invoice.prefix} onChange={(e) => setInvoice({ ...invoice, prefix: e.target.value })} /></div></label>
                  <label className="field"><span>GST %</span><div className="field-input"><input type="number" value={invoice.gst} onChange={(e) => setInvoice({ ...invoice, gst: e.target.value })} /></div></label>
                  <label className="field" style={{ gridColumn: "1 / -1" }}><span>Invoice footer text</span><div className="field-input"><input value={invoice.footer} onChange={(e) => setInvoice({ ...invoice, footer: e.target.value })} /></div></label>
                  <label className="field pref-row" style={{ gridColumn: "1 / -1" }}>
                    <span>Bilingual invoices (EN + AR)</span>
                    <label className="switch"><input type="checkbox" checked={invoice.bilingual} onChange={(e) => setInvoice({ ...invoice, bilingual: e.target.checked })} /><span /></label>
                  </label>
                </div>
                <div className="form-actions"><button className="gold-action" type="button" onClick={save}>Save Changes</button></div>
              </article>
            ) : null}

            {tab === "Users & Roles" ? (
              <article className="erp-panel table-panel">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Role</th><th>Scope &amp; permissions</th></tr></thead>
                    <tbody>{roles.map(([r, d]) => <tr key={r}><td><strong>{r}</strong></td><td>{d}</td></tr>)}</tbody>
                  </table>
                </div>
              </article>
            ) : null}

            {tab === "Preferences" ? (
              <article className="erp-panel form-panel">
                <div className="pref-row">
                  <div><strong>Theme</strong><small>Switch between light and dark appearance.</small></div>
                  <button className="ghost-action" type="button" onClick={toggleTheme}>
                    {theme === "dark" ? <><Sun size={16} /> Light mode</> : <><Moon size={16} /> Dark mode</>}
                  </button>
                </div>
                <div className="pref-row">
                  <div><strong>Default branch</strong><small>Used for billing and inventory context.</small></div>
                  <select className="select-plain" value={selectedBranch} onChange={(e) => setBranch(e.target.value)}>{BRANCHES.map((b) => <option key={b}>{b}</option>)}</select>
                </div>
                <div className="pref-row">
                  <div><strong>Email notifications</strong><small>Order, repair and low-stock alerts.</small></div>
                  <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
