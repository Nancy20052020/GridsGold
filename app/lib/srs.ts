/** Phase 1 SRS dictionaries — shared labels, codes, and UI helpers. */

export const COMPANY_CODE = "GRZ-HQ";
export const DEFAULT_BRANCH_CODE = "JED-01";
export const INVOICE_NUMBER_PATTERN = "{doc_type}-{country_code}-{branch_code}-{fiscal_year}-{running_sequence}";

export const CUSTOMER_TYPES = ["retail", "wholesale", "walk_in", "vip"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_STATUSES = ["active", "inactive", "blocked", "archived"] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

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

export const REPAIR_STATUSES = [
  "received",
  "diagnosis",
  "awaiting_approval",
  "approved",
  "in_progress",
  "outsourced",
  "ready",
  "delivered",
  "cancelled",
] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const PO_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "partially_received",
  "closed",
  "cancelled",
] as const;
export type PoStatus = (typeof PO_STATUSES)[number];

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

export const WORK_ORDER_STATUSES = [
  "planned",
  "released",
  "in_progress",
  "qc",
  "completed",
  "closed",
  "cancelled",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "Cash",
  "Card",
  "Bank Transfer",
  "Cheque",
  "Gift Card",
  "Customer Credit",
] as const;

export const LOCATION_TYPES = [
  "Showroom",
  "Warehouse",
  "Safe",
  "Tray",
  "Workshop",
  "Transit",
  "Damaged",
  "Memo-out",
] as const;

export const REPAIR_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type RepairPriority = (typeof REPAIR_PRIORITIES)[number];

export const SRS_REPORTS = [
  "Sales Summary",
  "Inventory Aging",
  "Repair Pipeline",
  "Customer History",
  "Tax Summary",
  "Purchase History",
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
  partial: "Partially Paid",
  voided: "Voided",
  refunded: "Refunded",
  exchanged: "Exchanged",
  received: "Received",
  diagnosis: "Diagnosis",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  in_progress: "In Progress",
  outsourced: "Outsourced",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
  submitted: "Submitted",
  partially_received: "Partially Received",
  closed: "Closed",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  repair: "In Repair",
  custom_order: "Custom Order",
  memo_out: "Memo Out",
  damaged: "Damaged",
  planned: "Planned",
  released: "Released",
  qc: "Quality Check",
  completed: "Completed",
  low: "Low",
  normal: "Normal",
  high: "High",
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
    Sent: "submitted",
    Received: "closed",
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
  };
  if (WORK_ORDER_STATUSES.includes(status as WorkOrderStatus)) return status as WorkOrderStatus;
  return map[status] ?? "planned";
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
  const success = new Set([
    "paid",
    "closed",
    "delivered",
    "ready",
    "completed",
    "available",
    "active",
    "approved",
  ]);
  const warning = new Set([
    "partial",
    "posted",
    "in_progress",
    "awaiting_approval",
    "submitted",
    "partially_received",
    "diagnosis",
    "released",
    "qc",
    "reserved",
    "repair",
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
  const flow: RepairStatus[] = [
    "received",
    "diagnosis",
    "awaiting_approval",
    "approved",
    "in_progress",
    "ready",
    "delivered",
  ];
  const idx = flow.indexOf(current);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}
