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
  weight: number; // grams
  making: number; // making charge (flat, INR)
  stoneValue: number; // INR
  stock: number; // pieces
  branch: string;
  icon: string; // jewel-icon variant
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

export type Supplier = {
  id: string;
  code: string;
  name: string;
  city: string;
  phone: string;
  balance: number;
};

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

export type CartLine = { itemId: string; qty: number };

export type Rates = Record<Karat, number>;

/* --------------------------- Seed data --------------------------- */

const seedRates: Rates = {
  "24K": 7900,
  "22K": 7245,
  "18K": 5920,
  "925": 85,
  PT950: 3150,
};

const seedItems: Item[] = [
  { id: "it1", name: "22K Gold Ring", sku: "RG22K-00124", category: "Rings", karat: "22K", weight: 5.25, making: 1200, stoneValue: 0, stock: 8, branch: "Main Branch", icon: "ring" },
  { id: "it2", name: "Heritage Gold Necklace Set", sku: "NK22K-00098", category: "Necklaces", karat: "22K", weight: 18.75, making: 2980, stoneValue: 22000, stock: 5, branch: "Main Branch", icon: "necklace" },
  { id: "it3", name: "Diamond Drop Earrings", sku: "ER18K-00231", category: "Earrings", karat: "18K", weight: 6.12, making: 3200, stoneValue: 28000, stock: 2, branch: "Branch 2", icon: "earrings" },
  { id: "it4", name: "Royal Gold Bangle", sku: "BG22K-00112", category: "Bangles", karat: "22K", weight: 15.3, making: 2600, stoneValue: 0, stock: 3, branch: "Main Branch", icon: "bangle" },
  { id: "it5", name: "Gold Chain", sku: "CH22K-00105", category: "Chains", karat: "22K", weight: 11.85, making: 1800, stoneValue: 0, stock: 0, branch: "Main Branch", icon: "chain" },
  { id: "it6", name: "Gold Pendant", sku: "PD22K-00177", category: "Pendants", karat: "22K", weight: 4.76, making: 900, stoneValue: 4500, stock: 6, branch: "Branch 3", icon: "pendant" },
  { id: "it7", name: "Gold Bar 10g", sku: "GB24K-01003", category: "Gold Bars", karat: "24K", weight: 10, making: 500, stoneValue: 0, stock: 12, branch: "Vault", icon: "" },
  { id: "it8", name: "Silver Anklet", sku: "SA925-00211", category: "Others", karat: "925", weight: 12.5, making: 300, stoneValue: 0, stock: 9, branch: "Branch 4", icon: "" },
  { id: "it9", name: "Platinum Ring", sku: "PR950-00021", category: "Rings", karat: "PT950", weight: 6.2, making: 3500, stoneValue: 12000, stock: 2, branch: "Vault", icon: "ring" },
  { id: "it10", name: "Bridal Choker", sku: "NK22K-00301", category: "Necklaces", karat: "22K", weight: 42.4, making: 8500, stoneValue: 65000, stock: 1, branch: "Main Branch", icon: "necklace" },
];

const seedCustomers: Customer[] = [
  { id: "c1", code: "CUST-0001", name: "John Smith", mobile: "+91 98765 43210", email: "john@example.com", city: "Bengaluru", type: "VIP" },
  { id: "c2", code: "CUST-0002", name: "Priya Mehta", mobile: "+91 90000 12345", email: "priya@example.com", city: "Mumbai", type: "Retail" },
  { id: "c3", code: "CUST-0003", name: "Raj Gems (B2B)", mobile: "+91 91234 56789", email: "raj@rajgems.in", city: "Surat", type: "Wholesale" },
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

/* --------------------------- Helpers --------------------------- */

export function itemPrice(item: Item, rates: Rates): number {
  const rate = rates[item.karat] ?? 0;
  return Math.round(item.weight * rate + item.making + item.stoneValue);
}

export function itemStatus(stock: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 3) return "Low Stock";
  return "In Stock";
}

export function formatINR(value: number): string {
  return "₹ " + Math.round(value).toLocaleString("en-IN");
}

/* --------------------------- Context --------------------------- */

