"use client";

import { useId } from "react";

/** Gold circle with centred serif G — always renders correctly in the header/sidebar. */
export function BrandMark({ className }: { className: string }) {
  const gradId = useId().replace(/:/g, "");

  return (
    <svg className={`${className} logo-mark-svg`} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe08a" />
          <stop offset="0.45" stopColor="#f2b33d" />
          <stop offset="1" stopColor="#c8860f" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill={`url(#${gradId})`} />
      <text x="24" y="25" textAnchor="middle" dominantBaseline="middle" className="logo-mark-letter">
        G
      </text>
    </svg>
  );
}
