"use client";

import Link from "next/link";
import { ArrowRight, Clock, Heart, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { CustomerShell } from "../components/CustomerShell";

const categories = [
  { name: "Rings", icon: "ring", count: "240+ designs" },
  { name: "Necklaces", icon: "necklace", count: "180+ designs" },
  { name: "Bangles", icon: "bangle", count: "150+ designs" },
  { name: "Earrings", icon: "earrings", count: "210+ designs" },
  { name: "Pendants", icon: "pendant", count: "95+ designs" },
  { name: "Chains", icon: "chain", count: "120+ designs" },
];

const featured = [
  { name: "Heritage Gold Necklace", meta: "22K · 21.870 g", price: "₹ 1,85,900", icon: "necklace" },
  { name: "Classic 22K Ring", meta: "22K · 5.250 g", price: "₹ 38,051", icon: "ring" },
  { name: "Diamond Drop Earrings", meta: "18K · 6.120 g", price: "₹ 72,031", icon: "earrings" },
  { name: "Royal Gold Bangle", meta: "22K · 15.300 g", price: "₹ 1,21,759", icon: "bangle" },
];

const orders = [
  { id: "ORD-1258", item: "Gold Necklace Set", status: "Out for delivery", tone: "warning", icon: Truck },
  { id: "ORD-1231", item: "22K Gold Ring", status: "Delivered", tone: "success", icon: Package },
];

export default function CustomerPortalHome() {
  return (
    <CustomerShell>
      <section className="portal-hero">
        <div className="portal-hero-copy">
          <span className="portal-eyebrow">
            <Sparkles size={14} /> New Bridal Collection 2026
          </span>
          <h1>
            Timeless gold, <span>crafted for you</span>.
          </h1>
          <p>
            Browse certified 22K &amp; 18K jewellery, track your orders and repairs, and
            reserve pieces from your nearest Grids Gold branch.
          </p>
          <div className="portal-hero-actions">
            <Link className="portal-btn" href="/portal">
              Explore Collection <ArrowRight size={18} />
            </Link>
            <Link className="portal-btn ghost" href="/portal/repairs">
              Track a Repair
            </Link>
          </div>
          <div className="portal-hero-trust">
            <span><ShieldCheck size={15} /> BIS Hallmarked</span>
            <span><Sparkles size={15} /> Certified Stones</span>
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
          <Link href="/portal" className="link-plain">View all</Link>
        </div>
        <div className="portal-categories">
          {categories.map((category) => (
            <Link className="portal-category" href="/portal" key={category.name}>
              <span className={`jewel-icon ${category.icon}`} />
              <strong>{category.name}</strong>
              <small>{category.count}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Featured pieces</h2>
          <Link href="/portal" className="link-plain">See more</Link>
        </div>
        <div className="portal-products">
          {featured.map((product) => (
            <article className="portal-product" key={product.name}>
              <div className="portal-product-media">
                <span className={`jewel-icon ${product.icon}`} />
                <button type="button" className="portal-wish" aria-label="Add to wishlist">
                  <Heart size={16} />
                </button>
              </div>
              <strong>{product.name}</strong>
              <small>{product.meta}</small>
              <div className="portal-product-foot">
                <span>{product.price}</span>
                <button type="button">Reserve</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Your recent orders</h2>
          <Link href="/portal/orders" className="link-plain">All orders</Link>
        </div>
        <div className="portal-orders">
          {orders.map(({ id, item, status, tone, icon: Icon }) => (
            <article className="portal-order" key={id}>
              <span className="portal-order-icon">
                <Icon size={18} />
              </span>
              <div>
                <strong>{item}</strong>
                <small>Order #{id}</small>
              </div>
              <span className={`status-pill ${tone}`}>{status}</span>
              <Link href="/portal/orders" className="portal-order-link" aria-label="View order">
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
          <article className="portal-repair-card">
            <span className="portal-order-icon">
              <Clock size={18} />
            </span>
            <div>
              <strong>Ring resizing</strong>
              <small>Repair #REP-1023 · Ready for pickup</small>
            </div>
            <Link href="/portal/repairs" className="portal-btn ghost small">
              Track
            </Link>
          </article>
        </div>
      </section>
    </CustomerShell>
  );
}
