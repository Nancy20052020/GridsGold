"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Gem,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useStore } from "../lib/store";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { BrandMark } from "./BrandMark";

type Role = "customer" | "admin";
type Mode = "signin" | "signup";

const ADMIN_EMAIL = "nancy2005nov@gmail.com";
const ADMIN_PASSWORD = "nancy";
const ADMIN_NAME = "Nancy";

type AuthPanelProps = {
  compact?: boolean;
  initialMode?: Mode;
  onRoleChange?: (role: Role) => void;
};

export function AuthPanel({ compact = false, initialMode = "signin", onRoleChange }: AuthPanelProps) {
  const router = useRouter();
  const { signup, login } = useStore();
  const [role, setRole] = useState<Role>("customer");
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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

  function setRoleAndNotify(next: Role) {
    setRole(next);
    onRoleChange?.(next);
  }

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isAdmin) {
      if (form.email.trim().toLowerCase() !== ADMIN_EMAIL || form.password !== ADMIN_PASSWORD) {
        setError("Incorrect admin email or password.");
        return;
      }
      signup({ name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" });
      router.push("/dashboard");
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

    if (isSupabaseConfigured && supabase) {
      setBusy(true);
      try {
        if (isSignup) {
          const { error: err } = await supabase.auth.signUp({
            email: form.email.trim(),
            password: form.password,
            options: {
              data: {
                full_name: form.fullName.trim(),
                role,
                mobile: form.mobile.trim(),
                city: form.company.trim(),
              },
            },
          });
          if (err) {
            setError(err.message);
            setBusy(false);
            return;
          }
        } else {
          const { error: err } = await supabase.auth.signInWithPassword({
            email: form.email.trim(),
            password: form.password,
          });
          if (err) {
            setError(err.message);
            setBusy(false);
            return;
          }
        }
      } catch {
        setError("Could not reach the authentication service. Please try again.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }

    if (isSignup) {
      signup({
        name: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        city: form.company.trim(),
        role,
      });
    } else {
      login(form.email.trim(), role);
    }

    router.push(isAdmin ? "/dashboard" : "/portal");
  }

  return (
    <div className={`auth-card ${compact ? "auth-card-compact" : ""}`}>
      <div className="auth-mobile-brand">
        <BrandMark className="auth-logo-mark" />
        <div>
          <strong>GRIDS GOLD</strong>
          <span>FINE JEWELLERY</span>
        </div>
      </div>

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
          onClick={() => setRoleAndNotify("customer")}
        >
          <UserRound size={17} /> Customer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={role === "admin"}
          className={role === "admin" ? "active" : ""}
          onClick={() => {
            setRoleAndNotify("admin");
            setMode("signin");
            setError("");
          }}
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

        <button type="submit" className="auth-submit" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          <ArrowRight size={18} />
        </button>

        {isSignup ? (
          <p className="auth-terms">
            By creating an account you agree to the Terms of Service and Privacy Policy.
          </p>
        ) : null}
      </form>

      {role === "customer" ? (
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
      ) : (
        <p className="auth-switch">Admin access is by invitation only.</p>
      )}
    </div>
  );
}
