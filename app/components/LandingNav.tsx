"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { moduleGroups } from "../lib/landingModules";
import { BrandMark } from "./BrandMark";

export function LandingNav() {
  const [modulesOpen, setModulesOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setModulesOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header className="landing-nav">
      <Link className="landing-nav-brand" href="/">
        <BrandMark className="auth-logo-mark" />
        <div>
          <strong>GRIDS GOLD</strong>
          <span>JEWELLERY ERP</span>
        </div>
      </Link>

      <nav className="landing-nav-links" aria-label="Landing sections">
        <div className="landing-nav-dropdown-wrap" ref={wrapRef}>
          <button
            type="button"
            className={`landing-nav-dropdown-trigger ${modulesOpen ? "open" : ""}`}
            aria-expanded={modulesOpen}
            aria-haspopup="true"
            onClick={() => setModulesOpen((open) => !open)}
          >
            Modules <ChevronDown size={15} />
          </button>

          {modulesOpen ? (
            <div className="landing-mega-menu" role="menu">
              <div className="landing-mega-grid">
                {moduleGroups.map((group) => (
                  <div className="landing-mega-col" key={group.label}>
                    <span className="landing-mega-label">{group.label}</span>
                    {group.items.map(({ icon: Icon, title, copy, href }) => (
                      <a
                        className="landing-mega-item"
                        href={href}
                        key={title}
                        role="menuitem"
                        onClick={() => setModulesOpen(false)}
                      >
                        <span className="landing-mega-icon"><Icon size={17} /></span>
                        <span>
                          <strong>{title}</strong>
                          <small>{copy}</small>
                        </span>
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#about">About</a>
      </nav>

      <div className="landing-nav-actions">
        <Link className="landing-nav-signin" href="/login">
          Sign in
        </Link>
        <Link className="landing-nav-cta" href="/login?signup=1">
          Get started <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}
