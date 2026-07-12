"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

const slides = [
  { id: "admin", label: "Admin ERP" },
  { id: "portal", label: "Customer portal" },
  { id: "pos", label: "Point of sale" },
];

type ProductDemoProps = {
  variant?: "showcase" | "compact";
};

export function ProductDemo({ variant = "showcase" }: ProductDemoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (videoReady || variant !== "compact") return;
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [videoReady, variant]);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  const frameClass = variant === "showcase" ? "demo-showcase-frame" : "product-demo-browser";

  return (
    <div className={`product-demo ${variant === "showcase" ? "product-demo-showcase" : ""}`}>
      <div className={frameClass}>
        {variant === "compact" ? (
          <div className="product-demo-chrome">
            <span /><span /><span />
            <em>grids-gold.app</em>
          </div>
        ) : null}

        <div className="product-demo-stage">
          {videoReady ? (
            <>
              <video
                ref={videoRef}
                className="product-demo-video"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/demo-poster.svg"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              >
                <source src="/videos/grids_gold.mp4" type="video/mp4" />
              </video>
              {variant === "showcase" ? (
                <button
                  type="button"
                  className="demo-showcase-play"
                  aria-label={playing ? "Pause demo" : "Play demo"}
                  onClick={togglePlay}
                >
                  <Play size={18} />
                </button>
              ) : null}
            </>
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

      {variant === "compact" && !videoReady ? (
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
        </div>
      ) : null}

      <video
        className="product-demo-probe"
        muted
        playsInline
        onLoadedData={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
      >
        <source src="/videos/grids_gold.mp4" type="video/mp4" />
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
