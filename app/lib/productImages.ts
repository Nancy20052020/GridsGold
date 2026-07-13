/** Product photos — drop these files in `public/images/`. */
export const PRODUCT_IMAGE_FILES = {
  rings: ["ring_1.png", "ring_2.png", "ring_3.png", "ring_4.png", "ring_5.png"],
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
