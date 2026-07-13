"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, LogOut, MapPin, Moon, Sun, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomerShell } from "../../components/CustomerShell";
import { useStore } from "../../lib/store";

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, updateUser, logout, theme, toggleTheme } = useStore();
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    mobile: currentUser?.mobile ?? "",
    city: currentUser?.city ?? "",
  });
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateUser({ name: form.name.trim(), mobile: form.mobile.trim(), city: form.city.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function signOut() {
    logout();
    router.push("/login");
  }

  if (!currentUser) {
    return (
      <CustomerShell>
        <section className="portal-page">
          <div className="empty-state">
            <span className="portal-placeholder-icon"><UserRound size={24} /></span>
            <h2>You&apos;re not signed in</h2>
            <p>Sign in to view and manage your account.</p>
            <Link className="portal-btn" href="/login">Sign in</Link>
          </div>
        </section>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <section className="portal-page">
        <div className="portal-page-head">
          <div>
            <h1>My Account</h1>
            <p>Manage your profile, preferences and addresses.</p>
          </div>
          <button className="portal-btn ghost" type="button" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>

        {saved ? <div className="banner-success"><CheckCircle2 size={18} /> Profile saved.</div> : null}

        <div className="account-grid">
          <form className="erp-panel form-panel" onSubmit={save}>
            <h2 style={{ marginBottom: 14 }}>Profile</h2>
            <div className="form-grid">
              <label className="field"><span>Full name</span><div className="field-input"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div></label>
              <label className="field"><span>Email</span><div className="field-input"><input value={form.email} disabled /></div></label>
              <label className="field"><span>Mobile</span><div className="field-input"><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 ..." /></div></label>
              <label className="field"><span>City</span><div className="field-input"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" /></div></label>
            </div>
            <div className="form-actions"><button className="gold-action" type="submit">Save Profile</button></div>
          </form>

          <div className="account-side">
            <article className="erp-panel">
              <h2 style={{ marginBottom: 14 }}>Preferences</h2>
              <div className="pref-row">
                <div><strong>Theme</strong><small>Light or dark appearance.</small></div>
                <button className="ghost-action" type="button" onClick={toggleTheme}>{theme === "dark" ? <><Sun size={16} /> Light</> : <><Moon size={16} /> Dark</>}</button>
              </div>
              <div className="pref-row">
                <div><strong>Order &amp; repair emails</strong><small>Updates about your orders and repairs.</small></div>
                <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
              </div>
              <div className="pref-row">
                <div><strong>Offers &amp; promotions</strong><small>New collections and festive offers.</small></div>
                <label className="switch"><input type="checkbox" /><span /></label>
              </div>
            </article>

            <article className="erp-panel">
              <div className="panel-title-row"><h2>Default address</h2><MapPin size={18} /></div>
              <p className="muted" style={{ lineHeight: 1.6 }}>
                {form.name || "—"}<br />
                {form.city ? `${form.city}, India` : "Add your address"}<br />
                {form.mobile || ""}
              </p>
            </article>
          </div>
        </div>
      </section>
    </CustomerShell>
  );
}
