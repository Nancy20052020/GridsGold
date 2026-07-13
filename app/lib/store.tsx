"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { userFromSupabase } from "./auth";
import { isSupabaseConfigured, supabase } from "./supabase";
import {
  migrateCustomerType,
  migrateInvoiceStatus,
  migratePoStatus,
  migrateRepairPriority,
  migrateRepairStatus,
  migrateWorkOrderStatus,
  type CustomerStatus,
  type CustomerType,
  type InvoiceStatus,
  type ItemReferenceType,
  type PoStatus,
  type RepairPriority,
  type RepairStatus,
  type WorkOrderStatus,
  type CurrencyCode,
  CURRENCY_CODES,
} from "./srs";

/* ----------------------------- Types ----------------------------- */

export type Karat = "24K" | "22K" | "18K" | "925" | "PT950";

export type Item = {
  id: string;
  name: string;
  sku: string;
  category: string;
  karat: Karat;
  weight: number;
  making: number;
  stoneValue: number;
  stock: number;
  branch: string;
  icon: string;
  image?: string;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  city: string;
  type: CustomerType;
  preferredLanguage?: string;
  status?: CustomerStatus;
  vipFlag?: boolean;
  consentSms?: boolean;
  consentWhatsapp?: boolean;
  consentEmail?: boolean;
  blacklistFlag?: boolean;
};

export type InvoiceLine = { name: string; qty: number; amount: number };

export type Invoice = {
  id: string;
  number: string;
  customer: string;
  date: string;
  lines: InvoiceLine[];
  subtotal: number;
  gst: number;
  total: number;
  status: InvoiceStatus;
};

export type Repair = {
  id: string;
  number: string;
  customer: string;
  item: string;
  issue: string;
  status: RepairStatus;
  estimate: number;
  approvedAmount?: number;
  deposit?: number;
  balanceDue?: number;
  promisedDate?: string;
  priority?: RepairPriority;
  itemReferenceType?: ItemReferenceType;
  observedCondition?: string;
  metalDetails?: string;
  stoneDetails?: string;
  date: string;
};

export type Supplier = {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  city: string;
  phone: string;
  paymentTerms?: string;
  currency?: CurrencyCode;
  balance: number;
};

export type PurchaseOrder = {
  id: string;
  number: string;
  supplier: string;
  items: string;
  amount: number;
  branch?: string;
  currency?: CurrencyCode;
  status: PoStatus;
  date: string;
};

export type Movement = {
  id: string;
  date: string;
  type: "Transfer" | "Adjustment" | "Cycle Count" | "Sale";
  item: string;
  qty: number;
  from: string;
  to: string;
  user: string;
};

export type Expense = { id: string; date: string; category: string; note: string; amount: number };

export type BulkOrder = { id: string; number: string; customer: string; pieces: number; amount: number; status: "Draft" | "Confirmed" | "Dispatched"; date: string };

export type WorkOrder = {
  id: string;
  number: string;
  product: string;
  karigar: string;
  qtyPlanned: number;
  qtyDone: number;
  status: WorkOrderStatus;
  due: string;
};

export type CartLine = { itemId: string; qty: number };
export type Rates = Record<Karat, number>;
export type Role = "admin";
export type User = { name: string; email: string; role: Role; mobile?: string; city?: string };
export type Notification = { id: string; text: string; time: string; read: boolean };
export type Theme = "light" | "dark";

export const BRANCHES = ["Main Branch", "Branch 2", "Branch 3", "Branch 4", "Vault"];

/* --------------------------- Seed data --------------------------- */

const seedRates: Rates = { "24K": 7900, "22K": 7245, "18K": 5920, "925": 85, PT950: 3150 };

