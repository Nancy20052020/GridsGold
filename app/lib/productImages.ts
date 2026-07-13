/** Product photos — drop these files in `public/images/`. */
export const PRODUCT_IMAGE_FILES = {
  rings: ["ring_6.png", "ring_1.png", "ring_2.png", "ring_3.png", "ring_4.png", "ring_5.png"],
  necklaces: ["necklace_1.png", "necklace_2.png", "necklace_3.png"],
  earrings: ["earrings_1.png", "earrings_2.png"],
  bangles: ["bangle_1.png", "bangle_2.png"],
  pendants: ["pendant_1.png", "pendant_2.png"],
  anklet: ["anklet_1.png"],
} as const;

/** Admin dashboard hero — product showcase. */
export const ADMIN_PORTAL_IMAGES = {
  hero: "ring_3.png",
  accent: "necklace_1.png",
} as const;

export function productImageUrl(filename?: string): string | undefined {
  return filename ? `/images/${filename}` : undefined;
}

/** Pick a default catalog image for a new inventory item. Rings prefer ring_6. */
export function defaultProductImage(category: string, icon?: string): string {
  const key = category.toLowerCase();
  if (key.includes("ring") || icon === "ring") return PRODUCT_IMAGE_FILES.rings[0];
  if (key.includes("necklace") || icon === "necklace") return PRODUCT_IMAGE_FILES.necklaces[0];
  if (key.includes("earring") || icon === "earrings") return PRODUCT_IMAGE_FILES.earrings[0];
  if (key.includes("bangle") || icon === "bangle") return PRODUCT_IMAGE_FILES.bangles[0];
  if (key.includes("pendant") || icon === "pendant") return PRODUCT_IMAGE_FILES.pendants[0];
  if (key.includes("anklet") || key.includes("other")) return PRODUCT_IMAGE_FILES.anklet[0];
  return PRODUCT_IMAGE_FILES.rings[0];
}
