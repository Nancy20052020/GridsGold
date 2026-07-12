"use client";

import Link from "next/link";
import { ArrowRight, Clock, Heart, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { CustomerShell } from "../components/CustomerShell";
import { useStore, itemPrice, itemStatus, formatINR, firstName } from "../lib/store";

const categories = [
  { name: "Rings", icon: "ring" },
  { name: "Necklaces", icon: "necklace" },
  { name: "Bangles", icon: "bangle" },
  { name: "Earrings", icon: "earrings" },
  { name: "Pendants", icon: "pendant" },
  { name: "Chains", icon: "chain" },
];

export default function CustomerPortalHome() {
  const { items, rates, wishlist, toggleWishlist, reserve, orders, currentUser } = useStore();
  const featured = items.filter((i) => itemStatus(i.stock) !== "Out of Stock").slice(0, 4);
  const greeting = firstName(currentUser);

  return (
    <CustomerShell>
      <section className="portal-hero">
        <div className="portal-hero-copy">
          <span className="portal-eyebrow">
            <Sparkles size={14} /> {greeting ? `Welcome back, ${greeting}` : "New Bridal Collection 2026"}
          </span>
          <h1>
            Timeless gold, <span>crafted for you</span>.
          </h1>
          <p>
            Browse certified 22K &amp; 18K jewellery, track your orders and repairs, and
            reserve pieces from your nearest Grids Gold branch.
          </p>
          <div className="portal-hero-actions">
            <Link className="portal-btn" href="/portal/catalog">
              Explore Collection <ArrowRight size={18} />
            </Link>
            <Link className="portal-btn ghost" href="/portal/repairs">
              Track a Repair
            </Link>
          </div>
          <div className="portal-hero-trust">
            <span><ShieldCheck size={15} /> BIS Hallmarked</span>
            <span><Sparkles size={15} /> Live 22K ₹ {rates["22K"].toLocaleString("en-IN")}/gm</span>
            <span><Truck size={15} /> Insured Delivery</span>
          </div>
        </div>
        <div className="portal-hero-visual" aria-hidden="true">
          <span className="jewel-icon necklace" />
          <div className="portal-hero-note">
            <small>Add product images in</small>
            <strong>/public/images</strong>
          </div>
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Shop by category</h2>
          <Link href="/portal/catalog" className="link-plain">View all</Link>
        </div>
        <div className="portal-categories">
          {categories.map((category) => (
            <Link className="portal-category" href={`/portal/catalog?cat=${category.name}`} key={category.name}>
              <span className={`jewel-icon ${category.icon}`} />
              <strong>{category.name}</strong>
              <small>{items.filter((i) => i.category === category.name).length} designs</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Featured pieces</h2>
          <Link href="/portal/catalog" className="link-plain">See more</Link>
        </div>
        <div className="portal-products">
          {featured.map((product) => {
            const wished = wishlist.includes(product.id);
            return (
              <article className="portal-product" key={product.id}>
                <div className="portal-product-media">
                  <Link href={`/portal/product/${product.id}`}><span className={`jewel-icon ${product.icon || "ring"}`} /></Link>
                  <button
                    type="button"
                    className={`portal-wish ${wished ? "on" : ""}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Toggle wishlist"
                  >
                    <Heart size={16} fill={wished ? "currentColor" : "none"} />
                  </button>
                </div>
                <Link href={`/portal/product/${product.id}`} className="portal-product-title">{product.name}</Link>
                <small>{product.karat} · {product.weight} g</small>
                <div className="portal-product-foot">
                  <span>{formatINR(itemPrice(product, rates))}</span>
                  <button type="button" onClick={() => reserve(product.id)}>Reserve</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Your recent orders</h2>
          <Link href="/portal/orders" className="link-plain">All orders</Link>
        </div>
        <div className="portal-orders">
          {orders.slice(0, 2).map((order) => (
            <article className="portal-order" key={order.id}>
              <span className="portal-order-icon">
                {order.status === "Delivered" ? <Package size={18} /> : <Truck size={18} />}
              </span>
              <div>
                <strong>{order.name}</strong>
                <small>{formatINR(order.amount)} · {order.date}</small>
              </div>
              <span className={`status-pill ${order.status === "Delivered" ? "success" : "warning"}`}>{order.status}</span>
              <Link href="/portal/orders" className="portal-order-link" aria-label="View order">
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
          <article className="portal-repair-card">
            <span className="portal-order-icon"><Clock size={18} /></span>
            <div>
              <strong>Ring resizing</strong>
              <small>Repair #REP-2026-000028 · Ready for pickup</small>
            </div>
            <Link href="/portal/repairs" className="portal-btn ghost small">Track</Link>
          </article>
        </div>
      </section>
    </CustomerShell>
  );
}
