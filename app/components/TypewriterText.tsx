"use client";

import { useEffect, useState } from "react";

type TypewriterTextProps = {
  phrases: string[];
  className?: string;
  speed?: number;
  pause?: number;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function TypewriterText({ phrases, className = "", speed = 42, pause = 2200 }: TypewriterTextProps) {
  const reducedMotion = usePrefersReducedMotion();
  const staticMode = reducedMotion || phrases.length <= 1;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(() => (staticMode ? (phrases[0]?.length ?? 0) : 0));
  const [deleting, setDeleting] = useState(false);

  const current = phrases[phraseIndex] ?? "";

  useEffect(() => {
    if (staticMode) return;

    const atEnd = charIndex === current.length;
    const atStart = charIndex === 0;

    let delay = speed;
    if (atEnd && !deleting) delay = pause;
    if (atStart && deleting) delay = speed * 2;

    const timer = window.setTimeout(() => {
      if (!deleting && charIndex < current.length) {
        setCharIndex((c) => c + 1);
        return;
      }

      if (!deleting && charIndex === current.length) {
        if (phrases.length === 1) return;
        setDeleting(true);
        return;
      }

      if (deleting && charIndex > 0) {
        setCharIndex((c) => c - 1);
        return;
      }

      if (deleting && charIndex === 0) {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [charIndex, current, deleting, pause, phrases.length, speed, staticMode]);

  const visible = staticMode ? current : current.slice(0, charIndex);

  return (
    <span className={`typewriter ${className}`.trim()} aria-live="polite">
      {visible}
      {!staticMode ? <span className="typewriter-cursor" aria-hidden="true" /> : null}
    </span>
  );
}
