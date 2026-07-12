"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  UserRound,
} from "lucide-react";
import { adminNavGroups, adminQuickAddLinks } from "../lib/adminNav";
import { BRANCHES, firstName, useStore } from "../lib/store";
import { AdminQuickSearch } from "./AdminQuickSearch";
import { BrandMark } from "./BrandMark";

type AppShellProps = { children: React.ReactNode; searchPlaceholder?: string };

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/pos") return pathname === "/pos";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupActive(pathname: string, group: (typeof adminNavGroups)[number]) {
  return group.items.some((item) => isActive(pathname, item.href));
}

export function AppShell({ children, searchPlaceholder = "Search item, customer, invoice or barcode..." }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { rates, selectedBranch, setBranch, currentUser, logout, notifications, markNotificationsRead, theme, toggleTheme } = useStore();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menu, setMenu] = useState<null | "branch" | "notif" | "calendar" | "profile" | "quickadd">(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const shellRef = useRef<HTMLDivElement>(null);

  function isGroupOpen(group: (typeof adminNavGroups)[number]) {
    if (openGroups[group.label] !== undefined) return openGroups[group.label];
    return groupActive(pathname, group);
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMobileNavOpen(false);
    setMenu(null);
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

  const unread = notifications.filter((n) => !n.read).length;
  const displayName = currentUser?.name ?? "Store Admin";
  const displayRole = currentUser?.role === "customer" ? "Customer" : "Administrator";
  const greeting = firstName(currentUser);

  function signOut() {
    logout();
    router.push("/");
  }

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <div className={`app-shell ${mobileNavOpen ? "mobile-nav-open" : ""}`} ref={shellRef}>
      {mobileNavOpen ? (
        <button className="sidebar-backdrop" aria-label="Close menu" type="button" onClick={() => setMobileNavOpen(false)} />
      ) : null}

      <aside className="sidebar sidebar-rich">
        <div className="brand-row">
          <Link className="brand" href="/dashboard" onClick={() => setMobileNavOpen(false)}>
            <BrandMark className="brand-mark" />
            <div className="brand-text">
              <strong>GRIDS GOLD</strong>
              <span>JEWELRY ERP</span>
            </div>
          </Link>
        </div>

        <div className="sidebar-quickadd-wrap menu-wrap">
          <button className="sidebar-quickadd" type="button" onClick={() => setMenu(menu === "quickadd" ? null : "quickadd")}>
            <Plus size={16} /> Add new <ChevronDown size={14} />
          </button>
          {menu === "quickadd" ? (
            <div className="dropdown sidebar-quickadd-menu">
              {adminQuickAddLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => { setMenu(null); setMobileNavOpen(false); }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="sidebar-nav-scroll" aria-label="Main navigation">
          {adminNavGroups.map((group) => {
            const open = isGroupOpen(group);
            return (
              <div className="sidebar-group" key={group.label}>
                <button type="button" className="sidebar-group-head" onClick={() => toggleGroup(group.label)}>
                  <span>{group.label}</span>
                  <ChevronDown size={14} className={open ? "open" : ""} />
                </button>
                {open ? (
                  <div className="sidebar-group-items">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          className={`nav-item ${active ? "active" : ""}`}
                          href={item.href}
                          key={item.href}
                          title={item.label}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <Icon size={18} />
                          <span className="nav-label">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="gold-widget">
          <p>Gold Price (22K)</p>
          <strong>₹ {rates["22K"].toLocaleString("en-IN")} <span>/gm</span></strong>
          <em>Live rate · updates all prices</em>
          <Link className="gold-widget-link" href="/gold-rates">View Gold Rates</Link>
        </div>

        <div className="sidebar-foot">
          {greeting ? <p className="sidebar-greeting">Hi, {greeting}</p> : null}
          <div className="sidebar-actions">
            <Link className="sidebar-account" href="/settings" onClick={() => setMobileNavOpen(false)}>
              <UserRound size={18} /> Account &amp; Settings
            </Link>
            <button className="sidebar-logout" type="button" onClick={signOut}>
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" type="button" onClick={() => setMobileNavOpen(true)}>
            <Menu size={21} />
          </button>
          <AdminQuickSearch placeholder={searchPlaceholder} />

          <div className="menu-wrap">
            <button className="branch-button" type="button" onClick={() => setMenu(menu === "branch" ? null : "branch")}>
              {selectedBranch} <ChevronDown size={16} />
            </button>
            {menu === "branch" ? (
              <div className="dropdown">
                {BRANCHES.map((b) => (
                  <button key={b} type="button" className={b === selectedBranch ? "active" : ""} onClick={() => { setBranch(b); setMenu(null); }}>
                    {b}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="top-actions">
            <button className="icon-button" aria-label="Toggle theme" type="button" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="menu-wrap">
              <button className="icon-button" aria-label="Notifications" type="button" onClick={() => { setMenu(menu === "notif" ? null : "notif"); if (menu !== "notif") markNotificationsRead(); }}>
                <Bell size={20} />
                {unread ? <em className="badge-count">{unread}</em> : null}
              </button>
              {menu === "notif" ? (
                <div className="dropdown wide">
                  <div className="dropdown-head">Notifications</div>
                  {notifications.map((n) => (
                    <div className="dropdown-row" key={n.id}>
                      <strong>{n.text}</strong>
                      <small>{n.time}</small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="menu-wrap">
              <button className="icon-button" aria-label="Calendar" type="button" onClick={() => setMenu(menu === "calendar" ? null : "calendar")}>
                <CalendarDays size={20} />
              </button>
              {menu === "calendar" ? (
                <div className="dropdown">
                  <div className="dropdown-head">Today</div>
                  <div className="dropdown-row"><strong>POS sessions</strong><small>3 active counters</small></div>
                  <div className="dropdown-row"><strong>Repairs due</strong><small>2 pickups today</small></div>
                </div>
              ) : null}
            </div>

            <div className="menu-wrap">
              <button className="profile" type="button" onClick={() => setMenu(menu === "profile" ? null : "profile")}>
                <span className="profile-text">
                  <strong>{displayName}</strong>
                  <span>{displayRole}</span>
                </span>
                <ChevronRight size={16} />
              </button>
              {menu === "profile" ? (
                <div className="dropdown right">
                  <Link href="/settings">Account settings</Link>
                  <Link href="/gold-rates">Gold rates</Link>
                  <button type="button" onClick={signOut}>Sign out</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {menu ? <button className="menu-backdrop" type="button" aria-label="Close menu" onClick={() => setMenu(null)} /> : null}

        {children}
      </main>
    </div>
  );
}
