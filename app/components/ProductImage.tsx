"use client";

import { useState } from "react";
import type { Item } from "../lib/store";
import { productImageUrl } from "../lib/productImages";

type ProductImageProps = {
  image?: string;
  icon?: string;
  alt?: string;
  className?: string;
};

export function ProductImage({ image, icon = "ring", alt = "", className = "product-img" }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src = productImageUrl(image);

  if (!src || failed) {
    return <span className={`jewel-icon ${icon || "ring"}`} aria-hidden={!alt} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
  );
}

export function ItemImage({
  item,
  className = "product-img",
  alt,
}: {
  item: Pick<Item, "image" | "icon" | "name">;
  className?: string;
  alt?: string;
}) {
  return <ProductImage image={item.image} icon={item.icon} alt={alt ?? item.name} className={className} />;
}
