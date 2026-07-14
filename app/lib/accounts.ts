/**
 * Local account store for Create account / Sign in.
 *
 * Seed accounts live in `data/accounts.json` (shipped with the app).
 * New signups are saved in the browser (localStorage key below) because
 * Vercel’s filesystem is read-only — this keeps auth working in production
 * without Supabase.
 */

import seedAccounts from "../../data/accounts.json";

export type StoredAccount = {
  email: string;
  password: string;
  fullName: string;
  mobile?: string;
  company?: string;
  role: "admin";
  createdAt: string;
};

const STORAGE_KEY = "gg_accounts_v1";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAccount(value: unknown): value is StoredAccount {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.email === "string" &&
    typeof a.password === "string" &&
    typeof a.fullName === "string"
  );
}

function readLocalAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAccount).map((a) => ({
      ...a,
      email: normalizeEmail(a.email),
      role: "admin",
      createdAt: a.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

function writeLocalAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function seedList(): StoredAccount[] {
  return (seedAccounts as StoredAccount[]).map((a) => ({
    ...a,
    email: normalizeEmail(a.email),
    role: "admin",
    createdAt: a.createdAt || new Date().toISOString(),
  }));
}

/** All accounts: seed file + locally created signups (local wins on email clash). */
export function listAccounts(): StoredAccount[] {
  const byEmail = new Map<string, StoredAccount>();
  for (const account of seedList()) {
    byEmail.set(account.email, account);
  }
  for (const account of readLocalAccounts()) {
    byEmail.set(account.email, account);
  }
  return Array.from(byEmail.values());
}

export function findAccount(email: string): StoredAccount | undefined {
  const key = normalizeEmail(email);
  return listAccounts().find((a) => a.email === key);
}

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  company?: string;
};

export type RegisterResult =
  | { ok: true; account: StoredAccount }
  | { ok: false; error: string };

/** Create a new account and persist it in localStorage. */
export function registerAccount(input: RegisterInput): RegisterResult {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Please enter your email and password." };
  }
  if (!fullName) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }
  if (findAccount(email)) {
    return { ok: false, error: "An account with this email already exists. Sign in instead." };
  }

  const account: StoredAccount = {
    email,
    password,
    fullName,
    mobile: input.mobile?.trim() || "",
    company: input.company?.trim() || "",
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  const locals = readLocalAccounts().filter((a) => a.email !== email);
  writeLocalAccounts([...locals, account]);
  return { ok: true, account };
}

export type LoginResult =
  | { ok: true; account: StoredAccount }
  | { ok: false; error: string };

/** Validate email + password against seed file + local signups. */
export function authenticateAccount(email: string, password: string): LoginResult {
  const account = findAccount(email);
  if (!account || account.password !== password) {
    return { ok: false, error: "Incorrect email or password." };
  }
  return { ok: true, account };
}
