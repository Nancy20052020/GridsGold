/**
 * Gold circle with serif “G” centred inside.
 * Uses CSS only so the letter always sits in the middle of the badge.
 */
export function BrandMark({ className }: { className: string }) {
  return (
    <span className={`${className} logo-mark-g`} aria-hidden="true">
      G
    </span>
  );
}
