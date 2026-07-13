import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "./store";

/** Map a Supabase auth user to the app store user (admin-only). */
export function userFromSupabase(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  const fallbackName = su.email
    ?.split("@")[0]
    ?.replace(/[._-]/g, " ")
    ?.replace(/\b\w/g, (m) => m.toUpperCase());
  const name =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    fallbackName ||
    "Store Admin";

  return {
    name,
    email: su.email ?? "",
    role: "admin",
    mobile: typeof meta.mobile === "string" ? meta.mobile : undefined,
    city:
      (typeof meta.city === "string" && meta.city) ||
      (typeof meta.company === "string" ? meta.company : undefined),
  };
}
