/** Phase 1 SRS dictionaries — shared labels, codes, and UI helpers (v2 Deep Dive). */

export const COMPANY_CODE = "GRD-HQ";
export const DEFAULT_BRANCH_CODE = "JED-01";
export const DEFAULT_COUNTRY_CODE = "SA";
export const INVOICE_NUMBER_PATTERN = "{doc_type}-{country_code}-{branch_code}-{fiscal_year}-{running_sequence}";

export const CUSTOMER_TYPES = ["retail", "wholesale", "walk_in", "vip"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_STATUSES = ["active", "inactive", "blocked", "archived"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

/** Deep Dive §19.1 — invoice issue_status */
export const INVOICE_STATUSES = [
  "draft",
  "posted",
  "paid",
  "partial",
  "voided",
  "refunded",
  "exchanged",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Deep Dive §19.3 — repair current_status */
export const REPAIR_STATUSES = [
  "received",
  "diagnosis",
  "estimate",
  "awaiting_approval",
  "in_progress",
  "quality_check",
  "ready",
  "delivered",
  "cancelled",
] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

/** Kanban / advance flow (excludes cancelled). */
export const REPAIR_BOARD_FLOW: RepairStatus[] = [
  "received",
  "diagnosis",
  "estimate",
  "awaiting_approval",
  "in_progress",
  "quality_check",
  "ready",
  "delivered",
];

/** Deep Dive §7.6 — po_status */
export const PO_STATUSES = [
  "draft",
  "approved",
  "ordered",
  "in_transit",
  "partial",
  "received",
  "closed",
  "cancelled",
] as const;
export type PoStatus = (typeof PO_STATUSES)[number];

/** Kanban purchase workflow (excludes cancelled / partial side-track). */
export const PO_BOARD_FLOW: PoStatus[] = [
  "draft",
  "approved",
  "ordered",
  "in_transit",
  "received",
  "closed",
];

export const ITEM_STATUSES = [
  "available",
  "reserved",
  "sold",
  "repair",
  "custom_order",
  "memo_out",
  "damaged",
  "archived",
] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

/** Deep Dive §19.4 — work order production_status */
export const WORK_ORDER_STATUSES = [
  "planned",
  "released",
  "in_progress",
  "completed",
  "closed",
  "cancelled",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

/** Deep Dive §19.2 — transfer_status */
export const TRANSFER_STATUSES = ["draft", "shipped", "received", "cancelled"] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

/** Deep Dive §17.6 — movement_type */
export const MOVEMENT_TYPES = [
  "receive",
  "sale",
  "return",
  "transfer_out",
  "transfer_in",
  "adjust_up",
  "adjust_down",
  "repair_out",
  "repair_in",
  "cycle_count",
] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const PAYMENT_METHODS = [
  "Cash",
  "Card",
  "Bank Transfer",
  "Cheque",
  "Gift Card",
  "Store Credit",
] as const;

export const PAYMENT_METHOD_CODES: Record<string, string> = {
  Cash: "cash",
  Card: "card",
  "Bank Transfer": "bank_transfer",
  Cheque: "cheque",
  "Gift Card": "gift_card",
  "Store Credit": "store_credit",
};

export const LOCATION_TYPES = [
  "showroom",
  "warehouse",
  "safe",
  "tray",
  "workshop",
  "transit",
  "damaged",
  "memo_out",
] as const;

/** Deep Dive §17.5 — priority_level */
export const REPAIR_PRIORITIES = ["normal", "urgent", "vip"] as const;
export type RepairPriority = (typeof REPAIR_PRIORITIES)[number];

export const ITEM_REFERENCE_TYPES = ["existing_item", "external_item", "custom_entry"] as const;
export type ItemReferenceType = (typeof ITEM_REFERENCE_TYPES)[number];

/** Deep Dive §12 — reporting model */
export const SRS_REPORTS = [
  "Sales Summary",
  "Sales by Category",
  "Top Products",
  "Inventory Balance",
  "Inventory Aging",
  "Transfer History",
  "Stock Valuation",
  "Purchase History",
  "Receivables Aging",
  "Payables Aging",
  "Profit & Loss",
  "Balance Sheet",
  "Repair Pipeline",
  "Customer History",
  "Manufacturing Pipeline",
  "Tax Summary",
  "Rate History",
] as const;

export type SrsReport = (typeof SRS_REPORTS)[number];

/** §12 report families — jewellery ERP reporting hub */
export const SRS_REPORT_CATEGORIES = {
  Sales: ["Sales Summary", "Sales by Category", "Top Products"],
  Inventory: ["Inventory Balance", "Inventory Aging", "Transfer History", "Stock Valuation"],
  Purchase: ["Purchase History"],
  Repairs: ["Repair Pipeline"],
  Manufacturing: ["Manufacturing Pipeline"],
  Customers: ["Customer History"],
  Finance: ["Receivables Aging", "Payables Aging", "Profit & Loss", "Balance Sheet"],
  Tax: ["Tax Summary", "Rate History"],
} as const satisfies Record<string, readonly SrsReport[]>;

export type SrsReportCategory = keyof typeof SRS_REPORT_CATEGORIES;

/** Supported company / document currencies */
export const CURRENCY_CODES = ["INR", "USD", "AED", "SAR"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  INR: "INR (₹)",
  USD: "USD ($)",
  AED: "AED (د.إ)",
  SAR: "SAR",
};

/** Demo locations per FR-ORG-002 (branch → location). */
export const DEMO_LOCATIONS = [
  { code: "SHOW-01", name: "Main Showroom", type: "showroom", branch: "Main Branch" },
  { code: "SAFE-A1", name: "Vault Safe A1", type: "safe", branch: "Vault" },
  { code: "TRAY-12", name: "Showcase Tray 12", type: "tray", branch: "Main Branch" },
  { code: "WH-01", name: "Warehouse", type: "warehouse", branch: "Branch 2" },
  { code: "TRANSIT", name: "In Transit", type: "transit", branch: "Main Branch" },
] as const;

const LABELS: Record<string, string> = {
  retail: "Retail",
  wholesale: "Wholesale",
  walk_in: "Walk-in",
  vip: "VIP",
  active: "Active",
  inactive: "Inactive",
  blocked: "Blocked",
  archived: "Archived",
  draft: "Draft",
  posted: "Posted",
  paid: "Paid",
  partial: "Partial Receipt",
  voided: "Voided",
  refunded: "Refunded",
  exchanged: "Exchanged",
  received: "Received",
  diagnosis: "Inspection",
  estimate: "Estimate",
  awaiting_approval: "Approval",
  in_progress: "Repairing",
  quality_check: "Quality Check",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
  approved: "Approval",
  ordered: "Ordered",
  in_transit: "In Transit",
  closed: "Completed",
  shipped: "Shipped",
  showroom: "Showroom",
  warehouse: "Warehouse",
  safe: "Safe",
  tray: "Tray",
  workshop: "Workshop",
  transit: "Transit",
  existing_item: "Existing item",
  external_item: "External item",
  custom_entry: "Custom entry",
  receive: "Receive",
  sale: "Sale",
  return: "Return",
  transfer_out: "Transfer out",
  transfer_in: "Transfer in",
  adjust_up: "Adjust up",
  adjust_down: "Adjust down",
  repair_out: "Repair out",
  repair_in: "Repair in",
  cycle_count: "Cycle count",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  repair: "In Repair",
  custom_order: "Custom Order",
  planned: "Planned",
  released: "Released",
  completed: "Completed",
  normal: "Normal",
  urgent: "Urgent",
};

/** Human-readable label for SRS enum values. */
export function srsLabel(value: string): string {
  return LABELS[value] ?? value.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/** Map legacy store values to SRS repair status. */
export function migrateRepairStatus(status: string): RepairStatus {
  const map: Record<string, RepairStatus> = {
    Received: "received",
    "In Progress": "in_progress",
    Ready: "ready",
    Delivered: "delivered",
    approved: "in_progress",
    outsourced: "in_progress",
  };
  if (REPAIR_STATUSES.includes(status as RepairStatus)) return status as RepairStatus;
  return map[status] ?? "received";
}

/** Map legacy invoice status to SRS. */
export function migrateInvoiceStatus(status: string): InvoiceStatus {
  const map: Record<string, InvoiceStatus> = {
    Paid: "paid",
    Draft: "draft",
  };
  if (INVOICE_STATUSES.includes(status as InvoiceStatus)) return status as InvoiceStatus;
  return map[status] ?? "posted";
}

/** Map legacy PO status to SRS. */
export function migratePoStatus(status: string): PoStatus {
  const map: Record<string, PoStatus> = {
    Draft: "draft",
    Sent: "approved",
    submitted: "approved",
    Ordered: "ordered",
    "In Transit": "in_transit",
    Received: "received",
    partially_received: "partial",
    Completed: "closed",
  };
  if (PO_STATUSES.includes(status as PoStatus)) return status as PoStatus;
  return map[status] ?? "draft";
}

/** Map legacy work order status to SRS. */
export function migrateWorkOrderStatus(status: string): WorkOrderStatus {
  const map: Record<string, WorkOrderStatus> = {
    Planned: "planned",
    "In Progress": "in_progress",
    Completed: "completed",
    qc: "in_progress",
  };
  if (WORK_ORDER_STATUSES.includes(status as WorkOrderStatus)) return status as WorkOrderStatus;
  return map[status] ?? "planned";
}

/** Map legacy movement labels to SRS movement_type. */
export function legacyMovementLabel(type: string): string {
  const map: Record<string, MovementType> = {
    Sale: "sale",
    Transfer: "transfer_out",
    Adjustment: "adjust_down",
    "Cycle Count": "cycle_count",
  };
  const key = map[type];
  return key ? srsLabel(key) : srsLabel(type);
}

export function migrateRepairPriority(priority?: string): RepairPriority {
  const map: Record<string, RepairPriority> = {
    low: "normal",
    high: "urgent",
    VIP: "vip",
  };
  if (priority && REPAIR_PRIORITIES.includes(priority as RepairPriority)) return priority as RepairPriority;
  return map[priority ?? ""] ?? "normal";
}

/** Map legacy customer type to SRS. */
export function migrateCustomerType(type: string): CustomerType {
  const map: Record<string, CustomerType> = {
    Retail: "retail",
    Wholesale: "wholesale",
    VIP: "vip",
  };
  if (CUSTOMER_TYPES.includes(type as CustomerType)) return type as CustomerType;
  return map[type] ?? "retail";
}

/** Status pill tone for tables. */
export function srsPillTone(
  status: string,
): "success" | "warning" | "danger" {
  const warning = new Set([
    "partial",
    "posted",
    "in_progress",
    "awaiting_approval",
    "estimate",
    "quality_check",
    "ordered",
    "in_transit",
    "approved",
    "submitted",
    "partially_received",
    "diagnosis",
    "released",
    "qc",
    "reserved",
    "repair",
  ]);
  const success = new Set([
    "paid",
    "closed",
    "delivered",
    "ready",
    "completed",
    "available",
    "active",
    "received",
  ]);
  if (success.has(status)) return "success";
  if (warning.has(status)) return "warning";
  return "danger";
}

/** Derive SRS item status from stock count. */
export function stockToItemStatus(stock: number): ItemStatus {
  if (stock <= 0) return "sold";
  if (stock <= 3) return "reserved";
  return "available";
}

/** Next repair status in the SRS workflow (for advance action). */
export function nextRepairStatus(current: RepairStatus): RepairStatus | null {
  const idx = REPAIR_BOARD_FLOW.indexOf(current);
  return idx >= 0 && idx < REPAIR_BOARD_FLOW.length - 1 ? REPAIR_BOARD_FLOW[idx + 1] : null;
}

/** Next purchase-order status in the kanban workflow. */
export function nextPoStatus(current: PoStatus): PoStatus | null {
  const idx = PO_BOARD_FLOW.indexOf(current);
  return idx >= 0 && idx < PO_BOARD_FLOW.length - 1 ? PO_BOARD_FLOW[idx + 1] : null;
}
