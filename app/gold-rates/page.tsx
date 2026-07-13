"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useStore, formatINR, itemPrice, type Karat } from "../lib/store";

const metals: { karat: Karat; label: string; note: string; metalType: string }[] = [
  { karat: "24K", label: "Gold 24K (999)", note: "Pure gold / bars & coins", metalType: "Gold" },
  { karat: "22K", label: "Gold 22K (916)", note: "Standard jewellery gold", metalType: "Gold" },
  { karat: "18K", label: "Gold 18K (750)", note: "Diamond & stone settings", metalType: "Gold" },
  { karat: "925", label: "Silver (925)", note: "Sterling silver", metalType: "Silver" },
  { karat: "PT950", label: "Platinum (PT950)", note: "Platinum jewellery", metalType: "Platinum" },
];

export default function GoldRatesPage() {
  const { rates, setRate, items } = useStore();
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState("Manual entry");
  const [effectiveDate, setEffectiveDate] = useState(
    () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  );

  const previewItems = useMemo(
    () => items.filter((i) => i.stock > 0).slice(0, 4).map((item) => {
      const metal = item.weight * (rates[item.karat] ?? 0);
      const total = itemPrice(item, rates);
      return { name: item.name, karat: item.karat, metal, making: item.making, stone: item.stoneValue, total };
    }),
    [items, rates],
  );

  return (
    <AppShell>
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <TrendingUp size={28} />
            <div>
              <span className="eyebrow">Pricing · SCR-22</span>
              <h1>Gold Rates &amp; Pricing</h1>
              <p>Daily market rates with formula preview — metal + making + stone (FR-123 to FR-128).</p>
            </div>
          </div>
        </div>

        {saved ? (
          <div className="banner-success">
            <CheckCircle2 size={18} /> Rates published · effective {effectiveDate}
          </div>
        ) : null}

        <article className="erp-panel form-panel" style={{ marginBottom: 18 }}>
          <div className="form-grid">
            <label className="field"><span>Rate source</span><div className="field-input"><select value={source} onChange={(e) => setSource(e.target.value)}><option>Manual entry</option><option>Approved feed</option><option>Market import</option></select></div></label>
            <label className="field"><span>Effective from</span><div className="field-input"><input readOnly value={effectiveDate} /></div></label>
            <label className="field"><span>Currency</span><div className="field-input"><input readOnly value="INR (₹)" /></div></label>
          </div>
        </article>

        <div className="rates-grid">
          {metals.map(({ karat, label, note, metalType }) => (
            <article className="erp-panel rate-card" key={karat}>
              <div className="rate-card-head">
                <strong>{label}</strong>
                <span>{metalType} · {note}</span>
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

        <article className="erp-panel table-panel" style={{ marginTop: 18 }}>
          <div className="panel-head" style={{ marginBottom: 12 }}>
            <h2>Pricing preview</h2>
            <span className="muted panel-sub">Formula breakdown for sample items</span>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Item</th><th>Karat</th><th>Metal value</th><th>Making</th><th>Stone</th><th>Selling price</th></tr></thead>
              <tbody>
                {previewItems.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.karat}</td>
                    <td>{formatINR(row.metal)}</td>
                    <td>{formatINR(row.making)}</td>
                    <td>{formatINR(row.stone)}</td>
                    <td><strong>{formatINR(row.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="form-actions" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <button className="gold-action" type="button" onClick={() => { setSaved(true); setEffectiveDate(new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })); }}>
            Save &amp; Publish Rates
          </button>
        </div>
      </section>
    </AppShell>
  );
}
