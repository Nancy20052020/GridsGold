import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ChartNoAxesCombined,
  Factory,
  Gem,
  Handshake,
  Home,
  LayoutGrid,
  Package,
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

/**
 * Grids Gold SRS v1 — 15 admin modules (frontend-only).
 * Flat sidebar for presentation; sub-screens open from each hub.
 */
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "POS & Sales", href: "/pos", icon: ShoppingCart },
  { label: "Invoices", href: "/sales/invoices", icon: ReceiptText },
  { label: "Inventory", href: "/inventory", icon: Boxes },
  { label: "Jewelry Catalog", href: "/jewelry", icon: Gem },
  { label: "Customers", href: "/customers", icon: UserRound },
  { label: "Repairs", href: "/repairs", icon: Wrench },
  { label: "Gold Rates", href: "/gold-rates", icon: TrendingUp },
  { label: "Purchasing", href: "/purchase-orders", icon: Package },
  { label: "Manufacturing", href: "/manufacturing", icon: Factory },
  { label: "Wholesale", href: "/wholesale", icon: Handshake },
  { label: "Finance", href: "/finance", icon: WalletCards },
  { label: "Reports", href: "/reports", icon: LayoutGrid },
  { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** @deprecated Use adminNavItems — kept for search compatibility */
export const adminNavGroups = [{ label: "Modules", items: adminNavItems }];

export const adminQuickAddLinks = [
  { label: "New sale", href: "/pos" },
  { label: "Add item", href: "/inventory/new" },
  { label: "New customer", href: "/customers" },
  { label: "New repair", href: "/repairs" },
];
