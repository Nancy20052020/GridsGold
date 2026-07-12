"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  Factory,
  Gem,
  Handshake,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  TrendingUp,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import { BRANCHES, firstName, useStore } from "../lib/store";
import { BrandMark } from "./BrandMark";

const menuItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "POS / Sales", icon: ShoppingCart, href: "/pos" },
  { label: "Inventory", icon: Boxes, href: "/inventory" },
  { label: "Jewelry", icon: Gem, href: "/jewelry" },
  { label: "Repairs", icon: Wrench, href: "/repairs" },
  { label: "Customers", icon: UserRound, href: "/customers" },
  { label: "Purchasing", icon: ReceiptText, href: "/purchase-orders" },
  { label: "Manufacturing", icon: Factory, href: "/manufacturing" },
  { label: "Wholesale", icon: Handshake, href: "/wholesale" },
  { label: "Finance", icon: WalletCards, href: "/finance" },
  { label: "Reports", icon: LayoutGrid, href: "/reports" },
  { label: "Analytics", icon: ChartNoAxesCombined, href: "/analytics" },
  { label: "Gold Rates", icon: TrendingUp, href: "/gold-rates" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

type AppShellProps = { children: React.ReactNode; searchPlaceholder?: string };

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

export function AppShell({ children, searchPlaceholder = "Search item, customer, invoice or barcode..." }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { rates, selectedBranch, setBranch, currentUser, logout, notifications, markNotificationsRead, theme, toggleTheme } = useStore();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [menu, setMenu] = useState<null | "branch" | "notif" | "calendar" | "profile">(null);
  const shellRef = useRef<HTMLDivElement>(null);

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
  const initials = (greeting || "Store").slice(0, 2).toUpperCase();

  function signOut() {
    logout();
    router.push("/");
  }

  return (
    <div className={`app-shell ${mobileNavOpen ? "mobile-nav-open" : ""}`} ref={shellRef}>
      {mobileNavOpen ? (
        <button
          className="sidebar-backdrop"
          aria-label="Close menu"
          type="button"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside className="sidebar">
        <div className="brand-row">
          <Link className="brand" href="/dashboard" onClick={() => setMobileNavOpen(false)}>
            <BrandMark className="brand-mark" />
            <div className="brand-text">
              <strong>GRIDS GOLD</strong>
              <span>JEWELRY ERP</span>
            </div>
          </Link>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                className={`nav-item ${active ? "active" : ""}`}
                href={item.href}
                key={item.label}
                title={item.label}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon size={20} />
                <span className="nav-label">{item.label}</span>
                <ChevronRight className="nav-caret" size={15} />
              </Link>
            );
          })}
        </nav>

        <div className="gold-widget">
          <div className="gold-visual" />
          <p>Gold Price (22K)</p>
          <strong>
            ₹ {rates["22K"].toLocaleString("en-IN")} <span>/gm</span>
          </strong>
          <em>↑ 1.21% vs yesterday</em>
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
          <div className="search-box">
            <Search size={18} />
            <input placeholder={searchPlaceholder} />
            <kbd>Ctrl K</kbd>
          </div>

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
              {menu === "calendar" ? <div className="dropdown"><MiniCalendar /></div> : null}
            </div>

            <Link className="icon-button" aria-label="Settings" href="/settings"><Settings size={20} /></Link>
          </div>

          <div className="menu-wrap">
            <button className="profile" type="button" onClick={() => setMenu(menu === "profile" ? null : "profile")}>
              <div className="avatar">{initials}</div>
              <div className="profile-text">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
              <ChevronDown size={16} />
            </button>
            {menu === "profile" ? (
              <div className="dropdown right">
                <Link href="/settings" onClick={() => setMenu(null)}>Settings</Link>
                <button type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>
              </div>
            ) : null}
          </div>
        </header>

        {menu ? <button className="menu-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => setMenu(null)} /> : null}

        {children}
      </main>
    </div>
  );
}

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="mini-cal">
      <div className="mini-cal-head">{now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
      <div className="mini-cal-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span className="dow" key={i}>{d}</span>)}
        {cells.map((c, i) => (
          <span key={i} className={c === now.getDate() ? "day today" : "day"}>{c ?? ""}</span>
        ))}
      </div>
    </div>
  );
}
