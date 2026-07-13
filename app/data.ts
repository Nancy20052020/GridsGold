export type ScreenKind = "hub" | "table" | "detail" | "form" | "pos" | "report" | "settings" | "workflow";

export type ScreenConfig = {
  path: string;
  title: string;
  module: string;
  kind: ScreenKind;
  subtitle: string;
  primaryAction?: string;
};

export const moduleNav = [
  { label: "Dashboard", path: "/" },
  { label: "POS / Sales", path: "/pos" },
  { label: "Inventory", path: "/inventory" },
  { label: "Jewelry", path: "/jewelry" },
  { label: "Repairs", path: "/repairs" },
  { label: "Customers", path: "/customers" },
  { label: "Purchasing", path: "/purchasing" },
  { label: "Manufacturing", path: "/manufacturing" },
  { label: "Wholesale", path: "/wholesale" },
  { label: "Finance", path: "/finance" },
  { label: "Reports", path: "/reports" },
  { label: "Analytics", path: "/analytics" },
  { label: "Gold Rates", path: "/gold-rates" },
  { label: "Settings", path: "/settings" },
];

const seeds: Array<[string, string, string, ScreenKind, string?]> = [
  ["/screens", "All Screens", "Project Map", "hub"],
  ["/login", "Login", "Access", "form", "Sign In"],
  ["/branch-selection", "Branch Selection", "Access", "hub", "Enter Branch"],
  ["/pos", "POS / Quick Sale", "Sales Counter", "pos", "Checkout"],
  ["/invoice-checkout", "Invoice Checkout", "Sales Counter", "pos", "Collect Payment"],
  ["/sales/invoices", "Sales Invoices", "Sales", "table", "New Invoice"],
  ["/sales/returns", "Sales Returns / Exchange", "Sales", "workflow", "Create Return"],
  ["/quotations", "Quotations", "Sales", "table", "New Quotation"],
  ["/layaway", "Layaway / Hold Orders", "Sales", "table", "New Hold"],
  ["/inventory", "Inventory Overview", "Inventory", "table", "Add New Item"],
  ["/inventory/new", "Add Inventory Item", "Inventory", "form", "Save Item"],
  ["/inventory/item-details", "Inventory Item Details", "Inventory", "detail", "Edit Item"],
  ["/inventory/movements", "Stock Movements", "Inventory", "table"],
  ["/inventory/transfers", "Stock Transfers", "Inventory", "workflow", "New Transfer"],
  ["/inventory/adjustments", "Stock Adjustments", "Inventory", "workflow", "New Adjustment"],
  ["/inventory/cycle-count", "Cycle Count", "Inventory", "workflow", "Start Count"],
  ["/barcode-tags", "Barcode / Tag Printing", "Inventory", "settings", "Print Tags"],
  ["/jewelry", "Jewelry Catalog", "Product Catalog", "table", "Add Product"],
  ["/jewelry/product-details", "Jewelry Product Details", "Product Catalog", "detail", "Add to Cart"],
  ["/certificates", "Certificates / Documents", "Product Catalog", "table", "Upload Certificate"],
  ["/customers", "Customers List", "CRM", "table", "Add Customer"],
  ["/customers/profile", "Customer Profile", "CRM", "detail", "Create Sale"],
  ["/customers/purchase-history", "Customer Purchase History", "CRM", "table"],
  ["/follow-ups", "Follow-ups / Tasks", "CRM", "workflow", "New Task"],
  ["/repairs", "Repairs List", "Repairs", "table", "New Repair"],
  ["/repairs/ticket", "Repair Ticket Details", "Repairs", "detail", "Mark Ready"],
  ["/custom-orders", "Custom Orders", "Repairs", "workflow", "New Custom Order"],
  ["/repair-delivery", "Repair Delivery / Pickup", "Repairs", "table"],
  ["/suppliers", "Suppliers", "Purchasing", "table", "Add Supplier"],
  ["/purchase-orders", "Purchase Orders", "Purchasing", "table", "New PO"],
  ["/goods-received", "Goods Received", "Purchasing", "workflow", "New GRN"],
  ["/supplier-payments", "Supplier Payments", "Purchasing", "table", "Record Payment"],
  ["/manufacturing", "Manufacturing Dashboard", "Manufacturing", "hub", "New Job Work"],
  ["/job-work-orders", "Job Work Orders", "Manufacturing", "table", "New Job"],
  ["/karigar-tracking", "Karigar / Workshop Tracking", "Manufacturing", "table"],
  ["/raw-material-issue", "Raw Material Issue", "Manufacturing", "workflow", "Issue Material"],
  ["/finished-goods-receipt", "Finished Goods Receipt", "Manufacturing", "workflow", "Receive Finished"],
  ["/wastage-tracking", "Wastage / Loss Tracking", "Manufacturing", "report"],
  ["/wholesale", "Wholesale Customers", "Wholesale", "table", "Add B2B Customer"],
  ["/bulk-orders", "Bulk Orders", "Wholesale", "table", "New Bulk Order"],
  ["/dispatch", "Dispatch / Delivery Challan", "Wholesale", "workflow", "New Dispatch"],
  ["/wholesale-pricing", "Wholesale Pricing", "Wholesale", "settings"],
  ["/finance", "Finance Overview", "Finance", "hub"],
  ["/payments", "Payments", "Finance", "table", "Record Payment"],
  ["/expenses", "Expenses", "Finance", "table", "Add Expense"],
  ["/ledger", "Cash / Bank Ledger", "Finance", "table"],
  ["/gst-tax", "GST / Tax Summary", "Finance", "report"],
  ["/reports", "Reports Hub", "Reports", "report", "Export PDF"],
  ["/reports/sales", "Sales Report", "Reports", "report"],
  ["/reports/inventory", "Inventory Valuation Report", "Reports", "report"],
  ["/reports/profit", "Profit / Margin Report", "Reports", "report"],
  ["/reports/branch", "Branch Performance Report", "Reports", "report"],
  ["/reports/customers", "Customer Report", "Reports", "report"],
  ["/reports/products", "Product Performance Report", "Reports", "report"],
  ["/analytics", "Analytics Dashboard", "Analytics", "hub"],
  ["/gold-rates", "Live Gold Rates", "Metal Rates", "settings", "View Live Feed"],
  ["/notifications", "Notifications / Activity Center", "System", "workflow"],
  ["/roles", "User Roles & Permissions", "Settings", "settings", "New Role"],
  ["/settings", "Company / Branch Settings", "Settings", "settings", "Save Changes"],
  ["/invoice-settings", "Invoice / Print Settings", "Settings", "settings"],
  ["/masters", "Category, Purity & Metal Settings", "Settings", "settings"],
  ["/import-export", "Import / Export Data", "Settings", "settings", "Import CSV"],
  ["/audit-log", "Audit Log", "Settings", "table"],
];

