/** Product photos — drop these files in `public/images/`. */
export const PRODUCT_IMAGE_FILES = {
  rings: ["ring_1.png", "ring_2.png", "ring_3.png", "ring_4.png", "ring_5.png"],
  necklaces: ["necklace_1.png", "necklace_2.png", "necklace_3.png"],
  earrings: ["earrings_1.png", "earrings_2.png"],
  anklet: ["anklet_1.png"],
} as const;

/** Category tile images on the customer portal home page. */
export const CATEGORY_IMAGES: Record<string, string> = {
  Rings: "ring_1.png",
  Necklaces: "necklace_1.png",
  Bangles: "ring_5.png",
  Earrings: "earrings_1.png",
  Pendants: "ring_2.png",
  Chains: "necklace_3.png",
};

/** Hero banner on `/portal`. */
export const HERO_IMAGE = "necklace_2.png";

export function productImageUrl(filename?: string): string | undefined {
  return filename ? `/images/${filename}` : undefined;
}
