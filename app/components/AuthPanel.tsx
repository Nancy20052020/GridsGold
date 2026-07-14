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
  UserRound,
} from "lucide-react";
import { userFromSupabase } from "../lib/auth";
import { useStore } from "../lib/store";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { BrandMark } from "./BrandMark";

type Mode = "signin" | "signup";

const DEMO_ADMIN_EMAIL = "nancy2005nov@gmail.com";
const DEMO_ADMIN_PASSWORD = "nancy";
const DEMO_ADMIN_NAME = "Nancy";

type AuthPanelProps = {
  compact?: boolean;
  initialMode?: Mode;
};

export function AuthPanel({ compact = false, initialMode = "signin" }: AuthPanelProps) {
  const router = useRouter();
  const { signup, login } = useStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
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
  const usingSupabase = isSupabaseConfigured() && Boolean(getSupabase());

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (info) setInfo("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setInfo("");

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

    const client = getSupabase();
    if (usingSupabase && client) {
      setBusy(true);
      try {
        if (isSignup) {
          const { data, error: err } = await client.auth.signUp({
            email: form.email.trim(),
            password: form.password,
            options: {
              data: {
                full_name: form.fullName.trim(),
                role: "admin",
                mobile: form.mobile.trim(),
                company: form.company.trim(),
              },
            },
          });
          if (err) {
            setError(err.message);
            setBusy(false);
            return;
          }
          // Email confirmation enabled → user exists but no session yet.
          if (data.user && !data.session) {
            setInfo(
              "Account created. Check your email to confirm, then sign in.",
            );
            setMode("signin");
            setBusy(false);
            return;
          }
          if (data.user) {
            signup(userFromSupabase(data.user));
          }
        } else {
          const { data, error: err } = await client.auth.signInWithPassword({
            email: form.email.trim(),
            password: form.password,
          });
          if (err) {
            setError(err.message);
            setBusy(false);
            return;
          }
          if (data.user) {
            login(userFromSupabase(data.user));
          }
        }
      } catch {
        setError("Could not reach the authentication service. Please try again.");
        setBusy(false);
        return;
      }
      setBusy(false);
      router.push("/dashboard");
      return;
    }

    // Demo mode — Supabase env vars are not available.
    if (isSignup) {
      setError(
        "Account creation needs Supabase. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy — or sign in with the demo account.",
      );
      return;
    }

    if (
      form.email.trim().toLowerCase() !== DEMO_ADMIN_EMAIL ||
      form.password !== DEMO_ADMIN_PASSWORD
    ) {
      setError(
        `Incorrect email or password. Demo sign-in: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`,
      );
      return;
    }

    login({
      name: DEMO_ADMIN_NAME,
      email: DEMO_ADMIN_EMAIL,
      role: "admin",
    });

    router.push("/dashboard");
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
        <h2>{isSignup ? "Create staff account" : "Welcome back"}</h2>
        <p>
          {isSignup
            ? "Set up your store team access."
            : "Sign in to your admin workspace."}
        </p>
        {usingSupabase ? (
          <p className="auth-hint">Secured with Supabase authentication.</p>
        ) : (
          <p className="auth-hint">
            Demo mode — set Supabase env vars on Vercel and redeploy for live auth.
          </p>
        )}
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
              placeholder="you@store.com"
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
            <button type="button" className="link-plain" disabled title="Coming soon">
              Forgot password?
            </button>
          </div>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}
        {info ? <p className="auth-info">{info}</p> : null}

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

      <p className="auth-switch">
        {isSignup ? "Already have an account?" : "New to Grids Gold?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError("");
            setInfo("");
          }}
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
