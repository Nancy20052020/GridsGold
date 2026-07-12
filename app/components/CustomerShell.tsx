"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gem, Heart, Home, LogOut, Package, Sparkles, UserRound, Wrench } from "lucide-react";
import { firstName, useStore } from "../lib/store";
import { BrandMark } from "./BrandMark";

const navLinks = [
  { label: "Home", href: "/portal", icon: Home },
  { label: "Collection", href: "/portal/catalog", icon: Gem },
  { label: "My Orders", href: "/portal/orders", icon: Package },
  { label: "Repairs", href: "/portal/repairs", icon: Wrench },
  { label: "Wishlist", href: "/portal/wishlist", icon: Heart },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { rates, wishlist, currentUser, logout } = useStore();
  const greeting = firstName(currentUser);

  function signOut() {
    logout();
    router.push("/");
  }

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link className="portal-brand" href="/portal">
          <BrandMark className="portal-brand-mark" />
          <div>
            <strong>GRIDS GOLD</strong>
            <span>FINE JEWELLERY</span>
          </div>
        </Link>

        <nav className="portal-nav" aria-label="Customer navigation">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active = href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);
            return (
              <Link key={label} href={href} className={active ? "active" : ""}>
                <Icon size={16} /> {label}
                {label === "Wishlist" && wishlist.length ? <em className="nav-count">{wishlist.length}</em> : null}
              </Link>
            );
          })}
        </nav>

        <div className="portal-actions">
          <span className="portal-rate">
            <Sparkles size={14} /> 22K · ₹ {rates["22K"].toLocaleString("en-IN")}/gm
          </span>
          {greeting ? <span className="portal-greeting">Hi, {greeting}</span> : null}
          <Link className="portal-account" href="/portal/account" aria-label="Account">
            <UserRound size={18} />
          </Link>
          <button className="portal-logout" type="button" onClick={signOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="portal-main">{children}</main>

      <footer className="portal-footer">
        <span>© {new Date().getFullYear()} Grids Gold · Fine Jewellery</span>
        <div>
          <Link href="/portal">Shop</Link>
          <Link href="/portal/orders">Orders</Link>
          <Link href="/portal/repairs">Repairs</Link>
          <Link href="/">Sign out</Link>
        </div>
      </footer>
    </div>
  );
}
