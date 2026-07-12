"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  Check,
  Factory,
  Gem,
  Handshake,
  LayoutGrid,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UsersRound,
  Wrench,
} from "lucide-react";
import { AuthPanel } from "./components/AuthPanel";
import { BrandMark } from "./components/BrandMark";
import { ScrollReveal } from "./components/ScrollReveal";

const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const stats = [
  { value: "4", label: "Branches synced" },
  { value: "22K", label: "Live gold pricing" },
  { value: "100%", label: "Hallmark ready" },
  { value: "24/7", label: "Customer portal" },
];

const modules = [
  { icon: ShoppingCart, title: "POS & Billing", copy: "Barcode scan, live gold-rate pricing, split payments and instant invoices." },
  { icon: Boxes, title: "Inventory", copy: "Weight, purity, stones and stock across every branch — always in sync." },
  { icon: Wrench, title: "Repairs", copy: "Drop-off to pickup on one ticket. Customers track status in the portal." },
  { icon: UsersRound, title: "Customers", copy: "Profiles, purchase history, loyalty and a polished self-service portal." },
  { icon: TrendingUp, title: "Gold Rates", copy: "Update 22K/18K rates once — prices refresh everywhere instantly." },
  { icon: BarChart3, title: "Reports", copy: "Sales, margins, branch comparison. Export CSV or print to PDF." },
  { icon: Factory, title: "Manufacturing", copy: "Job cards, bench tracking and metal loss from casting to polish." },
  { icon: Handshake, title: "Wholesale", copy: "Bulk orders, dealer pricing and B2B invoicing in one flow." },
];

const flowSteps = [
  "Sell a piece at POS — stock drops and an invoice is created.",
  "Gold rate changes — every tag, catalog price and quote updates.",
  "Customer reserves online — your team sees it in the admin queue.",
  "Repair moves to Ready — the portal notifies them to collect.",
];

const spotlights = [
  {
    badge: "Point of Sale",
    icon: ShoppingBag,
    title: "Bill in seconds. Price by the gram.",
    copy: "Scan barcodes, apply live 22K rates, add making charges and checkout with cash, UPI or split payment. Every sale updates inventory and books automatically.",
    points: ["Barcode & manual lookup", "Live karat pricing", "Printable receipts"],
  },
  {
    badge: "Repair management",
    icon: Wrench,
    title: "From drop-off to pickup on one ticket.",
    copy: "Log repairs with photos, estimated dates and bench status. Customers follow progress in their portal — fewer phone calls, faster pickups.",
    points: ["Status stepper", "Customer notifications", "Pickup reminders"],
    reverse: true,
  },
  {
    badge: "Customer portal",
    icon: Gem,
    title: "A storefront your clients will love.",
    copy: "Browse collections, wishlist pieces, reserve items and track orders & repairs — branded in navy and gold, just like your showroom.",
    points: ["Live catalog", "Wishlist & reserve", "Order tracking"],
  },
];

