"use client";

import { useState } from "react";

/**
 * Brand logo. If you drop a logo image at `public/images/logo.png` it is shown
 * automatically; otherwise it falls back to the styled gold "G" mark.
 */
export function BrandMark({ className }: { className: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={className}>G</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${className} logo-img`}
      src="/images/logo.png"
      alt="Grids Gold logo"
      onError={() => setFailed(true)}
    />
  );
}
