"use client";

import { ProductImage } from "./ProductImage";
import { AUTH_SHOWCASE } from "../lib/productImages";

type AuthShowcaseProps = {
  role: "customer" | "admin";
};

export function AuthShowcase({ role }: AuthShowcaseProps) {
  const showcase = AUTH_SHOWCASE[role];

  return (
    <div className={`auth-showcase ${role}`} aria-hidden="true">
      <div className="auth-showcase-glow" />
      <div className="auth-showcase-frame primary">
        <ProductImage image={showcase.primary} icon={role === "admin" ? "ring" : "necklace"} className="product-img auth-showcase-img" alt="" />
      </div>
      <div className="auth-showcase-frame secondary">
        <ProductImage image={showcase.secondary} icon={role === "admin" ? "necklace" : "ring"} className="product-img auth-showcase-img" alt="" />
      </div>
      <p className="auth-showcase-caption">{showcase.label}</p>
    </div>
  );
}
