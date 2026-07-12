"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  BrainCircuit,
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
  PackageCheck,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "POS / Sales", icon: ShoppingCart, href: "/pos" },
  {
    label: "Inventory",
    icon: Boxes,
    href: "/inventory",
    subItems: ["Stock Overview", "Stock Movements", "Transfers", "Adjustments", "Cycle Counts"],
  },
  { label: "Jewelry", icon: Gem, href: "/jewelry" },
  { label: "Repairs", icon: Wrench, href: "/repairs" },
  { label: "Customers", icon: UserRound, href: "/customers" },
  { label: "Purchasing", icon: PackageCheck, href: "/purchase-orders" },
  { label: "Manufacturing", icon: Factory, href: "/manufacturing" },
  { label: "Wholesale", icon: Handshake, href: "/wholesale" },
  { label: "Finance", icon: WalletCards, href: "/finance" },
  { label: "Reports", icon: ReceiptText, href: "/reports" },
  { label: "Analytics", icon: ChartNoAxesCombined, href: "/analytics" },
  { label: "AI Center", icon: BrainCircuit, href: "/screens" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const mobileItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Sales", icon: ShoppingCart, href: "#" },
  { label: "Inventory", icon: LayoutGrid, href: "/inventory" },
  { label: "Jewelry", icon: Gem, href: "/jewelry" },
  { label: "Customers", icon: UserRound, href: "/customers" },
];

type AppShellProps = {
  children: React.ReactNode;
  searchPlaceholder?: string;
};

function isActive(pathname: string, href?: string) {
  if (!href || href === "#") {
    return false;
  }
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const brandHref = "/dashboard";

export function AppShell({
  children,
  searchPlaceholder = "Search by item, customer, invoice, or barcode...",
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href={brandHref}>
          <div className="brand-mark">G</div>
          <div>
            <strong>GRIDS GOLD</strong>
            <span>JEWELRY ERP</span>
          </div>
        </Link>

        <nav className="nav-list" aria-label="Main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const content = (
              <>
                <Icon size={21} />
                <span>{item.label}</span>
                <ChevronRight size={16} />
              </>
            );

            return (
              <div className="nav-group" key={item.label}>
                {item.href ? (
                  <Link className={`nav-item ${active ? "active" : ""}`} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <button className="nav-item" type="button">
                    {content}
                  </button>
                )}
                {active && item.subItems ? (
                  <div className="subnav">
                    {item.subItems.map((subItem, index) => (
                      <button className={index === 0 ? "active" : ""} key={subItem} type="button">
                        {subItem}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="gold-widget">
          <div className="gold-visual" />
          <p>Gold Price (22K)</p>
          <strong>
            ₹ 7,245 <span>/gm</span>
          </strong>
          <em>↑ 1.21% (₹ 86) vs yesterday</em>
          <div className="mini-spark" />
          <button type="button">View Gold Rates</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" type="button">
            <Menu size={21} />
          </button>
          <div className="search-box">
            <Search size={18} />
            <input placeholder={searchPlaceholder} />
            <kbd>Ctrl K</kbd>
          </div>
          <button className="branch-button" type="button">
            Main Branch <ChevronDown size={16} />
          </button>
          <div className="top-actions">
            <button className="icon-button badge" aria-label="Notifications" type="button">
              <Bell size={20} />
            </button>
            <button className="icon-button" aria-label="Calendar" type="button">
              <CalendarDays size={20} />
            </button>
            <button className="icon-button" aria-label="Settings" type="button">
              <Settings size={20} />
            </button>
            <Link className="icon-button" aria-label="Sign out" href="/">
              <LogOut size={20} />
            </Link>
          </div>
          <div className="profile">
            <div className="avatar">JS</div>
            <div>
              <strong>John Smith</strong>
              <span>Administrator</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </header>

        {children}

        <nav className="mobile-tabbar" aria-label="Mobile navigation">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link className={active ? "active" : ""} href={item.href} key={item.label} aria-label={item.label}>
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}

