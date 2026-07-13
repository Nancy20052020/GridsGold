/** Simulated live precious-metal feed for the Gold Rates hub (frontend-only). */

import type { Karat, Rates } from "./store";

export type LiveCurrency = "INR" | "USD" | "AED" | "SAR" | "GBP" | "SGD" | "CHF" | "TRY" | "CNY" | "HKD" | "EUR";

export type LiveCountry = {
  code: string;
  name: string;
  region: string;
  currency: LiveCurrency;
  symbol: string;
  /** FX vs INR (1 INR = fx of that currency? Wait — use units of currency per 1 USD) */
  usdFx: number;
  /** Local retail premium / discount vs London spot */
  premium: number;
  /** Pin position on stylized map (0–100) */
  x: number;
  y: number;
  /** Globe pin angles */
  lon: number;
  lat: number;
};

export type MetalId = "gold24" | "gold22" | "gold18" | "silver" | "platinum" | "diamond";

export const METALS: { id: MetalId; label: string; unit: string; karat?: Karat; tone: string }[] = [
  { id: "gold24", label: "Gold 24K", unit: "/g", karat: "24K", tone: "gold" },
  { id: "gold22", label: "Gold 22K", unit: "/g", karat: "22K", tone: "champagne" },
  { id: "gold18", label: "Gold 18K", unit: "/g", karat: "18K", tone: "amber" },
  { id: "silver", label: "Silver 925", unit: "/g", karat: "925", tone: "silver" },
  { id: "platinum", label: "Platinum PT950", unit: "/g", karat: "PT950", tone: "platinum" },
  { id: "diamond", label: "Diamond (1ct VS)", unit: "/ct", tone: "lavender" },
];

/** USD spot seeds — gold/silver/platinum per gram, diamond per carat. */
export const USD_SPOT_SEED: Record<MetalId, number> = {
  gold24: 86.4,
  gold22: 79.2,
  gold18: 64.8,
  silver: 0.98,
  platinum: 34.5,
  diamond: 5200,
};

export const LIVE_COUNTRIES: LiveCountry[] = [
  { code: "IN", name: "India", region: "Asia", currency: "INR", symbol: "₹", usdFx: 83.5, premium: 1.018, x: 68, y: 48, lon: 78, lat: 22 },
  { code: "US", name: "United States", region: "Americas", currency: "USD", symbol: "$", usdFx: 1, premium: 1.0, x: 18, y: 38, lon: -95, lat: 38 },
  { code: "AE", name: "UAE", region: "Middle East", currency: "AED", symbol: "AED", usdFx: 3.67, premium: 0.995, x: 60, y: 46, lon: 54, lat: 24 },
  { code: "SA", name: "Saudi Arabia", region: "Middle East", currency: "SAR", symbol: "SAR", usdFx: 3.75, premium: 1.002, x: 56, y: 48, lon: 45, lat: 24 },
  { code: "GB", name: "United Kingdom", region: "Europe", currency: "GBP", symbol: "£", usdFx: 0.79, premium: 1.01, x: 46, y: 28, lon: -2, lat: 54 },
  { code: "CH", name: "Switzerland", region: "Europe", currency: "CHF", symbol: "CHF", usdFx: 0.88, premium: 0.992, x: 49, y: 32, lon: 8, lat: 47 },
  { code: "SG", name: "Singapore", region: "Asia", currency: "SGD", symbol: "S$", usdFx: 1.34, premium: 1.005, x: 74, y: 58, lon: 104, lat: 1 },
  { code: "HK", name: "Hong Kong", region: "Asia", currency: "HKD", symbol: "HK$", usdFx: 7.82, premium: 1.004, x: 78, y: 44, lon: 114, lat: 22 },
  { code: "CN", name: "China", region: "Asia", currency: "CNY", symbol: "¥", usdFx: 7.24, premium: 1.012, x: 76, y: 38, lon: 105, lat: 35 },
  { code: "TR", name: "Turkey", region: "Europe", currency: "TRY", symbol: "₺", usdFx: 32.4, premium: 1.03, x: 54, y: 36, lon: 35, lat: 39 },
  { code: "DE", name: "Germany", region: "Europe", currency: "EUR", symbol: "€", usdFx: 0.92, premium: 1.008, x: 50, y: 30, lon: 10, lat: 51 },
  { code: "AU", name: "Australia", region: "Oceania", currency: "USD", symbol: "A$", usdFx: 1.52, premium: 1.015, x: 84, y: 72, lon: 134, lat: -25 },
];

