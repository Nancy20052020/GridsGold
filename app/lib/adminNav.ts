import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Home,
  LayoutGrid,
  Package,
  Settings,
  ShoppingCart,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

/** Grids Gold admin — nine core modules */
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, description: "Executive overview" },
  { label: "POS & Sales", href: "/pos", icon: ShoppingCart, description: "Counter & invoices" },
  { label: "Inventory", href: "/inventory", icon: Boxes, description: "Stock & catalog" },
  { label: "Finance", href: "/finance", icon: WalletCards, description: "Receivables & payables" },
  { label: "Customers", href: "/customers", icon: UserRound, description: "CRM & profiles" },
  { label: "Repairs", href: "/repairs", icon: Wrench, description: "Service pipeline" },
  { label: "Purchases", href: "/purchase-orders", icon: Package, description: "Suppliers & POs" },
  { label: "Reports", href: "/reports", icon: LayoutGrid, description: "MIS & exports" },
  { label: "Settings", href: "/settings", icon: Settings, description: "Branches & config" },
];

export const adminNavGroups = [{ label: "Admin", items: adminNavItems }];

export const adminQuickAddLinks = [
  { label: "New sale", href: "/pos" },
  { label: "Add item", href: "/inventory/new" },
  { label: "New customer", href: "/customers" },
  { label: "New repair", href: "/repairs" },
  { label: "New PO", href: "/purchase-orders" },
];
