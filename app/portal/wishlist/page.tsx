"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { CustomerShell } from "../../components/CustomerShell";
import { useStore, itemPrice, formatINR } from "../../lib/store";

export default function WishlistPage() {
  const { items, rates, wishlist, toggleWishlist, reserve } = useStore();
  const saved = items.filter((i) => wishlist.includes(i.id));

  return (
    <CustomerShell>
      <section className="portal-page">
        <div className="portal-page-head">
          <div>
            <h1>My Wishlist</h1>
            <p>{saved.length} saved {saved.length === 1 ? "piece" : "pieces"}.</p>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="empty-state">
            <span className="portal-placeholder-icon"><Heart size={24} /></span>
            <h2>Your wishlist is empty</h2>
            <p>Tap the heart on any piece to save it here.</p>
            <Link className="portal-btn" href="/portal/catalog">Browse Collection</Link>
          </div>
        ) : (
          <div className="portal-products four">
            {saved.map((product) => (
              <article className="portal-product" key={product.id}>
                <div className="portal-product-media">
                  <Link href={`/portal/product/${product.id}`}><span className={`jewel-icon ${product.icon || "ring"}`} /></Link>
                  <button type="button" className="portal-wish on" onClick={() => toggleWishlist(product.id)} aria-label="Remove"><Trash2 size={15} /></button>
                </div>
                <Link href={`/portal/product/${product.id}`} className="portal-product-title">{product.name}</Link>
                <small>{product.karat} · {product.weight} g</small>
                <div className="portal-product-foot">
                  <span>{formatINR(itemPrice(product, rates))}</span>
                  <button type="button" onClick={() => reserve(product.id)}>Reserve</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </CustomerShell>
  );
}
