"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gem, Heart, Home, LogOut, Menu, Package, Sparkles, UserRound, Wrench } from "lucide-react";
import { firstName, useStore } from "../lib/store";
import { BrandMark } from "./BrandMark";

const navLinks = [
  { label: "Home", href: "/portal", icon: Home },
  { label: "Collection", href: "/portal/catalog", icon: Gem },
  { label: "My Orders", href: "/portal/orders", icon: Package },
  { label: "Repairs", href: "/portal/repairs", icon: Wrench },
  { label: "Wishlist", href: "/portal/wishlist", icon: Heart },
];

function isActive(pathname: string, href: string) {
  return href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);
}

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { rates, wishlist, currentUser, logout } = useStore();
  const greeting = firstName(currentUser);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function signOut() {
    logout();
    router.push("/");
  }

  return (
    <div className={`portal-shell ${mobileNavOpen ? "portal-nav-open" : ""}`}>
      {mobileNavOpen ? (
        <button
          className="portal-sidebar-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside className="portal-sidebar" aria-label="Customer menu">
        <div className="portal-sidebar-head">
          <Link className="portal-brand" href="/portal" onClick={() => setMobileNavOpen(false)}>
            <BrandMark className="portal-brand-mark" />
            <div>
              <strong>GRIDS GOLD</strong>
              <span>FINE JEWELLERY</span>
            </div>
          </Link>
        </div>

        <nav className="portal-sidebar-nav" aria-label="Customer navigation">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={label}
                href={href}
                className={active ? "active" : ""}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === "Wishlist" && wishlist.length ? <em className="nav-count">{wishlist.length}</em> : null}
              </Link>
            );
          })}
        </nav>

        <div className="portal-sidebar-foot">
          <span className="portal-rate">
            <Sparkles size={14} /> 22K · ₹ {rates["22K"].toLocaleString("en-IN")}/gm
          </span>
          {greeting ? <p className="portal-sidebar-greeting">Hi, {greeting}</p> : null}
          <div className="portal-sidebar-actions">
            <Link className="portal-account" href="/portal/account" aria-label="Account" onClick={() => setMobileNavOpen(false)}>
              <UserRound size={18} /> Account
            </Link>
            <button className="portal-logout" type="button" onClick={signOut} aria-label="Sign out">
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <header className="portal-header">
        <button className="portal-menu-btn" type="button" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
          <Menu size={22} />
        </button>

        <Link className="portal-brand portal-header-brand" href="/portal">
          <BrandMark className="portal-brand-mark" />
          <div>
            <strong>GRIDS GOLD</strong>
            <span>FINE JEWELLERY</span>
          </div>
        </Link>

        <nav className="portal-nav portal-nav-desktop" aria-label="Customer navigation">
          {navLinks.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={label} href={href} className={active ? "active" : ""}>
                <Icon size={16} /> {label}
                {label === "Wishlist" && wishlist.length ? <em className="nav-count">{wishlist.length}</em> : null}
              </Link>
            );
          })}
        </nav>

        <div className="portal-actions-desktop">
          <span className="portal-rate">
            <Sparkles size={14} /> 22K · ₹ {rates["22K"].toLocaleString("en-IN")}/gm
          </span>
          {greeting ? <span className="portal-greeting">Hi, {greeting}</span> : null}
          <Link className="portal-icon-btn" href="/portal/account" aria-label="Account">
            <UserRound size={18} />
          </Link>
          <button className="portal-icon-btn" type="button" onClick={signOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>

        <div className="portal-actions-mobile">
          <Link className="portal-icon-btn" href="/portal/account" aria-label="Account">
            <UserRound size={18} />
          </Link>
          <button className="portal-icon-btn" type="button" onClick={signOut} aria-label="Sign out">
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
