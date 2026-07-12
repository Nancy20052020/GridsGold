"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gem, Search, ShoppingCart } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { useStore, itemPrice, itemStatus, formatINR } from "../lib/store";

const cats = ["All", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants", "Gold Bars", "Others"];

export default function JewelryCatalogPage() {
  const { items, rates, addToCart } = useStore();
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => items.filter((i) => (cat === "All" || i.category === cat) && (!query || i.name.toLowerCase().includes(query.toLowerCase()))),
    [items, cat, query],
  );

  return (
    <AppShell searchPlaceholder="Search catalog...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Gem size={28} />
            <div>
              <span className="eyebrow">Product Catalog</span>
              <h1>Jewellery Catalog</h1>
              <p>Full product catalog with live gold-rate pricing.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="export-button" href="/inventory/new">Add Product</Link>
          </div>
        </div>

        <article className="erp-panel">
          <div className="table-toolbar">
            <div className="filter-search">
              <Search size={18} />
              <input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="category-tabs compact-tabs" style={{ marginBottom: 18 }}>
            {cats.map((c) => <button className={c === cat ? "active" : ""} key={c} type="button" onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="catalog-grid">
            {visible.map((item) => {
              const s = itemStatus(item.stock);
              return (
                <article className="catalog-card" key={item.id}>
                  <Link href={`/inventory/item-details?id=${item.id}`} className="catalog-media">
                    <ItemImage item={item} className="product-img catalog-img" />
                  </Link>
                  <span className={`status-pill ${s === "In Stock" ? "success" : s === "Low Stock" ? "warning" : "danger"}`}>{s}</span>
                  <strong>{item.name}</strong>
                  <small>{item.karat} · {item.weight} g · {item.category}</small>
                  <div className="catalog-foot">
                    <span>{formatINR(itemPrice(item, rates))}</span>
                    <button type="button" disabled={s === "Out of Stock"} onClick={() => addToCart(item.id)} aria-label="Add to sale"><ShoppingCart size={15} /></button>
                  </div>
                </article>
              );
            })}
            {visible.length === 0 ? <p className="empty-note">No products found.</p> : null}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
