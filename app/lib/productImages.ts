/** Product photos — drop these files in `public/images/`. */
export const PRODUCT_IMAGE_FILES = {
  rings: ["ring_1.png", "ring_2.png", "ring_3.png", "ring_4.png", "ring_5.png"],
  necklaces: ["necklace_1.png", "necklace_2.png", "necklace_3.png"],
  earrings: ["earrings_1.png", "earrings_2.png"],
  bangles: ["bangle_1.png", "bangle_2.png"],
  pendants: ["pendant_1.png", "pendant_2.png"],
  anklet: ["anklet_1.png"],
} as const;

/** Category tile images on the customer portal home page. */
export const CATEGORY_IMAGES: Record<string, string> = {
  Rings: "ring_1.png",
  Necklaces: "necklace_1.png",
  Bangles: "bangle_1.png",
  Earrings: "earrings_1.png",
  Pendants: "pendant_1.png",
};

/** Hero banner on `/portal`. */
export const HERO_IMAGE = "necklace_2.png";

/** Customer portal marketing visuals (Grids Gold). */
export const CUSTOMER_PORTAL_IMAGES = {
  hero: "customer_1.png",
  showcase: "customer_2.png",
  craft: "customer_3.png",
} as const;

/** Admin dashboard hero — product showcase (no separate admin uploads yet). */
export const ADMIN_PORTAL_IMAGES = {
  hero: "ring_3.png",
  accent: "necklace_1.png",
} as const;

export function productImageUrl(filename?: string): string | undefined {
  return filename ? `/images/${filename}` : undefined;
}