const seedItems: Item[] = [
  { id: "it1", name: "Textured Gold Band Ring", sku: "RG22K-00124", category: "Rings", karat: "22K", weight: 5.25, making: 1200, stoneValue: 0, stock: 8, branch: "Main Branch", icon: "ring", image: "ring_1.png" },
  { id: "it2", name: "Heritage Gold Necklace", sku: "NK22K-00098", category: "Necklaces", karat: "22K", weight: 18.75, making: 2980, stoneValue: 22000, stock: 5, branch: "Main Branch", icon: "necklace", image: "necklace_1.png" },
  { id: "it3", name: "Gold Hoop Earrings", sku: "ER18K-00231", category: "Earrings", karat: "18K", weight: 6.12, making: 3200, stoneValue: 28000, stock: 2, branch: "Branch 2", icon: "earrings", image: "earrings_1.png" },
  { id: "it4", name: "Royal Diamond Ring", sku: "RG22K-00112", category: "Rings", karat: "22K", weight: 15.3, making: 2600, stoneValue: 45000, stock: 3, branch: "Main Branch", icon: "ring", image: "ring_3.png" },
  { id: "it5", name: "Gold Choker Necklace", sku: "NK22K-00105", category: "Necklaces", karat: "22K", weight: 11.85, making: 1800, stoneValue: 0, stock: 4, branch: "Main Branch", icon: "necklace", image: "necklace_3.png" },
  { id: "it6", name: "Pavé Diamond Band Ring", sku: "RG22K-00177", category: "Rings", karat: "22K", weight: 4.76, making: 900, stoneValue: 12000, stock: 6, branch: "Branch 3", icon: "ring", image: "ring_4.png" },
  { id: "it7", name: "Classic Gold Band Ring", sku: "RG22K-01003", category: "Rings", karat: "22K", weight: 8, making: 800, stoneValue: 0, stock: 7, branch: "Vault", icon: "ring", image: "ring_5.png" },
  { id: "it8", name: "Gold Stone Anklet", sku: "SA925-00211", category: "Others", karat: "925", weight: 12.5, making: 300, stoneValue: 0, stock: 9, branch: "Branch 4", icon: "", image: "anklet_1.png" },
  { id: "it9", name: "Diamond Solitaire Ring", sku: "PR950-00021", category: "Rings", karat: "PT950", weight: 6.2, making: 3500, stoneValue: 12000, stock: 2, branch: "Vault", icon: "ring", image: "ring_2.png" },
  { id: "it10", name: "Bridal Filigree Necklace", sku: "NK22K-00301", category: "Necklaces", karat: "22K", weight: 42.4, making: 8500, stoneValue: 65000, stock: 1, branch: "Main Branch", icon: "necklace", image: "necklace_2.png" },
  { id: "it11", name: "Sapphire Drop Earrings", sku: "ER18K-00232", category: "Earrings", karat: "18K", weight: 4.5, making: 2800, stoneValue: 18000, stock: 4, branch: "Main Branch", icon: "earrings", image: "earrings_2.png" },
  { id: "it12", name: "Royal Gold Bangle", sku: "BG22K-00112", category: "Bangles", karat: "22K", weight: 15.3, making: 2600, stoneValue: 0, stock: 5, branch: "Main Branch", icon: "bangle", image: "bangle_1.png" },
  { id: "it13", name: "Diamond Bangle", sku: "BG22K-00113", category: "Bangles", karat: "22K", weight: 18.2, making: 3200, stoneValue: 22000, stock: 3, branch: "Branch 2", icon: "bangle", image: "bangle_2.png" },
  { id: "it14", name: "Gold Pendant", sku: "PD22K-00177", category: "Pendants", karat: "22K", weight: 4.76, making: 900, stoneValue: 4500, stock: 6, branch: "Branch 3", icon: "pendant", image: "pendant_1.png" },
  { id: "it15", name: "Ruby Pendant", sku: "PD22K-00178", category: "Pendants", karat: "22K", weight: 5.1, making: 1100, stoneValue: 8500, stock: 4, branch: "Main Branch", icon: "pendant", image: "pendant_2.png" },
];

