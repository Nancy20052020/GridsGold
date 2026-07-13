"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gem, Search, ShoppingCart } from "lucide-react";
import { isRemovedCategory, SHOP_CATEGORIES } from "../lib/categories";
import { srsLabel, stockToItemStatus, srsPillTone } from "../lib/srs";
import { AppShell } from "../components/AppShell";
import { ItemImage } from "../components/ProductImage";
import { useStore, itemPrice, formatINR } from "../lib/store";

const cats = ["All", ...SHOP_CATEGORIES.filter((c) => c !== "All")] as const;

export default function JewelryCatalogPage() {
  const { items, rates, addToCart } = useStore();
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () =>
      items.filter(
        (i) =>
          !isRemovedCategory(i.category) &&
          (cat === "All" || i.category === cat) &&
          (!query || i.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, cat, query],
  );

  return (
    <AppShell searchPlaceholder="Search catalog...">
      <section className="page-content">
        <div className="page-heading">
          <div className="heading-copy">
            <Gem size={28} />
            <div>
              <span className="eyebrow">Item Master · SCR-08</span>
              <h1>Jewellery Catalog</h1>
              <p>Canonical item master with metal, karat, weight and live pricing (FR-051 to FR-066).</p>
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
              const srs = stockToItemStatus(item.stock);
              return (
                <article className="catalog-card" key={item.id}>
                  <Link href={`/inventory/item-details?id=${item.id}`} className="catalog-media">
                    <ItemImage item={item} className="product-img catalog-img" />
                  </Link>
                  <span className={`status-pill ${srsPillTone(srs)}`}>{srsLabel(srs)}</span>
                  <strong>{item.name}</strong>
                  <small>{item.sku} · {item.karat} · {item.weight} g · {item.category}</small>
                  <div className="catalog-foot">
                    <span>{formatINR(itemPrice(item, rates))}</span>
                    <button type="button" disabled={item.stock <= 0} onClick={() => addToCart(item.id)} aria-label="Add to sale"><ShoppingCart size={15} /></button>
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