export const MARKET_NEWS = [
  { id: "n1", title: "LBMA gold holds firm as dollar softens", source: "Reuters", when: "12m ago", tag: "Gold" },
  { id: "n2", title: "India wedding season lifts 22K retail premia", source: "Business Line", when: "34m ago", tag: "India" },
  { id: "n3", title: "Dubai bullion trade volumes up 6% WoW", source: "DMCC", when: "1h ago", tag: "UAE" },
  { id: "n4", title: "Platinum finds support near multi-week highs", source: "Kitco", when: "2h ago", tag: "Platinum" },
  { id: "n5", title: "Diamond polished index steady; VS1 appetite firm", source: "Rapaport", when: "3h ago", tag: "Diamond" },
  { id: "n6", title: "Fed speakers keep metals in consolidation band", source: "Bloomberg", when: "4h ago", tag: "Macro" },
];

export const AI_INSIGHTS = [
  { title: "22K near-term", body: "Model sees mild upside bias over 5 sessions if USD slips under 83.2 INR." },
  { title: "Silver volatility", body: "925 may whip ±1.8% — hedge retail marking with lunch refresh windows." },
  { title: "Platinum vs gold", body: "Ratio still below 0.45 — bridal platinum promotions retain margin room." },
  { title: "Wedding week", body: "IN/AE favorites likely to outpace CH/US retail until Sunday close." },
];

/** Slight random walk around USD spot seeds. */
export function tickUsdSpots(prev: Record<MetalId, number>): Record<MetalId, number> {
  const next = { ...prev };
  for (const id of Object.keys(next) as MetalId[]) {
    const wobble = 1 + (Math.random() - 0.48) * 0.004;
    next[id] = Math.round(prev[id] * wobble * 10000) / 10000;
  }
  return next;
}

export function priceInCurrency(usdSpot: number, country: LiveCountry): number {
  return Math.round(usdSpot * country.usdFx * country.premium * 100) / 100;
}

export function formatLive(value: number, country: LiveCountry): string {
  return `${country.symbol} ${value.toLocaleString("en-IN", { maximumFractionDigits: value < 20 ? 2 : 0 })}`;
}

export function historySeries(seed: number, points = 24): number[] {
  const out: number[] = [];
  let v = seed * 0.96;
  for (let i = 0; i < points; i++) {
    v *= 1 + (Math.sin(i / 3) * 0.004) + (i / points) * 0.012 + (Math.random() - 0.5) * 0.003;
    out.push(Math.round(v * 100) / 100);
  }
  out[out.length - 1] = seed;
  return out;
}

/** Map live feed into ERP karat rates (INR/g) for inventory/POS sync. */
export function liveFeedToRates(usd: Record<MetalId, number>, country: LiveCountry = LIVE_COUNTRIES[0]): Rates {
  const p = (id: MetalId) => priceInCurrency(usd[id], country);
  return {
    "24K": Math.round(p("gold24")),
    "22K": Math.round(p("gold22")),
    "18K": Math.round(p("gold18")),
    "925": Math.round(p("silver") * 100) / 100,
    PT950: Math.round(p("platinum")),
  };
}

export function countryByCode(code: string): LiveCountry {
  return LIVE_COUNTRIES.find((c) => c.code === code) ?? LIVE_COUNTRIES[0];
}