const plans = [
  {
    name: "Essential",
    price: "₹ 24,999",
    period: "/month",
    note: "Single store getting started",
    features: ["1 branch", "3 staff users", "POS + Inventory", "Customer portal", "Email support"],
  },
  {
    name: "Growth",
    price: "₹ 49,999",
    period: "/month",
    note: "Multi-branch retailers",
    popular: true,
    features: ["Up to 4 branches", "15 staff users", "Repairs + Manufacturing", "Analytics & reports", "Priority onboarding"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    note: "Large chains & partners",
    dark: true,
    features: ["Unlimited branches", "Unlimited users", "Wholesale + API access", "Dedicated success manager", "Custom integrations"],
  },
];

function scrollToAccess() {
  document.getElementById("access")?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingPage() {
  return (
    <div className="landing-site">
      <header className="landing-nav">
        <Link className="landing-nav-brand" href="/">
          <BrandMark className="auth-logo-mark" />
          <div>
            <strong>GRIDS GOLD</strong>
            <span>JEWELLERY ERP</span>
          </div>
        </Link>

        <nav className="landing-nav-links" aria-label="Landing sections">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <button type="button" className="landing-nav-signin" onClick={scrollToAccess}>
            Sign in
          </button>
          <button type="button" className="landing-nav-cta" onClick={scrollToAccess}>
            Get started <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow-a" aria-hidden="true" />
        <div className="landing-hero-glow landing-hero-glow-b" aria-hidden="true" />

        <div className="landing-hero-inner">
          <ScrollReveal className="landing-hero-copy">
            <span className="landing-eyebrow">
              <Sparkles size={14} /> Built for Indian jewellers
            </span>
            <h1>
              Run your jewellery business from <span>one place.</span>
            </h1>
            <p>
              Cut admin in half, catch every repair on time, and know your margin to the gram.
              Retail, repairs, wholesale and manufacturing — with a customer portal your clients will love.
            </p>
            <div className="landing-hero-actions">
              <button type="button" className="landing-btn-primary" onClick={scrollToAccess}>
                Start free trial <ArrowRight size={18} />
              </button>
              <a className="landing-btn-ghost" href="#modules">
                Explore modules
              </a>
            </div>
            <ul className="landing-hero-checks">
              <li><Check size={16} /> No credit card</li>
              <li><Check size={16} /> Live gold-rate pricing</li>
              <li><Check size={16} /> BIS hallmark ready</li>
            </ul>
          </ScrollReveal>

          <ScrollReveal className="landing-hero-preview" delay={120}>
            <div className="landing-preview-card">
              <div className="landing-preview-top">
                <span className="landing-preview-dot" />
                <span className="landing-preview-dot" />
                <span className="landing-preview-dot" />
              </div>
              <div className="landing-preview-body">
                <div className="landing-preview-sidebar">
                  <span className="active">Dashboard</span>
                  <span>POS</span>
                  <span>Inventory</span>
                  <span>Repairs</span>
                  <span>Customers</span>
                </div>
                <div className="landing-preview-main">
                  <div className="landing-preview-kpis">
                    <div><small>Sales today</small><strong>₹ 4.2L</strong></div>
                    <div><small>22K rate</small><strong>₹ 7,245</strong></div>
                    <div><small>Low stock</small><strong>6 items</strong></div>
                  </div>
                  <div className="landing-preview-chart" aria-hidden="true">
                    <span style={{ height: "42%" }} />
                    <span style={{ height: "68%" }} />
                    <span style={{ height: "55%" }} />
                    <span style={{ height: "82%" }} />
                    <span style={{ height: "64%" }} />
                    <span style={{ height: "90%" }} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="landing-stats" aria-label="Highlights">
        {stats.map(({ value, label }, i) => (
          <ScrollReveal key={label} delay={i * 60}>
            <div className="landing-stat">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </ScrollReveal>
        ))}
      </section>

      <section className="landing-section" id="modules">
        <ScrollReveal className="landing-section-head">
          <span className="landing-eyebrow light">Modules</span>
          <h2>Everything your showroom needs</h2>
          <p>One platform for the counter, the workshop, the back office and your customers.</p>
        </ScrollReveal>

        <div className="landing-module-grid">
          {modules.map(({ icon: Icon, title, copy }, i) => (
            <ScrollReveal key={title} delay={(i % 4) * 70}>
              <article className="landing-module-card">
                <span className="landing-module-icon"><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="landing-section landing-flow-section">
        <ScrollReveal className="landing-section-head">
          <span className="landing-eyebrow light">How it fits together</span>
          <h2>The pieces talk to each other</h2>
          <p>Sell a piece, the stock drops. Update a rate, every price changes. No double entry.</p>
        </ScrollReveal>

        <div className="landing-flow">
          {flowSteps.map((step, i) => (
            <ScrollReveal key={step} delay={i * 80}>
              <div className="landing-flow-step">
                <span>{i + 1}</span>
                <p>{step}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {spotlights.map(({ badge, icon: Icon, title, copy, points, reverse }) => (
        <section className={`landing-spotlight ${reverse ? "reverse" : ""}`} key={badge}>
          <ScrollReveal className="landing-spotlight-copy">
            <span className="landing-spotlight-badge"><Icon size={14} /> {badge}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <ul>
              {points.map((point) => (
                <li key={point}><Check size={15} /> {point}</li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal className="landing-spotlight-visual" delay={100}>
            <div className="landing-spotlight-panel">
              <div className="landing-spotlight-panel-head">
                <Icon size={18} />
                <strong>{badge}</strong>
              </div>
              <div className="landing-spotlight-lines">
                <span /><span /><span /><span />
              </div>
            </div>
          </ScrollReveal>
        </section>
      ))}

      <section className="landing-section" id="pricing">
        <ScrollReveal className="landing-section-head">
          <span className="landing-eyebrow light">Pricing</span>
          <h2>Start with software. Grow into a partnership.</h2>
          <p>Transparent plans for single-store boutiques to multi-branch chains.</p>
        </ScrollReveal>

        <div className="landing-pricing-grid">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 90}>
              <article className={`landing-price-card ${plan.popular ? "popular" : ""} ${plan.dark ? "dark" : ""}`}>
                {plan.popular ? <em className="landing-price-badge">Most popular</em> : null}
                <h3>{plan.name}</h3>
                <p className="landing-price-note">{plan.note}</p>
                <div className="landing-price-amount">
                  <strong>{plan.price}</strong>
                  {plan.period ? <span>{plan.period}</span> : null}
                </div>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}><Check size={14} /> {f}</li>
                  ))}
                </ul>
                <button type="button" className={plan.dark ? "landing-btn-ghost light" : "landing-btn-primary full"} onClick={scrollToAccess}>
                  {plan.dark ? "Contact sales" : "Get started"}
                </button>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="landing-section landing-about" id="about">
        <ScrollReveal className="landing-about-inner">
          <span className="landing-eyebrow light">About Grids Gold</span>
          <h2>Crafted for jewellers, by people who understand the trade.</h2>
          <p>
            Grids Gold is a jewellery ERP built around how Indian showrooms actually work — weight-based
            pricing, karat rates, repair tickets, hallmark certificates and multi-branch inventory.
            We help you spend less time on spreadsheets and more time with customers.
          </p>
          <div className="landing-about-pills">
            <span><ShieldCheck size={15} /> Secure & cloud-ready</span>
            <span><BadgeCheck size={15} /> BIS hallmark workflows</span>
            <span><Building2 size={15} /> Multi-branch sync</span>
            <span><LayoutGrid size={15} /> Vercel-deployed frontend</span>
          </div>
        </ScrollReveal>
      </section>

      <section className="landing-access" id="access">
        <ScrollReveal className="landing-access-intro">
          <span className="landing-eyebrow light">Sign in or sign up</span>
          <h2>Access your account</h2>
          <p>Customers browse and track orders. Staff manage the full ERP workspace.</p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <AuthPanel />
        </ScrollReveal>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Grids Gold · Fine Jewellery ERP</span>
        <div>
          <a href="#modules">Modules</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <a href="#access">Sign in</a>
        </div>
      </footer>
    </div>
  );
}
