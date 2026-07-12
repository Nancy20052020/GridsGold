"use client";

import { useState } from "react";

/**
 * Brand logo: gold circle with "G" inside (fallback), or `public/images/logo.png` when provided.
 */
export function BrandMark({ className }: { className: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`${className} logo-mark-g`} aria-hidden="true">
        G
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${className} logo-img`}
      src="/images/logo.png"
      alt="Grids Gold"
      onError={() => setFailed(true)}
    />
  );
}
