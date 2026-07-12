"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { AuthPanel } from "../components/AuthPanel";
import { BrandMark } from "../components/BrandMark";

function LoginContent() {
  const params = useSearchParams();
  const isSignup = params.get("signup") === "1";

  return (
    <div className="auth-standalone">
      <Link className="auth-back-link" href="/">
        <ArrowLeft size={16} /> Back to Grids Gold
      </Link>

      <div className="auth-standalone-grid">
        <aside className="auth-standalone-brand">
          <div className="auth-standalone-brand-top">
            <BrandMark className="auth-logo-mark" />
            <div>
              <strong>GRIDS GOLD</strong>
              <span>JEWELLERY ERP</span>
            </div>
          </div>

          <h1>{isSignup ? "Create your workspace" : "Welcome back"}</h1>
          <p>
            {isSignup
              ? "Join as a customer to track orders and repairs, or sign in as staff to run your showroom."
              : "Sign in to your customer portal or admin workspace."}
          </p>

          <ul className="auth-standalone-points">
            <li><Sparkles size={16} /> Live gold-rate pricing</li>
            <li><BadgeCheck size={16} /> BIS hallmark ready</li>
            <li><TrendingUp size={16} /> Multi-branch inventory</li>
            <li><ShieldCheck size={16} /> Secure cloud access</li>
          </ul>

          <p className="auth-standalone-foot">
            New here?{" "}
            <Link href={isSignup ? "/login" : "/login?signup=1"}>
              {isSignup ? "Sign in instead" : "Create an account"}
            </Link>
          </p>
        </aside>

        <main className="auth-standalone-main">
          <AuthPanel initialMode={isSignup ? "signup" : "signin"} />
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-standalone auth-standalone-loading">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