type StoreValue = {
  ready: boolean;
  rates: Rates;
  setRate: (karat: Karat, value: number) => void;
  items: Item[];
  addItem: (item: Omit<Item, "id">) => void;
  getItem: (id: string) => Item | undefined;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "code">) => void;
  invoices: Invoice[];
  repairs: Repair[];
  addRepair: (repair: Omit<Repair, "id" | "number" | "date" | "status">) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, "id" | "code" | "balance">) => void;
  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "number" | "date" | "status">) => void;
  orders: CustomerOrder[];
  cart: CartLine[];
  addToCart: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkout: (customer: string) => Invoice;
  wishlist: string[];
  toggleWishlist: (itemId: string) => void;
  reserve: (itemId: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const KEY = "gg_state_v2";

type Persisted = {
  rates: Rates;
  items: Item[];
  customers: Customer[];
  invoices: Invoice[];
  repairs: Repair[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  orders: CustomerOrder[];
  wishlist: string[];
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [rates, setRates] = useState<Rates>(seedRates);
  const [items, setItems] = useState<Item[]>(seedItems);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [repairs, setRepairs] = useState<Repair[]>(seedRepairs);
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(seedPOs);
  const [orders, setOrders] = useState<CustomerOrder[]>(seedOrders);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR hydration mismatch).
  // Setting state synchronously here is intentional for this one-time
  // client-only hydration, so the corresponding rule is disabled locally.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<Persisted>;
        if (data.rates) setRates((prev) => ({ ...prev, ...data.rates }));
        if (data.items) setItems(data.items);
        if (data.customers) setCustomers(data.customers);
        if (data.invoices) setInvoices(data.invoices);
        if (data.repairs) setRepairs(data.repairs);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
        if (data.orders) setOrders(data.orders);
        if (data.wishlist) setWishlist(data.wishlist);
      }
      const rawCart = localStorage.getItem(KEY + "_cart");
      if (rawCart) setCart(JSON.parse(rawCart) as CartLine[]);
    } catch {
      /* ignore corrupt state */
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = {
      rates,
      items,
      customers,
      invoices,
      repairs,
      suppliers,
      purchaseOrders,
      orders,
      wishlist,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* ignore quota errors */
    }
  }, [ready, rates, items, customers, invoices, repairs, suppliers, purchaseOrders, orders, wishlist]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY + "_cart", JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [ready, cart]);

  const setRate = useCallback((karat: Karat, value: number) => {
    setRates((prev) => ({ ...prev, [karat]: value }));
  }, []);

  const addItem = useCallback((item: Omit<Item, "id">) => {
    setItems((prev) => [{ ...item, id: "it" + Date.now() }, ...prev]);
  }, []);

  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const addCustomer = useCallback((customer: Omit<Customer, "id" | "code">) => {
    setCustomers((prev) => [
      { ...customer, id: "c" + Date.now(), code: "CUST-" + String(prev.length + 1).padStart(4, "0") },
      ...prev,
    ]);
  }, []);

  const addRepair = useCallback((repair: Omit<Repair, "id" | "number" | "date" | "status">) => {
    setRepairs((prev) => [
      {
        ...repair,
        id: "r" + Date.now(),
        number: "REP-2026-" + String(30 + prev.length).padStart(6, "0"),
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Received",
      },
      ...prev,
    ]);
  }, []);

  const addSupplier = useCallback((supplier: Omit<Supplier, "id" | "code" | "balance">) => {
    setSuppliers((prev) => [
      { ...supplier, id: "s" + Date.now(), code: "SUP-" + String(prev.length + 1).padStart(4, "0"), balance: 0 },
      ...prev,
    ]);
  }, []);

  const addPurchaseOrder = useCallback((po: Omit<PurchaseOrder, "id" | "number" | "date" | "status">) => {
    setPurchaseOrders((prev) => [
      {
        ...po,
        id: "po" + Date.now(),
        number: "PO-" + (3302 + prev.length),
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Draft",
      },
      ...prev,
    ]);
  }, []);

  const addToCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const found = prev.find((l) => l.itemId === itemId);
      if (found) return prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((itemId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => l.itemId !== itemId)
        : prev.map((l) => (l.itemId === itemId ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback(
    (customer: string): Invoice => {
      const lines: InvoiceLine[] = cart.map((line) => {
        const item = items.find((i) => i.id === line.itemId);
        const amount = item ? itemPrice(item, rates) * line.qty : 0;
        return { name: item?.name ?? "Item", qty: line.qty, amount };
      });
      const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
      const gst = Math.round(subtotal * 0.03);
      const invoice: Invoice = {
        id: "inv" + Date.now(),
        number: "INV-SA-2026-" + String(17 + invoices.length).padStart(6, "0"),
        customer: customer || "Walk-in Customer",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        lines,
        subtotal,
        gst,
        total: subtotal + gst,
        status: "Paid",
      };
      setInvoices((prev) => [invoice, ...prev]);
      // reduce stock
      setItems((prev) =>
        prev.map((it) => {
          const line = cart.find((l) => l.itemId === it.id);
          return line ? { ...it, stock: Math.max(0, it.stock - line.qty) } : it;
        }),
      );
      setCart([]);
      return invoice;
    },
    [cart, items, rates, invoices.length],
  );

  const toggleWishlist = useCallback((itemId: string) => {
    setWishlist((prev) => (prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId]));
  }, []);

  const reserve = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      setOrders((prev) => [
        {
          id: "o" + Date.now(),
          itemId,
          name: item.name,
          amount: itemPrice(item, rates),
          status: "Reserved",
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        },
        ...prev,
      ]);
    },
    [items, rates],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      rates,
      setRate,
      items,
      addItem,
      getItem,
      customers,
      addCustomer,
      invoices,
      repairs,
      addRepair,
      suppliers,
      addSupplier,
      purchaseOrders,
      addPurchaseOrder,
      orders,
      cart,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      checkout,
      wishlist,
      toggleWishlist,
      reserve,
    }),
    [ready, rates, setRate, items, addItem, getItem, customers, addCustomer, invoices, repairs, addRepair, suppliers, addSupplier, purchaseOrders, addPurchaseOrder, orders, cart, addToCart, setQty, removeFromCart, clearCart, checkout, wishlist, toggleWishlist, reserve],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
