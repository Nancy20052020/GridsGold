"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, Search } from "lucide-react";
import { CustomerShell } from "../../components/CustomerShell";
import { ItemImage } from "../../components/ProductImage";
import { useStore, itemPrice, itemStatus, formatINR } from "../../lib/store";

const cats = ["All", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants", "Chains", "Others"];

function Catalog() {
  const params = useSearchParams();
  const initial = params.get("cat") ?? "All";
  const { items, rates, wishlist, toggleWishlist, reserve } = useStore();
  const [cat, setCat] = useState(cats.includes(initial) ? initial : "All");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => items.filter((i) => (cat === "All" || i.category === cat) && (!query || i.name.toLowerCase().includes(query.toLowerCase()))),
    [items, cat, query],
  );

  return (
    <section className="portal-page">
      <div className="portal-page-head">
        <div>
          <h1>Our Collection</h1>
          <p>Certified jewellery priced live at today&apos;s gold rate.</p>
        </div>
        <div className="filter-search light">
          <Search size={18} />
          <input placeholder="Search jewellery..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="portal-chips">
        {cats.map((c) => (
          <button className={c === cat ? "active" : ""} key={c} type="button" onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="portal-products four">
        {visible.map((product) => {
          const wished = wishlist.includes(product.id);
          const s = itemStatus(product.stock);
          return (
            <article className="portal-product" key={product.id}>
              <div className="portal-product-media">
                <Link href={`/portal/product/${product.id}`}><ItemImage item={product} /></Link>
                <button type="button" className={`portal-wish ${wished ? "on" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist">
                  <Heart size={16} fill={wished ? "currentColor" : "none"} />
                </button>
              </div>
              <Link href={`/portal/product/${product.id}`} className="portal-product-title">{product.name}</Link>
              <small>{product.karat} · {product.weight} g</small>
              <div className="portal-product-foot">
                <span>{formatINR(itemPrice(product, rates))}</span>
                <button type="button" disabled={s === "Out of Stock"} onClick={() => reserve(product.id)}>
                  {s === "Out of Stock" ? "Sold" : "Reserve"}
                </button>
              </div>
            </article>
          );
        })}
        {visible.length === 0 ? <p className="empty-note">No pieces match your search.</p> : null}
      </div>
    </section>
  );
}

export default function CatalogPage() {
  return (
    <CustomerShell>
      <Suspense fallback={<section className="portal-page"><p className="empty-note">Loading…</p></section>}>
        <Catalog />
      </Suspense>
    </CustomerShell>
  );
}
