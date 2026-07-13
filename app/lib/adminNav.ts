import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Factory,
  Gem,
  Handshake,
  Home,
  LayoutGrid,
  ReceiptText,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

/** Streamlined admin sidebar — one entry per core workflow; detail screens reached in-app. */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    label: "Sales",
    items: [
      { label: "POS / Sales", href: "/pos", icon: ShoppingCart },
      { label: "Invoices", href: "/sales/invoices", icon: ReceiptText },
    ],
  },
  {
    label: "Stock & Catalog",
    items: [
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Jewelry Catalog", href: "/jewelry", icon: Gem },
    ],
  },
  {
    label: "Customers",
    items: [{ label: "Customers", href: "/customers", icon: UserRound }],
  },
  {
    label: "Repairs",
    items: [{ label: "Repairs", href: "/repairs", icon: Wrench }],
  },
  {
    label: "Purchasing",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: Handshake },
      { label: "Purchase Orders", href: "/purchase-orders", icon: ReceiptText },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Manufacturing", href: "/manufacturing", icon: Factory },
      { label: "Wholesale", href: "/wholesale", icon: Handshake },
      { label: "Finance", href: "/finance", icon: WalletCards },
      { label: "Reports", href: "/reports", icon: LayoutGrid },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Gold Rates", href: "/gold-rates", icon: TrendingUp },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const adminQuickAddLinks = [
  { label: "New sale", href: "/pos" },
  { label: "Add item", href: "/inventory/new" },
  { label: "New customer", href: "/customers" },
  { label: "New repair", href: "/repairs" },
];
