"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LandingNav } from "./components/LandingNav";
import { ScrollReveal } from "./components/ScrollReveal";
import { TypewriterText } from "./components/TypewriterText";
import { moduleHighlights } from "./lib/landingModules";

const stats = [
  { value: "4", label: "Branches synced", note: "Multi-location inventory" },
  { value: "22K", label: "Live gold pricing", note: "Updates every counter" },
  { value: "100%", label: "Hallmark ready", note: "BIS workflows built-in" },
  { value: "24/7", label: "Customer portal", note: "Orders & repairs online" },
];

const trustStrip = [
  "POS that's fast",
  "Repairs that track",
  "Inventory that syncs",
  "Portal clients love",
  "Secure & reliable",
];

const features = [
  {
    title: "Built for the counter",
    copy: "Barcode POS, split payments and receipts tuned for busy showrooms — not generic retail software.",
  },
  {
    title: "Weight-aware inventory",
    copy: "Track grams, karat, making charges and stones. Know margin to the gram, not just piece count.",
  },
  {
    title: "Portal your clients expect",
    copy: "Browse, wishlist, reserve and track repairs — branded in navy and gold, like your showroom.",
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

export default function LandingPage() {
  return (
    <div className="landing-site">
      <LandingNav />

      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow-a" aria-hidden="true" />
        <div className="landing-hero-glow landing-hero-glow-b" aria-hidden="true" />

        <ScrollReveal className="landing-hero-centered">
          <span className="landing-eyebrow">
            <Sparkles size={14} /> Built for Indian jewellers
          </span>
          <h1 className="display-serif">
            Run your jewellery business from{" "}
            <span className="gold-text">
              <TypewriterText phrases={["one place.", "every branch.", "one platform."]} />
            </span>
          </h1>
          <p>
            Cut admin in half, catch every repair on time, and know your margin to the gram.
            Retail, repairs, wholesale and manufacturing — with a customer portal your clients will love.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-btn-primary" href="/login?signup=1">
              Start free trial <ArrowRight size={18} />
            </Link>
            <a className="landing-btn-ghost light" href="#features">
              See how it works
            </a>
          </div>
          <ul className="landing-hero-checks">
            <li><Check size={16} /> No credit card</li>
            <li><Check size={16} /> Live gold-rate pricing</li>
            <li><Check size={16} /> BIS hallmark ready</li>
          </ul>
        </ScrollReveal>
      </section>

      <section className="landing-stats" aria-label="Highlights">
        {stats.map(({ value, label, note }, i) => (
          <ScrollReveal key={label} delay={i * 60}>
            <div className="landing-stat">
              <strong>{value}</strong>
              <span>{label}</span>
              <small>{note}</small>
            </div>
          </ScrollReveal>
        ))}
      </section>

      <section className="landing-trust-strip">
        {trustStrip.map((item) => (
          <span key={item}><Check size={14} /> {item}</span>
        ))}
      </section>

      <section className="landing-section" id="modules">
        <ScrollReveal className="landing-section-head centered">
          <span className="landing-eyebrow light">Modules</span>
          <h2 className="display-serif">Everything your showroom needs</h2>
          <p>From the counter to the workshop, back office and customer portal — one connected platform.</p>
        </ScrollReveal>

        <div className="landing-module-grid">
          {moduleHighlights.map(({ icon: Icon, title, copy }, i) => (
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

      <section className="landing-section landing-flow-section" id="features">
        <ScrollReveal className="landing-section-head centered">
          <span className="landing-eyebrow light">Features</span>
          <h2 className="display-serif">Clean tools that work together</h2>
          <p>Sell a piece, the stock drops. Update a rate, every price changes. No double entry.</p>
        </ScrollReveal>

        <div className="landing-feature-cards">
          {features.map(({ title, copy }, i) => (
            <ScrollReveal key={title} delay={i * 90}>
              <article className="landing-feature-card">
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="landing-section" id="pricing">
        <ScrollReveal className="landing-section-head centered">
          <span className="landing-eyebrow light">Pricing</span>
          <h2 className="display-serif">Start with software. Grow into a partnership.</h2>
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
                <Link
                  className={plan.dark ? "landing-btn-ghost light" : "landing-btn-primary full"}
                  href={plan.dark ? "/login" : "/login?signup=1"}
                >
                  {plan.dark ? "Contact sales" : "Get started"}
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="landing-section landing-about" id="about">
        <ScrollReveal className="landing-about-inner centered">
          <span className="landing-eyebrow light">About Grids Gold</span>
          <h2 className="display-serif">Crafted for jewellers who live by weight, purity and trust.</h2>
          <p>
            Grids Gold is jewellery ERP software shaped around Indian showrooms — karat-based pricing,
            repair tickets, hallmark workflows and multi-branch inventory.
          </p>
          <div className="landing-about-pills">
            <span><ShieldCheck size={15} /> Secure & cloud-ready</span>
            <span><BadgeCheck size={15} /> BIS hallmark workflows</span>
            <span><Building2 size={15} /> Multi-branch sync</span>
            <span><LayoutGrid size={15} /> Modern web platform</span>
          </div>
        </ScrollReveal>
      </section>

      <section className="landing-cta-band">
        <ScrollReveal className="landing-cta-inner">
          <div>
            <h2 className="display-serif">Ready to modernise your showroom?</h2>
            <p>Start a free trial or sign in to your existing account.</p>
          </div>
          <div className="landing-cta-actions">
            <Link className="landing-btn-primary gold" href="/login?signup=1">
              Get started <ArrowRight size={18} />
            </Link>
            <Link className="landing-btn-ghost light" href="/login">
              Sign in
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Grids Gold · Fine Jewellery ERP</span>
        <div>
          <a href="#modules">Modules</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
