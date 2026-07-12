"use client";

import { useState } from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR, type Karat } from "../lib/store";

const metals: { karat: Karat; label: string; note: string }[] = [
  { karat: "24K", label: "Gold 24K (999)", note: "Pure gold / bars & coins" },
  { karat: "22K", label: "Gold 22K (916)", note: "Standard jewellery gold" },
  { karat: "18K", label: "Gold 18K (750)", note: "Diamond & stone settings" },
  { karat: "925", label: "Silver (925)", note: "Sterling silver" },
  { karat: "PT950", label: "Platinum (PT950)", note: "Platinum jewellery" },
];

export default function GoldRatesPage() {
  const { rates, setRate } = useStore();
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <TrendingUp size={28} />
            <div>
              <span className="eyebrow">Metal Rates</span>
              <h1>Live Gold Rates</h1>
              <p>Update the daily rate per gram. Prices across POS, catalog and inventory recalculate instantly.</p>
            </div>
          </div>
        </div>

        {saved ? (
          <div className="banner-success">
            <CheckCircle2 size={18} /> Rates updated — pricing refreshed everywhere.
          </div>
        ) : null}

        <div className="rates-grid">
          {metals.map(({ karat, label, note }) => (
            <article className="erp-panel rate-card" key={karat}>
              <div className="rate-card-head">
                <strong>{label}</strong>
                <span>{note}</span>
              </div>
              <label className="field">
                <span>Rate per gram (₹)</span>
                <div className="field-input">
                  <input
                    type="number"
                    value={rates[karat]}
                    onChange={(event) => {
                      setRate(karat, Number(event.target.value) || 0);
                      setSaved(false);
                    }}
                  />
                </div>
              </label>
              <div className="rate-example">
                10 g ≈ <strong>{formatINR(rates[karat] * 10)}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <button className="gold-action" type="button" onClick={() => setSaved(true)}>
            Save &amp; Publish Rates
          </button>
        </div>
      </section>
    </AppShell>
  );
}
