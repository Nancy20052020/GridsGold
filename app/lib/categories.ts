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

/** Admin inventory filter tabs — core categories only */
export const INVENTORY_TABS = ["All Items", "Rings", "Necklaces", "Bangles", "Earrings", "Pendants"] as const;

export const PRODUCT_ICONS = ["ring", "necklace", "bangle", "earrings", "pendant"] as const;

/** Legacy category removed from the site — remap or drop on load. */
export const REMOVED_CATEGORIES = ["Chains", "Chain"] as const;

export function isRemovedCategory(category: string): boolean {
  return REMOVED_CATEGORIES.some((c) => c.toLowerCase() === category.toLowerCase());
}
