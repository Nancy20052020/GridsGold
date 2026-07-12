"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  Eye,
  EyeOff,
  Gem,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserRound,
  Wrench,
} from "lucide-react";

type Role = "customer" | "admin";
type Mode = "signin" | "signup";

const highlights = [
  { icon: ShoppingBag, title: "Point of Sale", copy: "Barcode billing, gold-rate pricing & split payments." },
  { icon: Boxes, title: "Live Inventory", copy: "Track weight, purity & stones across every branch." },
  { icon: Wrench, title: "Repairs & Orders", copy: "Book jobs and follow them from intake to pickup." },
  { icon: BadgeCheck, title: "Certificates", copy: "Store hallmark & lab certificates with every item." },
];

const trust = [
  { icon: TrendingUp, label: "Live Gold Rate", value: "₹ 7,245 /gm" },
  { icon: Building2, label: "Branches", value: "4 synced" },
  { icon: ShieldCheck, label: "Secure", value: "2FA ready" },
];

export default function AuthLandingPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    company: "",
    password: "",
    confirm: "",
  });

  const isSignup = mode === "signup";
  const isAdmin = role === "admin";

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    if (isSignup) {
      if (!form.fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    router.push(isAdmin ? "/dashboard" : "/portal");
  }

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-top">
          <div className="auth-logo">
            <span className="auth-logo-mark">G</span>
            <div>
              <strong>GRIDS GOLD</strong>
              <span>JEWELLERY ERP</span>
            </div>
          </div>
          <span className="auth-rate-pill">
            <Sparkles size={14} /> Gold 22K · ₹ 7,245/gm
          </span>
        </div>

        <div className="auth-brand-hero">
          <span className="auth-eyebrow">Retail · Repairs · Wholesale · Manufacturing</span>
          <h1>
            The complete operating system for modern <span>jewellers</span>.
          </h1>
          <p>
            Manage inventory, billing, repairs, customers and branches in one elegant
            platform — and give your customers a beautiful self-service portal.
          </p>

          <div className="auth-highlights">
            {highlights.map(({ icon: Icon, title, copy }) => (
              <div className="auth-highlight" key={title}>
                <span>
                  <Icon size={18} />
                </span>
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
        <div className="auth-card">
          <div className="auth-card-head">
            <Gem size={26} />
            <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
            <p>
              {isSignup
                ? isAdmin
                  ? "Set up your store team access."
                  : "Join to track orders, repairs & wishlists."
                : isAdmin
                ? "Sign in to your store workspace."
                : "Sign in to your customer account."}
            </p>
          </div>

          <div className="role-toggle" role="tablist" aria-label="Account type">
            <button
              type="button"
              role="tab"
              aria-selected={role === "customer"}
              className={role === "customer" ? "active" : ""}
              onClick={() => setRole("customer")}
            >
              <UserRound size={17} /> Customer
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "admin"}
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              <ShieldCheck size={17} /> Admin / Staff
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {isSignup ? (
              <label className="field">
                <span>Full name</span>
                <div className="field-input">
                  <UserRound size={17} />
                  <input
                    type="text"
                    placeholder="e.g. Priya Mehta"
                    value={form.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    autoComplete="name"
                  />
                </div>
              </label>
            ) : null}

            <label className="field">
              <span>Email address</span>
              <div className="field-input">
                <Mail size={17} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  autoComplete="email"
                />
              </div>
            </label>

            {isSignup ? (
              <div className="field-row">
                <label className="field">
                  <span>Mobile</span>
                  <div className="field-input">
                    <Phone size={17} />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.mobile}
                      onChange={(event) => update("mobile", event.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </label>
                {isAdmin ? (
                  <label className="field">
                    <span>Store / Company</span>
                    <div className="field-input">
                      <Building2 size={17} />
                      <input
                        type="text"
                        placeholder="Grids Gold — MG Road"
                        value={form.company}
                        onChange={(event) => update("company", event.target.value)}
                        autoComplete="organization"
                      />
                    </div>
                  </label>
                ) : (
                  <label className="field">
                    <span>City</span>
                    <div className="field-input">
                      <Building2 size={17} />
                      <input
                        type="text"
                        placeholder="Bengaluru"
                        value={form.company}
                        onChange={(event) => update("company", event.target.value)}
                        autoComplete="address-level2"
                      />
                    </div>
                  </label>
                )}
              </div>
            ) : null}

            <label className="field">
              <span>Password</span>
              <div className="field-input">
                <Lock size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignup ? "Create a password" : "Enter your password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {isSignup ? (
              <label className="field">
                <span>Confirm password</span>
                <div className="field-input">
                  <Lock size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirm}
                    onChange={(event) => update("confirm", event.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </label>
            ) : null}

            {!isSignup ? (
              <div className="auth-row-between">
                <label className="checkbox">
                  <input type="checkbox" defaultChecked /> <span>Remember me</span>
                </label>
                <button type="button" className="link-plain">
                  Forgot password?
                </button>
              </div>
            ) : null}

            {error ? <p className="auth-error">{error}</p> : null}

            <button type="submit" className="auth-submit">
              {isSignup ? "Create account" : "Sign in"}
              <ArrowRight size={18} />
            </button>

            {isSignup ? (
              <p className="auth-terms">
                By creating an account you agree to the Terms of Service and Privacy Policy.
              </p>
            ) : null}
          </form>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "New to Grids Gold?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? "signin" : "signup");
                setError("");
              }}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>

        <p className="auth-foot">© {new Date().getFullYear()} Grids Gold · Jewellery ERP</p>
      </main>
    </div>
  );
}
