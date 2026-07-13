import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Factory,
  Gem,
  Handshake,
  LayoutGrid,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

export type LandingModuleItem = {
  icon: LucideIcon;
  title: string;
  copy: string;
  href: string;
};

export type LandingModuleGroup = {
  label: string;
  items: LandingModuleItem[];
};

/** SRS v1 modules — linked to real admin routes for demo */
export const moduleGroups: LandingModuleGroup[] = [
  {
    label: "Daily operations",
    items: [
      { icon: ShoppingCart, title: "POS & Sales", copy: "Barcode billing, split payments, receipts.", href: "/pos" },
      { icon: Wrench, title: "Repairs", copy: "Tickets from drop-off to pickup.", href: "/repairs" },
      { icon: UserRound, title: "Customers", copy: "Profiles, history and follow-ups.", href: "/customers" },
      { icon: TrendingUp, title: "Gold rates", copy: "Live 22K/18K pricing everywhere.", href: "/gold-rates" },
    ],
  },
  {
    label: "Inventory & catalog",
    items: [
      { icon: Boxes, title: "Inventory", copy: "Weight, purity, stones and stock.", href: "/inventory" },
      { icon: Gem, title: "Jewelry catalog", copy: "Collections with live-rate tags.", href: "/jewelry" },
      { icon: ReceiptText, title: "Purchasing", copy: "Supplier POs and goods inward.", href: "/purchase-orders" },
      { icon: ReceiptText, title: "Analytics", copy: "Sales trends and branch KPIs.", href: "/analytics" },
    ],
  },
  {
    label: "Money & reports",
    items: [
      { icon: WalletCards, title: "Finance", copy: "Expenses, margins and ledgers.", href: "/finance" },
      { icon: LayoutGrid, title: "Reports", copy: "Sales, stock and branch KPIs.", href: "/reports" },
      { icon: ReceiptText, title: "Invoices", copy: "Printable bills and tax-ready exports.", href: "/sales/invoices" },
      { icon: BarChart3, title: "Dashboard", copy: "Sales trends and showroom KPIs.", href: "/dashboard" },
    ],
  },
  {
    label: "Workshop & scale",
    items: [
      { icon: Factory, title: "Manufacturing", copy: "Job cards and bench tracking.", href: "/manufacturing" },
      { icon: Handshake, title: "Wholesale", copy: "Dealer orders and bulk pricing.", href: "/wholesale" },
      { icon: BarChart3, title: "Multi-branch", copy: "Sync stock across showrooms.", href: "/dashboard" },
      { icon: LayoutGrid, title: "Settings", copy: "Users, branches and preferences.", href: "/settings" },
    ],
  },
];

export const moduleHighlights = moduleGroups.flatMap((g) => g.items);
