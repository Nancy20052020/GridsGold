"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { useStore, itemPrice, itemStatus, formatINR } from "../../lib/store";

function ItemDetail() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { getItem, rates, addToCart } = useStore();
  const item = getItem(id);

  if (!item) {
    return (
      <section className="page-content">
        <div className="empty-state">
          <h2>Item not found</h2>
          <Link className="ghost-action" href="/inventory"><ArrowLeft size={16} /> Back to Inventory</Link>
        </div>
      </section>
    );
  }

  const status = itemStatus(item.stock);
  const metalValue = Math.round(item.weight * (rates[item.karat] ?? 0));

  const specs: [string, string][] = [
    ["SKU / Barcode", item.sku],
    ["Category", item.category],
    ["Purity", item.karat],
    ["Gross Weight", `${item.weight.toFixed(3)} g`],
    ["Making Charge", formatINR(item.making)],
    ["Stone Value", formatINR(item.stoneValue)],
    ["Location", item.branch],
    ["Stock", `${item.stock} pcs`],
  ];

  return (
    <section className="page-content">
      <div className="page-heading">
        <div className="heading-copy">
          <div>
            <span className="eyebrow">Inventory · Item</span>
            <h1>{item.name}</h1>
            <p>{item.sku} · {item.branch}</p>
          </div>
        </div>
        <div className="heading-actions">
          <Link className="ghost-action" href="/inventory"><ArrowLeft size={16} /> Back</Link>
          <button className="export-button" type="button" disabled={status === "Out of Stock"} onClick={() => addToCart(item.id)}>
            <ShoppingCart size={16} /> Add to Sale
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <article className="erp-panel media-panel">
          <div className="product-photo"><span className={`jewel-icon ${item.icon || "ring"}`} /></div>
          <div className="detail-note">Add real photos in <strong>/public/images</strong></div>
        </article>

        <article className="erp-panel">
          <div className="panel-title-row">
            <h2>Specifications</h2>
            <span className={`status-pill ${status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "danger"}`}>{status}</span>
          </div>
          <div className="spec-grid">
            {specs.map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
        </article>

        <article className="erp-panel timeline-panel">
          <h2>Pricing (live)</h2>
          <div className="price-rows">
            <div><span>Metal value ({item.weight} g × {formatINR(rates[item.karat] ?? 0)})</span><strong>{formatINR(metalValue)}</strong></div>
            <div><span>Making charge</span><strong>{formatINR(item.making)}</strong></div>
            <div><span>Stone value</span><strong>{formatINR(item.stoneValue)}</strong></div>
            <div className="price-total"><span>Selling price</span><strong>{formatINR(itemPrice(item, rates))}</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function ItemDetailPage() {
  return (
    <AppShell>
      <Suspense fallback={<section className="page-content"><p className="empty-note">Loading…</p></section>}>
        <ItemDetail />
      </Suspense>
    </AppShell>
  );
}