const seedCustomers: Customer[] = [
  { id: "c1", code: "CUST-000245", name: "John Smith", mobile: "+91 98765 43210", whatsapp: "+91 98765 43210", email: "john@example.com", city: "Bengaluru", type: "vip", preferredLanguage: "en", status: "active", vipFlag: true, consentSms: true, consentWhatsapp: true, consentEmail: true },
  { id: "c2", code: "CUST-000246", name: "Priya Mehta", mobile: "+91 90000 12345", email: "priya@example.com", city: "Mumbai", type: "retail", preferredLanguage: "en", status: "active", consentWhatsapp: true },
  { id: "c3", code: "CUST-000247", name: "Raj Gems (B2B)", mobile: "+91 91234 56789", whatsapp: "+91 91234 56789", email: "raj@rajgems.in", city: "Surat", type: "wholesale", preferredLanguage: "en", status: "active", consentEmail: true },
  { id: "c4", code: "CUST-000248", name: "Zara Jewels (B2B)", mobile: "+91 98111 22334", email: "buy@zarajewels.in", city: "Delhi", type: "wholesale", preferredLanguage: "en", status: "active" },
];

const seedInvoices: Invoice[] = [
  { id: "inv1", number: "INV-SA-JED-2026-000015", customer: "John Smith", date: "30 Apr, 2025", lines: [{ name: "Heritage Gold Necklace", qty: 1, amount: 145280 }], subtotal: 145280, gst: 4358, total: 149638, status: "paid" },
  { id: "inv2", number: "INV-SA-JED-2026-000016", customer: "Priya Mehta", date: "01 May, 2025", lines: [{ name: "Textured Gold Band Ring", qty: 1, amount: 38051 }], subtotal: 38051, gst: 1142, total: 39193, status: "paid" },
  { id: "inv3", number: "INV-SA-JED-2026-000017", customer: "Raj Gems (B2B)", date: "05 May, 2025", lines: [{ name: "Royal Gold Bangle", qty: 2, amount: 186400 }], subtotal: 186400, gst: 5592, total: 191992, status: "paid" },
  { id: "inv4", number: "INV-SA-JED-2026-000018", customer: "John Smith", date: "12 May, 2025", lines: [{ name: "Gold Hoop Earrings", qty: 1, amount: 64200 }], subtotal: 64200, gst: 1926, total: 66126, status: "paid" },
  { id: "inv5", number: "INV-SA-JED-2026-000019", customer: "Zara Jewels (B2B)", date: "18 Mar, 2025", lines: [{ name: "Bridal Filigree Necklace", qty: 1, amount: 2100000 }], subtotal: 2100000, gst: 63000, total: 2163000, status: "posted" },
  { id: "inv6", number: "INV-SA-JED-2026-000020", customer: "Raj Gems (B2B)", date: "22 Apr, 2025", lines: [{ name: "Royal Gold Bangle", qty: 4, amount: 372800 }], subtotal: 372800, gst: 11184, total: 383984, status: "partial" },
];

const seedRepairs: Repair[] = [
  { id: "r1", number: "REP-JED-2026-000028", customer: "Priya Mehta", item: "Gold Ring", issue: "Ring resizing", status: "ready", estimate: 1200, approvedAmount: 1200, deposit: 500, balanceDue: 700, promisedDate: "08 May, 2025", priority: "normal", itemReferenceType: "external_item", observedCondition: "Minor scratches on band", date: "02 May, 2025" },
  { id: "r2", number: "REP-JED-2026-000029", customer: "John Smith", item: "Gold Bangle", issue: "Resize bangle", status: "in_progress", estimate: 850, approvedAmount: 850, deposit: 300, balanceDue: 550, promisedDate: "12 May, 2025", priority: "urgent", itemReferenceType: "external_item", metalDetails: "22K gold", date: "03 May, 2025" },
];

const seedSuppliers: Supplier[] = [
  { id: "s1", code: "SUP-000031", name: "Raj Gems", tradeName: "Raj Gems Pvt Ltd", city: "Surat", phone: "+91 90000 11111", paymentTerms: "Net 30", currency: "INR", balance: 875000 },
  { id: "s2", code: "SUP-000032", name: "Kundan Casting Co.", tradeName: "Kundan Casting", city: "Jaipur", phone: "+91 90000 22222", paymentTerms: "Net 15", currency: "INR", balance: 120000 },
];

