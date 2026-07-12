"use client";

import { useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import { CustomerShell } from "../../components/CustomerShell";
import { useStore, firstName } from "../../lib/store";

const steps = ["Received", "In Progress", "Ready", "Delivered"] as const;

export default function CustomerRepairsPage() {
  const { repairs, currentUser } = useStore();
  const [query, setQuery] = useState("");

  const mine = useMemo(() => {
    const name = currentUser?.name;
    const base = name ? repairs.filter((r) => r.customer === name) : repairs;
    const list = base.length ? base : repairs; // fall back to all for demo
    return list.filter((r) => !query || r.number.toLowerCase().includes(query.toLowerCase()) || r.item.toLowerCase().includes(query.toLowerCase()));
  }, [repairs, currentUser, query]);

  return (
    <CustomerShell>
      <section className="portal-page">
        <div className="portal-page-head">
          <div>
            <h1>Track a Repair</h1>
            <p>{firstName(currentUser) ? `Hi ${firstName(currentUser)}, here are your` : "Your"} repair &amp; service jobs.</p>
          </div>
          <div className="filter-search light">
            <Search size={18} />
            <input placeholder="Search by repair # or item..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {mine.length === 0 ? (
          <div className="empty-state">
            <span className="portal-placeholder-icon"><Wrench size={24} /></span>
            <h2>No repairs found</h2>
            <p>When you drop off a piece for repair, track its progress here.</p>
          </div>
        ) : (
          <div className="repair-track-list">
            {mine.map((r) => {
              const current = steps.indexOf(r.status);
              return (
                <article className="repair-track" key={r.id}>
                  <div className="repair-track-top">
                    <div>
                      <strong>{r.item}</strong>
                      <small>{r.number} · {r.issue}</small>
                    </div>
                    <span className={`status-pill ${r.status === "Delivered" || r.status === "Ready" ? "success" : r.status === "In Progress" ? "warning" : "danger"}`}>{r.status}</span>
                  </div>
                  <div className="stepper">
                    {steps.map((s, i) => (
                      <div className={`step ${i <= current ? "done" : ""} ${i === current ? "current" : ""}`} key={s}>
                        <span className="step-dot">{i < current ? "✓" : i + 1}</span>
                        <span className="step-label">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="repair-track-foot">
                    <span>Estimate: ₹ {r.estimate.toLocaleString("en-IN")}</span>
                    <span>Updated {r.date}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </CustomerShell>
  );
}
