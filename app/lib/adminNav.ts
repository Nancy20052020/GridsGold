import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  Factory,
  FileText,
  Gem,
  Handshake,
  Home,
  LayoutGrid,
  Package,
  ReceiptText,
  ScanBarcode,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
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

/** Gem Logic–style grouped sidebar for Grids Gold admin */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
      { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Sales", href: "/pos", icon: ShoppingCart },
      { label: "Invoices", href: "/sales/invoices", icon: ReceiptText },
      { label: "Quotations", href: "/quotations", icon: FileText },
      { label: "Returns", href: "/sales/returns", icon: ClipboardList },
      { label: "Layaway", href: "/layaway", icon: Package },
    ],
  },
  {
    label: "Contacts",
    items: [
      { label: "Customers", href: "/customers", icon: UserRound },
      { label: "Follow-ups", href: "/follow-ups", icon: ClipboardList },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Jewelry Catalog", href: "/jewelry", icon: Gem },
      { label: "Certificates", href: "/certificates", icon: Award },
    ],
  },
  {
    label: "Stock",
    items: [
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Movements", href: "/inventory/movements", icon: TrendingUp },
      { label: "Transfers", href: "/inventory/transfers", icon: Truck },
      { label: "Adjustments", href: "/inventory/adjustments", icon: ClipboardList },
      { label: "Cycle Count", href: "/inventory/cycle-count", icon: ScanBarcode },
      { label: "Barcode Tags", href: "/barcode-tags", icon: ScanBarcode },
    ],
  },
  {
    label: "Repairs",
    items: [
      { label: "Repairs", href: "/repairs", icon: Wrench },
      { label: "Custom Orders", href: "/custom-orders", icon: Package },
    ],
  },
  {
    label: "Purchasing",
    items: [
      { label: "Suppliers", href: "/suppliers", icon: Handshake },
      { label: "Purchase Orders", href: "/purchase-orders", icon: ReceiptText },
      { label: "Goods Received", href: "/goods-received", icon: Package },
    ],
  },
  {
    label: "Manufacturing",
    items: [
      { label: "Workshop", href: "/manufacturing", icon: Factory },
      { label: "Job Work Orders", href: "/job-work-orders", icon: ClipboardList },
      { label: "Karigar Tracking", href: "/karigar-tracking", icon: UserRound },
    ],
  },
  {
    label: "Wholesale",
    items: [
      { label: "B2B Customers", href: "/wholesale", icon: Handshake },
      { label: "Bulk Orders", href: "/bulk-orders", icon: Package },
      { label: "Dispatch", href: "/dispatch", icon: Truck },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Finance Hub", href: "/finance", icon: WalletCards },
      { label: "Payments", href: "/payments", icon: WalletCards },
      { label: "Expenses", href: "/expenses", icon: ReceiptText },
      { label: "Ledger", href: "/ledger", icon: BarChart3 },
      { label: "GST / Tax", href: "/gst-tax", icon: FileText },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Reports Hub", href: "/reports", icon: LayoutGrid },
      { label: "Sales Report", href: "/reports/sales", icon: BarChart3 },
      { label: "Inventory Report", href: "/reports/inventory", icon: Boxes },
      { label: "Branch Report", href: "/reports/branch", icon: TrendingUp },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Gold Rates", href: "/gold-rates", icon: TrendingUp },
      { label: "Notifications", href: "/notifications", icon: ClipboardList },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Audit Log", href: "/audit-log", icon: FileText },
    ],
  },
];

export const adminQuickAddLinks = [
  { label: "New sale", href: "/pos" },
  { label: "Add item", href: "/inventory/new" },
  { label: "New customer", href: "/customers" },
  { label: "New repair", href: "/repairs" },
];
