"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  email: string;
  city: string;
  type: "Retail" | "Wholesale" | "VIP";
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
  status: "Paid" | "Draft";
};

export type Repair = {
  id: string;
  number: string;
  customer: string;
  item: string;
  issue: string;
  status: "Received" | "In Progress" | "Ready" | "Delivered";
  estimate: number;
  date: string;
};

export type Supplier = { id: string; code: string; name: string; city: string; phone: string; balance: number };

export type PurchaseOrder = {
  id: string;
  number: string;
  supplier: string;
  items: string;
  amount: number;
  status: "Draft" | "Sent" | "Received";
  date: string;
};

export type CustomerOrder = {
  id: string;
  itemId: string;
  name: string;
  amount: number;
  status: "Reserved" | "Confirmed" | "Out for delivery" | "Delivered";
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

export type WorkOrder = { id: string; number: string; product: string; karigar: string; qtyPlanned: number; qtyDone: number; status: "Planned" | "In Progress" | "Completed"; due: string };

export type CartLine = { itemId: string; qty: number };
export type Rates = Record<Karat, number>;
export type Role = "admin" | "customer";
export type User = { name: string; email: string; role: Role; mobile?: string; city?: string };
export type Notification = { id: string; text: string; time: string; read: boolean };
export type Theme = "light" | "dark";

export const BRANCHES = ["Main Branch", "Branch 2", "Branch 3", "Branch 4", "Vault"];

/* --------------------------- Seed data --------------------------- */

const seedRates: Rates = { "24K": 7900, "22K": 7245, "18K": 5920, "925": 85, PT950: 3150 };

const seedItems: Item[] = [
  { id: "it1", name: "22K Gold Ring", sku: "RG22K-00124", category: "Rings", karat: "22K", weight: 5.25, making: 1200, stoneValue: 0, stock: 8, branch: "Main Branch", icon: "ring", image: "ring_1.png" },
  { id: "it2", name: "Heritage Gold Necklace Set", sku: "NK22K-00098", category: "Necklaces", karat: "22K", weight: 18.75, making: 2980, stoneValue: 22000, stock: 5, branch: "Main Branch", icon: "necklace", image: "necklace_1.png" },
  { id: "it3", name: "Diamond Drop Earrings", sku: "ER18K-00231", category: "Earrings", karat: "18K", weight: 6.12, making: 3200, stoneValue: 28000, stock: 2, branch: "Branch 2", icon: "earrings", image: "earring_1.png" },
  { id: "it4", name: "Royal Gold Bangle", sku: "BG22K-00112", category: "Bangles", karat: "22K", weight: 15.3, making: 2600, stoneValue: 0, stock: 3, branch: "Main Branch", icon: "bangle", image: "ring_3.png" },
  { id: "it5", name: "Gold Chain", sku: "CH22K-00105", category: "Chains", karat: "22K", weight: 11.85, making: 1800, stoneValue: 0, stock: 0, branch: "Main Branch", icon: "chain", image: "necklace_1.png" },
  { id: "it6", name: "Gold Pendant", sku: "PD22K-00177", category: "Pendants", karat: "22K", weight: 4.76, making: 900, stoneValue: 4500, stock: 6, branch: "Branch 3", icon: "pendant", image: "ring_5.png" },
  { id: "it7", name: "Gold Bar 10g", sku: "GB24K-01003", category: "Gold Bars", karat: "24K", weight: 10, making: 500, stoneValue: 0, stock: 12, branch: "Vault", icon: "" },
  { id: "it8", name: "Silver Anklet", sku: "SA925-00211", category: "Others", karat: "925", weight: 12.5, making: 300, stoneValue: 0, stock: 9, branch: "Branch 4", icon: "", image: "anklet_1.png" },
  { id: "it9", name: "Platinum Ring", sku: "PR950-00021", category: "Rings", karat: "PT950", weight: 6.2, making: 3500, stoneValue: 12000, stock: 2, branch: "Vault", icon: "ring", image: "ring_2.png" },
  { id: "it10", name: "Bridal Choker", sku: "NK22K-00301", category: "Necklaces", karat: "22K", weight: 42.4, making: 8500, stoneValue: 65000, stock: 1, branch: "Main Branch", icon: "necklace", image: "necklace_2.png" },
];

const seedCustomers: Customer[] = [
  { id: "c1", code: "CUST-0001", name: "John Smith", mobile: "+91 98765 43210", email: "john@example.com", city: "Bengaluru", type: "VIP" },
  { id: "c2", code: "CUST-0002", name: "Priya Mehta", mobile: "+91 90000 12345", email: "priya@example.com", city: "Mumbai", type: "Retail" },
  { id: "c3", code: "CUST-0003", name: "Raj Gems (B2B)", mobile: "+91 91234 56789", email: "raj@rajgems.in", city: "Surat", type: "Wholesale" },
  { id: "c4", code: "CUST-0004", name: "Zara Jewels (B2B)", mobile: "+91 98111 22334", email: "buy@zarajewels.in", city: "Delhi", type: "Wholesale" },
];

const seedInvoices: Invoice[] = [
  { id: "inv1", number: "INV-SA-2026-000015", customer: "John Smith", date: "30 Apr, 2025", lines: [{ name: "Gold Necklace Set", qty: 1, amount: 145280 }], subtotal: 145280, gst: 4358, total: 149638, status: "Paid" },
  { id: "inv2", number: "INV-SA-2026-000016", customer: "Priya Mehta", date: "01 May, 2025", lines: [{ name: "22K Gold Ring", qty: 1, amount: 38051 }], subtotal: 38051, gst: 1142, total: 39193, status: "Paid" },
];

const seedRepairs: Repair[] = [
  { id: "r1", number: "REP-2026-000028", customer: "Priya Mehta", item: "Gold Ring", issue: "Ring resizing", status: "Ready", estimate: 1200, date: "02 May, 2025" },
  { id: "r2", number: "REP-2026-000029", customer: "John Smith", item: "Gold Chain", issue: "Broken clasp repair", status: "In Progress", estimate: 850, date: "03 May, 2025" },
];

const seedSuppliers: Supplier[] = [
  { id: "s1", code: "SUP-0001", name: "Raj Gems", city: "Surat", phone: "+91 90000 11111", balance: 875000 },
  { id: "s2", code: "SUP-0002", name: "Kundan Casting Co.", city: "Jaipur", phone: "+91 90000 22222", balance: 120000 },
];

const seedPOs: PurchaseOrder[] = [
  { id: "po1", number: "PO-3301", supplier: "Raj Gems", items: "Loose Diamonds", amount: 875000, status: "Received", date: "29 Apr, 2025" },
];

const seedOrders: CustomerOrder[] = [
  { id: "o1", itemId: "it2", name: "Gold Necklace Set", amount: 149638, status: "Out for delivery", date: "30 Apr, 2025" },
  { id: "o2", itemId: "it1", name: "22K Gold Ring", amount: 39193, status: "Delivered", date: "12 Apr, 2025" },
];

const seedMovements: Movement[] = [
  { id: "m1", date: "30 Apr, 2025", type: "Sale", item: "Gold Necklace Set", qty: -1, from: "Main Branch", to: "Customer", user: "John Smith" },
  { id: "m2", date: "29 Apr, 2025", type: "Transfer", item: "Diamond Drop Earrings", qty: 2, from: "Main Branch", to: "Branch 2", user: "Admin" },
  { id: "m3", date: "28 Apr, 2025", type: "Adjustment", item: "Gold Chain", qty: -1, from: "Main Branch", to: "Damaged", user: "Ahmed Khan" },
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
  { id: "w1", number: "WO-MFG-000010", product: "22K Bangle (custom)", karigar: "Suresh Karigar", qtyPlanned: 20, qtyDone: 12, status: "In Progress", due: "10 May, 2025" },
  { id: "w2", number: "WO-MFG-000011", product: "Gold Chain 22K", karigar: "Ramesh Workshop", qtyPlanned: 50, qtyDone: 50, status: "Completed", due: "28 Apr, 2025" },
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

export function formatINR(value: number): string {
  return "₹ " + Math.round(value).toLocaleString("en-IN");
}

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
  currentUser: User | null;
  signup: (u: { name: string; email: string; mobile?: string; city?: string; role: Role }) => void;
  login: (email: string, role: Role) => void;
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
  addRepair: (repair: Omit<Repair, "id" | "number" | "date" | "status">) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id" | "code" | "balance">) => void;
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "number" | "date" | "status">) => void;
  orders: CustomerOrder[];
  reserve: (itemId: string) => void;
  unreserve: (orderId: string) => void;
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
  wishlist: string[];
  toggleWishlist: (itemId: string) => void;
  notifications: Notification[];
  markNotificationsRead: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);
