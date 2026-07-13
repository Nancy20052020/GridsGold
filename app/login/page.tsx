"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { AuthPanel } from "../components/AuthPanel";
import { AuthShowcase } from "../components/AuthShowcase";
import { BrandMark } from "../components/BrandMark";

function LoginContent() {
  const params = useSearchParams();
  const isSignup = params.get("signup") === "1";
  const [role, setRole] = useState<"customer" | "admin">("customer");

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
          <span className="auth-eyebrow">{role === "admin" ? "Admin workspace" : "Customer portal"}</span>
          <h1>
            {isSignup ? "Create your " : "Welcome to "}
            <span>Grids Gold.</span>
          </h1>
          <p>
            {role === "admin"
              ? "Inventory, POS, repairs and reports — one connected ERP for your showroom."
              : "Browse certified jewellery, track orders and repairs from your personal portal."}
          </p>
        </div>

        <AuthShowcase role={role} />

        <div className="auth-trust">
          <div className="auth-trust-item">
            <TrendingUp size={16} />
            <div>
              <small>Live Gold Rate</small>
              <strong>₹ 7,245 /gm</strong>
            </div>
          </div>
          <div className="auth-trust-item">
            <ShieldCheck size={16} />
            <div>
              <small>Secure</small>
              <strong>Cloud ready</strong>
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <AuthPanel initialMode={isSignup ? "signup" : "signin"} onRoleChange={setRole} />
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
