import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
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

export const moduleGroups: LandingModuleGroup[] = [
  {
    label: "Daily operations",
    items: [
      { icon: ShoppingCart, title: "POS & Sales", copy: "Barcode billing, split payments, receipts.", href: "#modules" },
      { icon: Wrench, title: "Repairs", copy: "Tickets from drop-off to pickup.", href: "#modules" },
      { icon: UserRound, title: "Customers", copy: "Profiles, history and follow-ups.", href: "#modules" },
      { icon: TrendingUp, title: "Gold rates", copy: "Live 22K/18K pricing everywhere.", href: "#modules" },
    ],
  },
  {
    label: "Inventory & catalog",
    items: [
      { icon: Boxes, title: "Inventory", copy: "Weight, purity, stones and stock.", href: "#modules" },
      { icon: Gem, title: "Jewelry catalog", copy: "Collections with live-rate tags.", href: "#modules" },
      { icon: ReceiptText, title: "Purchasing", copy: "Supplier POs and goods inward.", href: "#modules" },
      { icon: Gem, title: "Customer portal", copy: "Browse, wishlist and reserve online.", href: "#modules" },
    ],
  },
  {
    label: "Money & reports",
    items: [
      { icon: WalletCards, title: "Finance", copy: "Expenses, margins and ledgers.", href: "#modules" },
      { icon: LayoutGrid, title: "Reports", copy: "Sales, stock and branch KPIs.", href: "#modules" },
      { icon: ChartNoAxesCombined, title: "Analytics", copy: "Trends and category mix.", href: "#modules" },
      { icon: ReceiptText, title: "Invoices", copy: "Printable bills and tax-ready exports.", href: "#modules" },
    ],
  },
  {
    label: "Workshop & scale",
    items: [
      { icon: Factory, title: "Manufacturing", copy: "Job cards and bench tracking.", href: "#modules" },
      { icon: Handshake, title: "Wholesale", copy: "Dealer orders and bulk pricing.", href: "#modules" },
      { icon: BarChart3, title: "Multi-branch", copy: "Sync stock across showrooms.", href: "#modules" },
      { icon: LayoutGrid, title: "Settings", copy: "Users, branches and preferences.", href: "#modules" },
    ],
  },
];

export const moduleHighlights = moduleGroups.flatMap((g) => g.items);