const seedPOs: PurchaseOrder[] = [
  { id: "po1", number: "PO-JED-2026-003301", supplier: "Raj Gems", items: "Loose Diamonds", amount: 875000, branch: "Main Branch", currency: "INR", status: "closed", date: "29 Apr, 2025" },
];

const seedMovements: Movement[] = [
  { id: "m1", date: "30 Apr, 2025", type: "Sale", item: "Gold Necklace Set", qty: -1, from: "Main Branch", to: "Customer", user: "John Smith" },
  { id: "m2", date: "29 Apr, 2025", type: "Transfer", item: "Diamond Drop Earrings", qty: 2, from: "Main Branch", to: "Branch 2", user: "Admin" },
  { id: "m3", date: "28 Apr, 2025", type: "Adjustment", item: "Royal Gold Bangle", qty: -1, from: "Main Branch", to: "Damaged", user: "Ahmed Khan" },
];

const seedExpenses: Expense[] = [
  { id: "e1", date: "28 Apr, 2025", category: "Rent", note: "Showroom rent - April", amount: 185000 },
  { id: "e2", date: "27 Apr, 2025", category: "Salaries", note: "Staff payroll", amount: 420000 },
  { id: "e3", date: "26 Apr, 2025", category: "Marketing", note: "Akshaya Tritiya campaign", amount: 65000 },
];

const seedBulk: BulkOrder[] = [
  { id: "b1", number: "WO-B2B-0001", customer: "Raj Gems (B2B)", pieces: 45, amount: 3850000, status: "Confirmed", date: "25 Apr, 2025" },
  { id: "b2", number: "WO-B2B-0002", customer: "Zara Jewels (B2B)", pieces: 30, amount: 2450000, status: "Dispatched", date: "22 Apr, 2025" },
];

const seedWork: WorkOrder[] = [
  { id: "w1", number: "WO-MFG-2026-000010", product: "22K Bangle (custom)", karigar: "Suresh Karigar", qtyPlanned: 20, qtyDone: 12, status: "in_progress", due: "10 May, 2025" },
  { id: "w2", number: "WO-MFG-2026-000011", product: "Gold Bangle 22K", karigar: "Ramesh Workshop", qtyPlanned: 50, qtyDone: 50, status: "completed", due: "28 Apr, 2025" },
];

const seedNotifications: Notification[] = [
  { id: "n1", text: "New order #ORD-1258 received", time: "10:30 AM", read: false },
  { id: "n2", text: "Gold price (22K) updated", time: "09:15 AM", read: false },
  { id: "n3", text: "Repair #REP-2026-000028 is ready for pickup", time: "Yesterday", read: false },
];

/* --------------------------- Helpers --------------------------- */

export function itemPrice(item: Item, rates: Rates): number {
  return Math.round(item.weight * (rates[item.karat] ?? 0) + item.making + item.stoneValue);
}

export function itemStatus(stock: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 3) return "Low Stock";
  return "In Stock";
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED",
  SAR: "SAR",
};

let displayCurrency: CurrencyCode = "INR";

export function currencySymbol(currency?: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency ?? displayCurrency] ?? currency ?? "₹";
}

export function formatINR(value: number, currency?: CurrencyCode): string {
  const code = currency ?? displayCurrency;
  const sym = CURRENCY_SYMBOLS[code] ?? code;
  return `${sym} ${Math.round(value).toLocaleString("en-IN")}`;
}

export { CURRENCY_CODES };

