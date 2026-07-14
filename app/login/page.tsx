"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Boxes,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { AuthPanel } from "../components/AuthPanel";
import { BrandMark } from "../components/BrandMark";

const highlights = [
  { icon: ShoppingBag, title: "Point of Sale", copy: "Barcode billing, gold-rate pricing & split payments." },
  { icon: Boxes, title: "Live Inventory", copy: "Track weight, purity & stones across branches." },
  { icon: Wrench, title: "Repairs & Orders", copy: "Follow jobs from intake to pickup." },
  { icon: BadgeCheck, title: "Certificates", copy: "Hallmark & lab docs with every item." },
];

const trust = [
  { icon: TrendingUp, label: "Live Gold Rate", value: "₹ 7,245 /gm" },
  { icon: ShieldCheck, label: "Secure", value: "Admin access" },
];

function LoginContent() {
  const params = useSearchParams();
  const isSignup = params.get("signup") === "1";

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-top">
          <Link className="auth-logo" href="/">
            <BrandMark className="auth-logo-mark" />
            <div>
              <strong>GRIDS GOLD</strong>
              <span>JEWELLERY ERP</span>
            </div>
          </Link>
          <span className="auth-rate-pill">
            <Sparkles size={14} /> Gold 22K · ₹ 7,245/gm
          </span>
        </div>

        <div className="auth-brand-hero">
          <span className="auth-eyebrow">Retail · Repairs · Wholesale</span>
          <h1>
            {isSignup ? "Create your " : "Welcome back to "}
            <span>Grids Gold.</span>
          </h1>
          <p>
            {isSignup
              ? "Create your staff account to run your showroom from one elegant platform."
              : "Sign in to your admin workspace — inventory, billing and repairs in sync."}
          </p>

          <div className="auth-highlights">
            {highlights.map(({ icon: Icon, title, copy }) => (
              <div className="auth-highlight" key={title}>
                <span><Icon size={18} /></span>
                <div>
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-trust">
          {trust.map(({ icon: Icon, label, value }) => (
            <div className="auth-trust-item" key={label}>
              <Icon size={16} />
              <div>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="auth-main">
        <AuthPanel initialMode={isSignup ? "signup" : "signin"} />
        <p className="auth-foot">
          <Link href="/">← Back to website</Link>
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page auth-page-loading">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
