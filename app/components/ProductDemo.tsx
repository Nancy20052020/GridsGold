"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";

const slides = [
  {
    id: "admin",
    label: "Admin ERP",
    caption: "Dashboard, POS, inventory & reports in one workspace.",
  },
  {
    id: "portal",
    label: "Customer portal",
    caption: "Browse collections, track orders and repairs online.",
  },
  {
    id: "pos",
    label: "Point of sale",
    caption: "Bill in seconds with live gold-rate pricing.",
  },
];

export function ProductDemo() {
  const [active, setActive] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="product-demo">
      <div className="product-demo-browser">
        <div className="product-demo-chrome">
          <span /><span /><span />
          <em>grids-gold.app</em>
        </div>

        <div className="product-demo-stage">
          {videoReady ? (
            <video
              className="product-demo-video"
              autoPlay
              muted
              loop
              playsInline
              poster="/images/demo-poster.svg"
            >
              <source src="/videos/demo.mp4" type="video/mp4" />
            </video>
          ) : (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`product-demo-slide product-demo-slide-${slide.id} ${index === active ? "active" : ""}`}
                aria-hidden={index !== active}
              >
                {slide.id === "admin" ? <AdminPreview /> : null}
                {slide.id === "portal" ? <PortalPreview /> : null}
                {slide.id === "pos" ? <PosPreview /> : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="product-demo-meta">
        <div className="product-demo-tabs">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
            >
              {slide.label}
            </button>
          ))}
        </div>
        <p>{slides[active].caption}</p>
        <span className="product-demo-play-note">
          <Play size={14} /> Auto tour · drop <code>demo.mp4</code> in <code>public/videos/</code> to use a recording
        </span>
      </div>

      {/* Probe for optional demo video without breaking build */}
      <video
        className="product-demo-probe"
        muted
        playsInline
        onLoadedData={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
      >
        <source src="/videos/demo.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

function AdminPreview() {
  return (
    <div className="ui-preview ui-preview-admin">
      <aside className="ui-preview-sidebar">
        <span className="active">Dashboard</span>
        <span>POS</span>
        <span>Inventory</span>
        <span>Repairs</span>
      </aside>
      <div className="ui-preview-main">
        <div className="ui-preview-kpis">
          <div><small>Sales today</small><strong>₹ 4.2L</strong></div>
          <div><small>22K rate</small><strong>₹ 7,245</strong></div>
          <div><small>Low stock</small><strong>6</strong></div>
        </div>
        <div className="ui-preview-bars">
          <span style={{ height: "45%" }} /><span style={{ height: "72%" }} /><span style={{ height: "58%" }} />
          <span style={{ height: "86%" }} /><span style={{ height: "64%" }} /><span style={{ height: "92%" }} />
        </div>
      </div>
    </div>
  );
}

function PortalPreview() {
  return (
    <div className="ui-preview ui-preview-portal">
      <div className="ui-preview-portal-hero">
        <small>Welcome back</small>
        <strong>Timeless gold, crafted for you.</strong>
        <div className="ui-preview-portal-actions">
          <span className="gold">Explore</span>
          <span className="ghost">Repairs</span>
        </div>
      </div>
      <div className="ui-preview-portal-grid">
        <div /><div /><div /><div />
      </div>
    </div>
  );
}

function PosPreview() {
  return (
    <div className="ui-preview ui-preview-pos">
      <div className="ui-preview-pos-scan">Scan barcode…</div>
      <div className="ui-preview-pos-lines">
        <div><span>22K Gold Ring</span><strong>₹ 42,500</strong></div>
        <div><span>Gold Bangle</span><strong>₹ 68,200</strong></div>
      </div>
      <div className="ui-preview-pos-total">
        <span>Total</span><strong>₹ 1,10,700</strong>
      </div>
    </div>
  );
}