function today(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* --------------------------- Context --------------------------- */

type StoreValue = {
  ready: boolean;
  theme: Theme;
  toggleTheme: () => void;
  rates: Rates;
  setRate: (karat: Karat, value: number) => void;
  selectedBranch: string;
  setBranch: (branch: string) => void;
  baseCurrency: CurrencyCode;
  setBaseCurrency: (currency: CurrencyCode) => void;
  currentUser: User | null;
  signup: (u: User) => void;
  login: (u: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  items: Item[];
  addItem: (item: Omit<Item, "id">) => void;
  getItem: (id: string) => Item | undefined;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "code">) => void;
  invoices: Invoice[];
  getInvoice: (id: string) => Invoice | undefined;
  repairs: Repair[];
  addRepair: (repair: Omit<Repair, "id" | "number" | "date" | "status" | "balanceDue">) => void;
  updateRepairStatus: (id: string, status: RepairStatus) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id" | "code" | "balance">) => void;
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "number" | "date" | "status">) => void;
  movements: Movement[];
  transferStock: (itemId: string, to: string, qty: number) => void;
  adjustStock: (itemId: string, delta: number, reason: string) => void;
  cycleCount: (itemId: string, counted: number) => void;
  expenses: Expense[];
  addExpense: (e: Omit<Expense, "id" | "date">) => void;
  bulkOrders: BulkOrder[];
  addBulkOrder: (b: Omit<BulkOrder, "id" | "number" | "date" | "status">) => void;
  workOrders: WorkOrder[];
  addWorkOrder: (w: Omit<WorkOrder, "id" | "number" | "status" | "qtyDone">) => void;
  cart: CartLine[];
  addToCart: (itemId: string) => void;
  addToCartBySku: (sku: string) => boolean;
  setQty: (itemId: string, qty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkout: (customer: string) => Invoice;
  notifications: Notification[];
  markNotificationsRead: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);
const KEY = "gg_state_v4";

function hydrateCustomers(saved: Customer[] | undefined): Customer[] {
  if (!saved?.length) return seedCustomers;
  return saved.map((c) => ({
    ...c,
    type: migrateCustomerType(c.type as string),
    status: c.status ?? "active",
    vipFlag: c.vipFlag ?? c.type === "vip",
    consentSms: c.consentSms ?? false,
    consentWhatsapp: c.consentWhatsapp ?? false,
    consentEmail: c.consentEmail ?? false,
    blacklistFlag: c.blacklistFlag ?? false,
  }));
}

function hydrateInvoices(saved: Invoice[] | undefined): Invoice[] {
  if (!saved?.length) return seedInvoices;
  return saved.map((i) => ({ ...i, status: migrateInvoiceStatus(i.status as string) }));
}

function hydrateRepairs(saved: Repair[] | undefined): Repair[] {
  if (!saved?.length) return seedRepairs;
  return saved.map((r) => ({
    ...r,
    status: migrateRepairStatus(r.status as string),
    priority: migrateRepairPriority(r.priority),
    itemReferenceType: r.itemReferenceType ?? "external_item",
    balanceDue: r.balanceDue ?? Math.max(0, (r.approvedAmount ?? r.estimate) - (r.deposit ?? 0)),
  }));
}

function hydratePurchaseOrders(saved: PurchaseOrder[] | undefined): PurchaseOrder[] {
  if (!saved?.length) return seedPOs;
  return saved.map((p) => ({
    ...p,
    status: migratePoStatus(p.status as string),
    branch: p.branch ?? "Main Branch",
    currency: p.currency ?? "INR",
  }));
}

function hydrateWorkOrders(saved: WorkOrder[] | undefined): WorkOrder[] {
  if (!saved?.length) return seedWork;
  return saved.map((w) => ({ ...w, status: migrateWorkOrderStatus(w.status as string) }));
}

function hydrateItems(saved: Item[] | undefined): Item[] {
  const savedMap = new Map(saved?.map((item) => [item.id, item]));
  return seedItems.map((seed) => {
    const saved = savedMap.get(seed.id);
    return saved
      ? { ...saved, name: seed.name, category: seed.category, icon: seed.icon, image: seed.image, sku: seed.sku }
      : seed;
  });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [rates, setRates] = useState<Rates>(seedRates);
  const [selectedBranch, setSelectedBranch] = useState("Main Branch");
  const [baseCurrency, setBaseCurrencyState] = useState<CurrencyCode>("INR");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>(seedItems);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [repairs, setRepairs] = useState<Repair[]>(seedRepairs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(seedPOs);
  const [movements, setMovements] = useState<Movement[]>(seedMovements);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>(seedBulk);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(seedWork);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem("gg_state_v3");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.theme) setTheme(d.theme);
        if (d.rates) setRates((p) => ({ ...p, ...d.rates }));
        if (d.selectedBranch) setSelectedBranch(d.selectedBranch);
        if (d.baseCurrency && CURRENCY_CODES.includes(d.baseCurrency)) {
          setBaseCurrencyState(d.baseCurrency);
          displayCurrency = d.baseCurrency;
        }
        if (d.currentUser) setCurrentUser(d.currentUser);
        if (d.items) setItems(hydrateItems(d.items as Item[]));
        if (d.customers) setCustomers(hydrateCustomers(d.customers as Customer[]));
        if (d.invoices) setInvoices(hydrateInvoices(d.invoices as Invoice[]));
        if (d.repairs) setRepairs(hydrateRepairs(d.repairs as Repair[]));
        if (d.suppliers) setSuppliers(d.suppliers);
        if (d.purchaseOrders) setPurchaseOrders(hydratePurchaseOrders(d.purchaseOrders as PurchaseOrder[]));
        if (d.movements) setMovements(d.movements);
        if (d.expenses) setExpenses(d.expenses);
        if (d.bulkOrders) setBulkOrders(d.bulkOrders);
        if (d.workOrders) setWorkOrders(hydrateWorkOrders(d.workOrders as WorkOrder[]));
        if (d.notifications) setNotifications(d.notifications);
      }
      const rawCart = localStorage.getItem(KEY + "_cart");
      if (rawCart) setCart(JSON.parse(rawCart));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ theme, rates, selectedBranch, baseCurrency, currentUser, items, customers, invoices, repairs, suppliers, purchaseOrders, movements, expenses, bulkOrders, workOrders, notifications }),
      );
    } catch {
      /* ignore */
    }
  }, [ready, theme, rates, selectedBranch, baseCurrency, currentUser, items, customers, invoices, repairs, suppliers, purchaseOrders, movements, expenses, bulkOrders, workOrders, notifications]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY + "_cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [ready, cart]);

  useEffect(() => {
    displayCurrency = baseCurrency;
  }, [baseCurrency]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) setCurrentUser(userFromSupabase(session.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setCurrentUser(session?.user ? userFromSupabase(session.user) : null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  const setRate = useCallback((karat: Karat, value: number) => setRates((p) => ({ ...p, [karat]: value })), []);
  const setBranch = useCallback((b: string) => setSelectedBranch(b), []);
  const setBaseCurrency = useCallback((currency: CurrencyCode) => setBaseCurrencyState(currency), []);

  const signup = useCallback((u: User) => {
    setCurrentUser({ ...u, role: "admin" });
  }, []);

  const login = useCallback((u: User) => {
    setCurrentUser({ ...u, role: "admin" });
  }, []);

  const logout = useCallback(() => {
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut();
    }
    setCurrentUser(null);
  }, []);
  const updateUser = useCallback((patch: Partial<User>) => setCurrentUser((u) => (u ? { ...u, ...patch } : u)), []);

  const addItem = useCallback((item: Omit<Item, "id">) => setItems((p) => [{ ...item, id: "it" + Date.now() }, ...p]), []);
  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);
  const getInvoice = useCallback((id: string) => invoices.find((i) => i.id === id), [invoices]);

  const addCustomer = useCallback((c: Omit<Customer, "id" | "code" | "status" | "vipFlag" | "consentSms" | "consentWhatsapp" | "consentEmail" | "blacklistFlag"> & {
    consentSms?: boolean;
    consentWhatsapp?: boolean;
    consentEmail?: boolean;
    blacklistFlag?: boolean;
  }) => {
    setCustomers((p) => [{
      ...c,
      id: "c" + Date.now(),
      code: "CUST-" + String(245 + p.length).padStart(6, "0"),
      status: "active",
      vipFlag: c.type === "vip",
      preferredLanguage: c.preferredLanguage ?? "en",
      consentSms: c.consentSms ?? false,
      consentWhatsapp: c.consentWhatsapp ?? false,
      consentEmail: c.consentEmail ?? false,
      blacklistFlag: c.blacklistFlag ?? false,
    }, ...p]);
  }, []);

  const addRepair = useCallback((r: Omit<Repair, "id" | "number" | "date" | "status" | "balanceDue">) => {
    const approved = r.approvedAmount ?? r.estimate;
    const deposit = r.deposit ?? 0;
    setRepairs((p) => [{
      ...r,
      id: "r" + Date.now(),
      number: "REP-JED-2026-" + String(28 + p.length).padStart(6, "0"),
      date: today(),
      status: "received",
      approvedAmount: approved,
      deposit,
      balanceDue: Math.max(0, approved - deposit),
      priority: r.priority ?? "normal",
      itemReferenceType: r.itemReferenceType ?? "external_item",
    }, ...p]);
  }, []);

  const updateRepairStatus = useCallback((id: string, status: RepairStatus) => {
    setRepairs((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const addSupplier = useCallback((s: Omit<Supplier, "id" | "code" | "balance">) => {
    setSuppliers((p) => [{
      ...s,
      id: "s" + Date.now(),
      code: "SUP-" + String(31 + p.length).padStart(6, "0"),
      balance: 0,
      currency: s.currency ?? baseCurrency,
    }, ...p]);
  }, [baseCurrency]);

  const addPurchaseOrder = useCallback((po: Omit<PurchaseOrder, "id" | "number" | "date" | "status">) => {
    setPurchaseOrders((p) => [{
      ...po,
      id: "po" + Date.now(),
      number: "PO-JED-2026-" + String(3302 + p.length),
      date: today(),
      status: "draft",
      branch: po.branch ?? "Main Branch",
      currency: po.currency ?? "INR",
    }, ...p]);
  }, []);

  const logMovement = useCallback((m: Omit<Movement, "id" | "date" | "user">) => {
    setMovements((p) => [{ ...m, id: "m" + Date.now(), date: today(), user: "Admin" }, ...p]);
  }, []);

  const transferStock = useCallback((itemId: string, to: string, qty: number) => {
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, branch: qty >= i.stock ? to : i.branch } : i)));
    const item = items.find((i) => i.id === itemId);
    if (item) logMovement({ type: "Transfer", item: item.name, qty, from: item.branch, to });
  }, [items, logMovement]);

  const adjustStock = useCallback((itemId: string, delta: number, reason: string) => {
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, stock: Math.max(0, i.stock + delta) } : i)));
    const item = items.find((i) => i.id === itemId);
    if (item) logMovement({ type: "Adjustment", item: item.name, qty: delta, from: item.branch, to: reason });
  }, [items, logMovement]);

  const cycleCount = useCallback((itemId: string, counted: number) => {
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, stock: Math.max(0, counted) } : i)));
    const item = items.find((i) => i.id === itemId);
    if (item) logMovement({ type: "Cycle Count", item: item.name, qty: counted - item.stock, from: item.branch, to: "Counted" });
  }, [items, logMovement]);

  const addExpense = useCallback((e: Omit<Expense, "id" | "date">) => {
    setExpenses((p) => [{ ...e, id: "e" + Date.now(), date: today() }, ...p]);
  }, []);

  const addBulkOrder = useCallback((b: Omit<BulkOrder, "id" | "number" | "date" | "status">) => {
    setBulkOrders((p) => [{ ...b, id: "b" + Date.now(), number: "WO-B2B-" + String(p.length + 1).padStart(4, "0"), date: today(), status: "Draft" }, ...p]);
  }, []);

  const addWorkOrder = useCallback((w: Omit<WorkOrder, "id" | "number" | "status" | "qtyDone">) => {
    setWorkOrders((p) => [{ ...w, id: "w" + Date.now(), number: "WO-MFG-2026-" + String(12 + p.length).padStart(6, "0"), status: "planned", qtyDone: 0 }, ...p]);
  }, []);

  const addToCart = useCallback((itemId: string) => {
    setCart((p) => (p.find((l) => l.itemId === itemId) ? p.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)) : [...p, { itemId, qty: 1 }]));
  }, []);

  const addToCartBySku = useCallback((sku: string): boolean => {
    const match = items.find((i) => i.sku.toLowerCase() === sku.trim().toLowerCase());
    if (!match || match.stock <= 0) return false;
    addToCart(match.id);
    return true;
  }, [items, addToCart]);

  const setQty = useCallback((itemId: string, qty: number) => {
    setCart((p) => (qty <= 0 ? p.filter((l) => l.itemId !== itemId) : p.map((l) => (l.itemId === itemId ? { ...l, qty } : l))));
  }, []);

  const removeFromCart = useCallback((itemId: string) => setCart((p) => p.filter((l) => l.itemId !== itemId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback((customer: string): Invoice => {
    const lines: InvoiceLine[] = cart.map((line) => {
      const item = items.find((i) => i.id === line.itemId);
      return { name: item?.name ?? "Item", qty: line.qty, amount: item ? itemPrice(item, rates) * line.qty : 0 };
    });
    const subtotal = lines.reduce((s, l) => s + l.amount, 0);
    const gst = Math.round(subtotal * 0.03);
    const invoice: Invoice = { id: "inv" + Date.now(), number: "INV-SA-JED-2026-" + String(17 + invoices.length).padStart(6, "0"), customer: customer || "Walk-in Customer", date: today(), lines, subtotal, gst, total: subtotal + gst, status: "paid" };
    setInvoices((p) => [invoice, ...p]);
    setItems((p) => p.map((it) => {
      const line = cart.find((l) => l.itemId === it.id);
      return line ? { ...it, stock: Math.max(0, it.stock - line.qty) } : it;
    }));
    cart.forEach((line) => {
      const item = items.find((i) => i.id === line.itemId);
      if (item) logMovement({ type: "Sale", item: item.name, qty: -line.qty, from: item.branch, to: "Customer" });
    });
    setCart([]);
    return invoice;
  }, [cart, items, rates, invoices.length, logMovement]);

  const markNotificationsRead = useCallback(() => setNotifications((p) => p.map((n) => ({ ...n, read: true }))), []);

  const value = useMemo<StoreValue>(() => ({
    ready, theme, toggleTheme, rates, setRate, selectedBranch, setBranch, baseCurrency, setBaseCurrency, currentUser, signup, login, logout, updateUser,
    items, addItem, getItem, customers, addCustomer, invoices, getInvoice, repairs, addRepair, updateRepairStatus, suppliers, addSupplier,
    purchaseOrders, addPurchaseOrder, movements, transferStock, adjustStock, cycleCount,
    expenses, addExpense, bulkOrders, addBulkOrder, workOrders, addWorkOrder,
    cart, addToCart, addToCartBySku, setQty, removeFromCart, clearCart, checkout, notifications, markNotificationsRead,
  }), [ready, theme, toggleTheme, rates, setRate, selectedBranch, setBranch, baseCurrency, setBaseCurrency, currentUser, signup, login, logout, updateUser, items, addItem, getItem, customers, addCustomer, invoices, getInvoice, repairs, addRepair, updateRepairStatus, suppliers, addSupplier, purchaseOrders, addPurchaseOrder, movements, transferStock, adjustStock, cycleCount, expenses, addExpense, bulkOrders, addBulkOrder, workOrders, addWorkOrder, cart, addToCart, addToCartBySku, setQty, removeFromCart, clearCart, checkout, notifications, markNotificationsRead]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function firstName(user: User | null): string {
  if (!user) return "";
  return user.name.split(" ")[0];
}

export function userInitials(user: User | null): string {
  if (!user?.name) return "";
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