function subtitleFor(title: string, module: string, kind: ScreenKind) {
  const base = `${title} for the Grids Gold jewellery ERP.`;
  if (kind === "table") return `${base} Includes filters, status tracking, branch context, and export-ready data.`;
  if (kind === "detail") return `${base} Shows summary, linked records, timeline, documents, and quick actions.`;
  if (kind === "form") return `${base} Clean data-entry flow with required jewellery business fields.`;
  if (kind === "workflow") return `${base} Tracks approvals, stages, owners, due dates, and audit status.`;
  if (kind === "report") return `${base} Review totals, drilldowns, and export-ready reporting views.`;
  if (kind === "settings") return `${base} Configure ${module.toLowerCase()} preferences with safe defaults.`;
  return `${base} High-level cards, trends, and operational shortcuts.`;
}

export const screenConfigs: ScreenConfig[] = seeds.map(([path, title, module, kind, primaryAction]) => ({
  path,
  title,
  module,
  kind,
  primaryAction,
  subtitle: subtitleFor(title, module, kind),
}));

export const screenGroups = [
  { title: "Access", paths: ["/login", "/branch-selection"] },
  { title: "Sales", paths: ["/pos", "/invoice-checkout", "/sales/invoices", "/sales/returns", "/quotations", "/layaway"] },
  { title: "Inventory", paths: ["/inventory", "/inventory/new", "/inventory/item-details", "/inventory/movements", "/inventory/transfers", "/inventory/adjustments", "/inventory/cycle-count", "/barcode-tags"] },
  { title: "Jewelry Catalog", paths: ["/jewelry", "/jewelry/product-details", "/certificates"] },
  { title: "CRM", paths: ["/customers", "/customers/profile", "/customers/purchase-history", "/follow-ups"] },
  { title: "Repairs", paths: ["/repairs", "/repairs/ticket", "/custom-orders", "/repair-delivery"] },
  { title: "Purchasing", paths: ["/suppliers", "/purchase-orders", "/goods-received", "/supplier-payments"] },
  { title: "Manufacturing", paths: ["/manufacturing", "/job-work-orders", "/karigar-tracking", "/raw-material-issue", "/finished-goods-receipt", "/wastage-tracking"] },
  { title: "Wholesale", paths: ["/wholesale", "/bulk-orders", "/dispatch", "/wholesale-pricing"] },
  { title: "Finance", paths: ["/finance", "/payments", "/expenses", "/ledger", "/gst-tax"] },
  { title: "Reports & Analytics", paths: ["/reports", "/reports/sales", "/reports/inventory", "/reports/profit", "/reports/branch", "/reports/customers", "/reports/products", "/analytics", "/gold-rates"] },
  { title: "System", paths: ["/notifications", "/roles", "/settings", "/invoice-settings", "/masters", "/import-export", "/audit-log"] },
];

export function getScreen(path: string) {
  return screenConfigs.find((screen) => screen.path === path);
}

export const inventoryRows = [
  ["22K Gold Ring", "RG22K-00124", "Rings", "22K (916)", "5.250 g", "In Stock", "Main Branch", "₹ 38,051"],
  ["Gold Necklace Set", "NK22K-00098", "Necklaces", "22K (916)", "18.750 g", "In Stock", "Main Branch", "₹ 1,35,919"],
  ["Diamond Earrings", "ER18K-00231", "Earrings", "18K (750)", "6.120 g", "In Stock", "Branch 2", "₹ 72,031"],
  ["Gold Bangle", "BG22K-00112", "Bangles", "22K (916)", "15.300 g", "Low Stock", "Main Branch", "₹ 2,21,759"],
  ["Gold Pendant", "PD22K-00177", "Pendants", "22K (916)", "4.760 g", "In Stock", "Branch 3", "₹ 48,500"],
  ["Gold Bar 10g", "GB22K-01003", "Gold Bars", "24K (999)", "10.000 g", "In Stock", "Vault", "₹ 3,47,500"],
];

export const sampleRows = [
  ["INV-10248", "John Smith", "Gold Necklace", "₹ 1,45,280", "Paid", "30 Apr, 2025"],
  ["REP-1023", "Priya Mehta", "Ring resizing", "₹ 1,200", "At Bench", "02 May, 2025"],
  ["PO-3301", "Raj Gems", "Diamonds", "₹ 8,75,000", "Received", "29 Apr, 2025"],
  ["TRF-00145", "Main Branch", "Branch 2", "5 items", "In Transit", "30 Apr, 2025"],
];

