"use client";

import { Sparkles } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { CATEGORY_IMAGES, HERO_IMAGE } from "../lib/productImages";

const orbitItems = [
  { image: CATEGORY_IMAGES.Rings, icon: "ring", label: "Rings", style: { top: "8%", left: "12%" } },
  { image: CATEGORY_IMAGES.Earrings, icon: "earrings", label: "Earrings", style: { top: "18%", right: "6%" } },
  { image: CATEGORY_IMAGES.Bangles, icon: "bangle", label: "Bangles", style: { bottom: "22%", left: "4%" } },
  { image: CATEGORY_IMAGES.Pendants, icon: "pendant", label: "Pendants", style: { bottom: "12%", right: "10%" } },
];

export function HeroShowcase() {
  return (
    <div className="landing-hero-showcase" aria-hidden="true">
      <div className="landing-orbit-ring landing-orbit-ring-outer" />
      <div className="landing-orbit-ring landing-orbit-ring-inner" />

      <div className="landing-hero-featured">
        <ProductImage image={HERO_IMAGE} icon="necklace" className="product-img landing-hero-piece" alt="" />
        <span className="landing-hero-featured-glow" />
      </div>

      {orbitItems.map(({ image, icon, label, style }) => (
        <div className="landing-orbit-chip" style={style} key={label}>
          <ProductImage image={image} icon={icon} className="product-img landing-orbit-chip-img" alt="" />
          <small>{label}</small>
        </div>
      ))}

      <div className="landing-hero-rate-float">
        <Sparkles size={14} /> 22K · ₹ 7,245/gm live
      </div>

      <div className="landing-hero-badge-float">
        BIS Hallmarked · Insured delivery
      </div>
    </div>
  );
}