const KEY = "gg_state_v3";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [rates, setRates] = useState<Rates>(seedRates);
  const [selectedBranch, setSelectedBranch] = useState("Main Branch");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>(seedItems);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [repairs, setRepairs] = useState<Repair[]>(seedRepairs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(seedPOs);
  const [orders, setOrders] = useState<CustomerOrder[]>(seedOrders);
  const [movements, setMovements] = useState<Movement[]>(seedMovements);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>(seedBulk);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(seedWork);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.theme) setTheme(d.theme);
        if (d.rates) setRates((p) => ({ ...p, ...d.rates }));
        if (d.selectedBranch) setSelectedBranch(d.selectedBranch);
        if (d.currentUser) setCurrentUser(d.currentUser);
        if (d.items) {
          setItems(
            (d.items as Item[]).map((item) => {
              const seed = seedItems.find((s) => s.id === item.id);
              return seed ? { ...item, image: seed.image, icon: seed.icon } : item;
            }),
          );
        }
        if (d.customers) setCustomers(d.customers);
        if (d.invoices) setInvoices(d.invoices);
        if (d.repairs) setRepairs(d.repairs);
        if (d.suppliers) setSuppliers(d.suppliers);
        if (d.purchaseOrders) setPurchaseOrders(d.purchaseOrders);
        if (d.orders) setOrders(d.orders);
        if (d.movements) setMovements(d.movements);
        if (d.expenses) setExpenses(d.expenses);
        if (d.bulkOrders) setBulkOrders(d.bulkOrders);
        if (d.workOrders) setWorkOrders(d.workOrders);
        if (d.wishlist) setWishlist(d.wishlist);
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
        JSON.stringify({ theme, rates, selectedBranch, currentUser, items, customers, invoices, repairs, suppliers, purchaseOrders, orders, movements, expenses, bulkOrders, workOrders, wishlist, notifications }),
      );
    } catch {
      /* ignore */
    }
  }, [ready, theme, rates, selectedBranch, currentUser, items, customers, invoices, repairs, suppliers, purchaseOrders, orders, movements, expenses, bulkOrders, workOrders, wishlist, notifications]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY + "_cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [ready, cart]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  const setRate = useCallback((karat: Karat, value: number) => setRates((p) => ({ ...p, [karat]: value })), []);
  const setBranch = useCallback((b: string) => setSelectedBranch(b), []);

  const signup = useCallback((u: { name: string; email: string; mobile?: string; city?: string; role: Role }) => {
    setCurrentUser({ name: u.name, email: u.email, role: u.role, mobile: u.mobile, city: u.city });
    if (u.role === "customer") {
      setCustomers((prev) =>
        prev.some((c) => c.email.toLowerCase() === u.email.toLowerCase())
          ? prev
          : [{ id: "c" + Date.now(), code: "CUST-" + String(prev.length + 1).padStart(4, "0"), name: u.name, mobile: u.mobile ?? "", email: u.email, city: u.city ?? "", type: "Retail" }, ...prev],
      );
    }
  }, []);

  const login = useCallback((email: string, role: Role) => {
    setCurrentUser(() => {
      const known = seedCustomers.find((c) => c.email.toLowerCase() === email.toLowerCase());
      const name = known?.name ?? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
      return { name: role === "admin" ? name || "Store Admin" : name || "Guest", email, role };
    });
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);
  const updateUser = useCallback((patch: Partial<User>) => setCurrentUser((u) => (u ? { ...u, ...patch } : u)), []);

  const addItem = useCallback((item: Omit<Item, "id">) => setItems((p) => [{ ...item, id: "it" + Date.now() }, ...p]), []);
  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);
  const getInvoice = useCallback((id: string) => invoices.find((i) => i.id === id), [invoices]);

  const addCustomer = useCallback((c: Omit<Customer, "id" | "code">) => {
    setCustomers((p) => [{ ...c, id: "c" + Date.now(), code: "CUST-" + String(p.length + 1).padStart(4, "0") }, ...p]);
  }, []);

  const addRepair = useCallback((r: Omit<Repair, "id" | "number" | "date" | "status">) => {
    setRepairs((p) => [{ ...r, id: "r" + Date.now(), number: "REP-2026-" + String(30 + p.length).padStart(6, "0"), date: today(), status: "Received" }, ...p]);
  }, []);

  const addSupplier = useCallback((s: Omit<Supplier, "id" | "code" | "balance">) => {
    setSuppliers((p) => [{ ...s, id: "s" + Date.now(), code: "SUP-" + String(p.length + 1).padStart(4, "0"), balance: 0 }, ...p]);
  }, []);

  const addPurchaseOrder = useCallback((po: Omit<PurchaseOrder, "id" | "number" | "date" | "status">) => {
    setPurchaseOrders((p) => [{ ...po, id: "po" + Date.now(), number: "PO-" + (3302 + p.length), date: today(), status: "Draft" }, ...p]);
  }, []);

  const reserve = useCallback((itemId: string) => {
    setItems((cur) => {
      const item = cur.find((i) => i.id === itemId);
      if (item) {
        setOrders((p) => [{ id: "o" + Date.now(), itemId, name: item.name, amount: itemPrice(item, rates), status: "Reserved", date: today() }, ...p]);
      }
      return cur;
    });
  }, [rates]);

  const unreserve = useCallback((orderId: string) => setOrders((p) => p.filter((o) => o.id !== orderId)), []);

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
    setWorkOrders((p) => [{ ...w, id: "w" + Date.now(), number: "WO-MFG-" + String(12 + p.length).padStart(6, "0"), status: "Planned", qtyDone: 0 }, ...p]);
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
    const invoice: Invoice = { id: "inv" + Date.now(), number: "INV-SA-2026-" + String(17 + invoices.length).padStart(6, "0"), customer: customer || "Walk-in Customer", date: today(), lines, subtotal, gst, total: subtotal + gst, status: "Paid" };
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

  const toggleWishlist = useCallback((itemId: string) => {
    setWishlist((p) => (p.includes(itemId) ? p.filter((i) => i !== itemId) : [...p, itemId]));
  }, []);

  const markNotificationsRead = useCallback(() => setNotifications((p) => p.map((n) => ({ ...n, read: true }))), []);

  const value = useMemo<StoreValue>(() => ({
    ready, theme, toggleTheme, rates, setRate, selectedBranch, setBranch, currentUser, signup, login, logout, updateUser,
    items, addItem, getItem, customers, addCustomer, invoices, getInvoice, repairs, addRepair, suppliers, addSupplier,
    purchaseOrders, addPurchaseOrder, orders, reserve, unreserve, movements, transferStock, adjustStock, cycleCount,
    expenses, addExpense, bulkOrders, addBulkOrder, workOrders, addWorkOrder,
    cart, addToCart, addToCartBySku, setQty, removeFromCart, clearCart, checkout, wishlist, toggleWishlist, notifications, markNotificationsRead,
  }), [ready, theme, toggleTheme, rates, setRate, selectedBranch, setBranch, currentUser, signup, login, logout, updateUser, items, addItem, getItem, customers, addCustomer, invoices, getInvoice, repairs, addRepair, suppliers, addSupplier, purchaseOrders, addPurchaseOrder, orders, reserve, unreserve, movements, transferStock, adjustStock, cycleCount, expenses, addExpense, bulkOrders, addBulkOrder, workOrders, addWorkOrder, cart, addToCart, addToCartBySku, setQty, removeFromCart, clearCart, checkout, wishlist, toggleWishlist, notifications, markNotificationsRead]);

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
