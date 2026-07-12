"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { CustomerShell } from "../../../components/CustomerShell";
import { ItemImage } from "../../../components/ProductImage";
import { useStore, itemPrice, itemStatus, formatINR } from "../../../lib/store";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const { getItem, rates, wishlist, toggleWishlist, reserve } = useStore();
  const item = getItem(id);

  if (!item) {
    return (
      <CustomerShell>
        <section className="portal-page">
          <div className="empty-state">
            <h2>Product not found</h2>
            <Link className="portal-btn ghost" href="/portal/catalog"><ArrowLeft size={16} /> Back to Collection</Link>
          </div>
        </section>
      </CustomerShell>
    );
  }

  const wished = wishlist.includes(item.id);
  const s = itemStatus(item.stock);
  const metalValue = Math.round(item.weight * (rates[item.karat] ?? 0));

  return (
    <CustomerShell>
      <section className="portal-page">
        <Link className="link-plain" href="/portal/catalog"><ArrowLeft size={15} /> Back to Collection</Link>
        <div className="pdp">
          <div className="pdp-media">
            <ItemImage item={item} className="product-img pdp-img" />
          </div>
          <div className="pdp-info">
            <span className={`status-pill ${s === "In Stock" ? "success" : s === "Low Stock" ? "warning" : "danger"}`}>{s}</span>
            <h1>{item.name}</h1>
            <p className="pdp-sub">{item.category} · {item.karat} · {item.weight} g</p>
            <div className="pdp-price">{formatINR(itemPrice(item, rates))}</div>

            <div className="pdp-breakdown">
              <div><span>Metal value</span><strong>{formatINR(metalValue)}</strong></div>
              <div><span>Making charge</span><strong>{formatINR(item.making)}</strong></div>
              <div><span>Stone value</span><strong>{formatINR(item.stoneValue)}</strong></div>
            </div>

            <div className="pdp-actions">
              <button className="portal-btn" type="button" disabled={s === "Out of Stock"} onClick={() => reserve(item.id)}>
                {s === "Out of Stock" ? "Sold Out" : "Reserve at Branch"}
              </button>
              <button className={`portal-btn ghost ${wished ? "on" : ""}`} type="button" onClick={() => toggleWishlist(item.id)}>
                <Heart size={17} fill={wished ? "currentColor" : "none"} /> {wished ? "In Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            <div className="pdp-trust">
              <span><ShieldCheck size={15} /> BIS Hallmarked</span>
              <span><Sparkles size={15} /> Certified stones</span>
              <span><Truck size={15} /> Insured delivery</span>
            </div>
          </div>
        </div>
      </section>
    </CustomerShell>
  );
}
