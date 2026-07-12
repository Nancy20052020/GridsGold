/** Customer portal catalog categories (no Chains). */
export const PORTAL_CATEGORIES = ["Rings", "Necklaces", "Bangles", "Earrings", "Pendants", "Others"] as const;

/** Admin / POS category filters (no Chains). */
export const SHOP_CATEGORIES = ["All", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants"] as const;

export const INVENTORY_CATEGORIES = [
  "Rings",
  "Necklaces",
  "Bangles",
  "Earrings",
  "Pendants",
  "Gold Bars",
  "Coins",
  "Others",
] as const;

export const INVENTORY_TABS = ["All Items", ...INVENTORY_CATEGORIES.filter((c) => c !== "Others"), "Others"] as const;

export const PRODUCT_ICONS = ["ring", "necklace", "bangle", "earrings", "pendant"] as const;

export type PortalCategory = (typeof PORTAL_CATEGORIES)[number];

/** Legacy category removed from the site — remap or drop on load. */
export const REMOVED_CATEGORIES = ["Chains", "Chain"] as const;

export function isRemovedCategory(category: string): boolean {
  return REMOVED_CATEGORIES.some((c) => c.toLowerCase() === category.toLowerCase());
}

export function portalCatalogCategories(): PortalCategory[] {
  return [...PORTAL_CATEGORIES];
}
