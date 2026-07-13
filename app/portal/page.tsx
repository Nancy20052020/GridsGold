"use client";

import Link from "next/link";
import { ArrowRight, Clock, Heart, Package, ShieldCheck, Sparkles, Truck, Wrench } from "lucide-react";
import { isRemovedCategory, PORTAL_CATEGORIES } from "../lib/categories";
import { CustomerShell } from "../components/CustomerShell";
import { ItemImage, ProductImage } from "../components/ProductImage";
import { CATEGORY_IMAGES, CUSTOMER_PORTAL_IMAGES } from "../lib/productImages";
import { useStore, itemPrice, itemStatus, formatINR, firstName } from "../lib/store";

const categories = PORTAL_CATEGORIES.filter((name) => name !== "Others").map((name) => ({
  name,
  icon: name === "Rings" ? "ring" : name === "Necklaces" ? "necklace" : name === "Bangles" ? "bangle" : name === "Earrings" ? "earrings" : "pendant",
}));

const quickModules = [
  { label: "Collection", href: "/portal/catalog", copy: "Browse certified gold" },
  { label: "My Orders", href: "/portal/orders", copy: "Track deliveries" },
  { label: "Repairs", href: "/portal/repairs", copy: "Service status" },
  { label: "Wishlist", href: "/portal/wishlist", copy: "Saved pieces" },
  { label: "Account", href: "/portal/account", copy: "Profile & settings" },
];

export default function CustomerPortalHome() {
  const { items, rates, wishlist, toggleWishlist, reserve, orders, currentUser } = useStore();
  const featured = items.filter((i) => itemStatus(i.stock) !== "Out of Stock" && !isRemovedCategory(i.category)).slice(0, 4);
  const greeting = firstName(currentUser);

  return (
    <CustomerShell>
      <section className="portal-v2-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="portal-v2-hero-bg" src={`/images/${CUSTOMER_PORTAL_IMAGES.hero}`} alt="" />
        <div className="portal-v2-hero-overlay" />
        <div className="portal-v2-hero-inner">
          <span className="portal-eyebrow">
            <Sparkles size={14} /> {greeting ? `Welcome back, ${greeting}` : "Grids Gold · Fine Jewellery"}
          </span>
          <h1>
            Timeless gold, <span>crafted for you</span>.
          </h1>
          <p>
            Discover certified 22K &amp; 18K jewellery, reserve pieces from your branch,
            and track orders and repairs — all in your Grids Gold portal.
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
      </section>

      <section className="portal-v2-modules">
        {quickModules.map((mod) => (
          <Link className="portal-v2-module" href={mod.href} key={mod.href}>
            <strong>{mod.label}</strong>
            <small>{mod.copy}</small>
            <ArrowRight size={16} />
          </Link>
        ))}
      </section>

      <section className="portal-v2-split">
        <div className="portal-v2-visual-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/images/${CUSTOMER_PORTAL_IMAGES.showcase}`} alt="Grids Gold signature collection" />
          <div className="portal-v2-visual-caption">
            <span>Signature collection</span>
            <strong>Sapphire &amp; gold sets</strong>
          </div>
        </div>

        <div className="portal-v2-split-content">
          <div className="portal-section-head">
            <h2>Featured pieces</h2>
            <Link href="/portal/catalog" className="link-plain">See more</Link>
          </div>
          <div className="portal-products portal-products-compact">
            {featured.map((product) => {
              const wished = wishlist.includes(product.id);
              return (
                <article className="portal-product" key={product.id}>
                  <div className="portal-product-media">
                    <Link href={`/portal/product/${product.id}`}><ItemImage item={product} /></Link>
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
        </div>
      </section>

      <section className="portal-v2-craft">
        <div className="portal-v2-craft-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/images/${CUSTOMER_PORTAL_IMAGES.craft}`} alt="Grids Gold craftsmanship" />
        </div>
        <div className="portal-v2-craft-copy">
          <span className="portal-eyebrow light">Craftsmanship</span>
          <h2>Every piece finished by master jewellers</h2>
          <p>
            From hallmark certification to stone setting and polishing — Grids Gold brings
            showroom trust to your digital experience. Reserve online, collect in store.
          </p>
          <ul className="portal-v2-craft-list">
            <li><ShieldCheck size={16} /> BIS hallmark on every gold piece</li>
            <li><Wrench size={16} /> Repairs tracked end-to-end</li>
            <li><Package size={16} /> Insured delivery on orders</li>
          </ul>
          <Link className="portal-btn" href="/portal/catalog">Shop the collection</Link>
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
              <ProductImage image={CATEGORY_IMAGES[category.name]} icon={category.icon} className="product-img category-img" alt="" />
              <strong>{category.name}</strong>
              <small>{items.filter((i) => i.category === category.name).length} designs</small>
            </Link>
          ))}
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
