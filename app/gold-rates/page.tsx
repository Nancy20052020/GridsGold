"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Download,
  Gauge,
  GitCompareArrows,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { downloadCsv } from "../lib/export";
import {
  AI_INSIGHTS,
  LIVE_COUNTRIES,
  MARKET_NEWS,
  METALS,
  USD_SPOT_SEED,
  countryByCode,
  formatLive,
  historySeries,
  liveFeedToRates,
  priceInCurrency,
  tickUsdSpots,
  type LiveCountry,
  type MetalId,
} from "../lib/liveRates";
import { formatINR, useStore } from "../lib/store";

const FAV_KEY = "gg_live_rate_favs";
const HUB_TABS = ["Live Map", "Compare", "Insights", "Alerts", "News"] as const;
type HubTab = (typeof HUB_TABS)[number];

/** Equirectangular pin % for the geographic world map asset. */
function pinStyle(c: LiveCountry): { left: string; top: string } {
  const left = ((c.lon + 180) / 360) * 100;
  const top = ((90 - c.lat) / 180) * 100;
  return { left: `${left}%`, top: `${Math.min(88, Math.max(8, top))}%` };
}

function loadFavs(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    /* ignore */
  }
  return ["IN", "AE", "US"];
}

export default function GoldRatesPage() {
  const { applyLiveRates, rates } = useStore();

  const [hub, setHub] = useState<HubTab>("Live Map");
  const [countryCode, setCountryCode] = useState("IN");
  const [hoverCode, setHoverCode] = useState<string | null>(null);
  const [compareA, setCompareA] = useState("IN");
  const [compareB, setCompareB] = useState("AE");
  const [usdSpots, setUsdSpots] = useState(USD_SPOT_SEED);
  const [lastTick, setLastTick] = useState(() => new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSec, setRefreshSec] = useState(8);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["IN", "AE", "US"];
    return loadFavs();
  });
  const [toast, setToast] = useState("");
  const [alertMetal, setAlertMetal] = useState<MetalId>("gold22");
  const [alertAbove, setAlertAbove] = useState("");
  const [alertChannel, setAlertChannel] = useState<"Email" | "SMS" | "WhatsApp">("WhatsApp");
  const [alerts, setAlerts] = useState<{ id: string; metal: MetalId; above: number; channel: string; country: string }[]>([]);
  const [focusMetal, setFocusMetal] = useState<MetalId>("gold22");

  const country = countryByCode(countryCode);
  const hoverCountry = hoverCode ? countryByCode(hoverCode) : null;

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  useEffect(() => {
    applyLiveRates(liveFeedToRates(usdSpots, countryByCode("IN")));
  }, [usdSpots, applyLiveRates]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      setUsdSpots((prev) => tickUsdSpots(prev));
      setLastTick(new Date());
      setRefreshSec(8);
    }, 8000);
    const tick = window.setInterval(() => setRefreshSec((s) => Math.max(0, s - 1)), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(tick);
    };
  }, [autoRefresh]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  function refreshNow() {
    setUsdSpots((prev) => tickUsdSpots(prev));
    setLastTick(new Date());
    setRefreshSec(8);
    flash("Live feed refreshed");
  }

  function selectCountry(code: string) {
    setCountryCode(code);
    setHub("Live Map");
    flash(`${countryByCode(code).name} selected`);
  }

  function toggleFav(code: string) {
    setFavorites((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function addAlert() {
    const above = Number(alertAbove);
    if (!above) {
      flash("Enter a threshold");
      return;
    }
    setAlerts((p) => [
      { id: "a" + Date.now(), metal: alertMetal, above, channel: alertChannel, country: countryCode },
      ...p,
    ]);
    setAlertAbove("");
    flash(`${alertChannel} alert armed`);
  }

  function exportReport() {
    downloadCsv(
      `live-rates-${country.code}`,
      ["Metal", "Price", "Currency", "Country", "USD spot", "Premium", "As of"],
      METALS.map((m) => [
        m.label,
        priceInCurrency(usdSpots[m.id], country),
        country.currency,
        country.name,
        usdSpots[m.id],
        `${Math.round((country.premium - 1) * 1000) / 10}%`,
        lastTick.toISOString(),
      ]),
    );
    flash("Report exported · CSV");
  }

  const localPrices = useMemo(
    () => METALS.map((m) => ({ ...m, price: priceInCurrency(usdSpots[m.id], country) })),
    [usdSpots, country],
  );

  const chartSeries = useMemo(
    () => historySeries(priceInCurrency(usdSpots[focusMetal], country), 28),
    [usdSpots, focusMetal, country],
  );
  const chartMax = Math.max(...chartSeries);
  const chartMin = Math.min(...chartSeries);

  const ca = countryByCode(compareA);
  const cb = countryByCode(compareB);
  const focusMeta = METALS.find((m) => m.id === focusMetal)!;

  return (
    <AppShell searchPlaceholder="Search country, metal, alert…">
      <section className="page-content live-v2 live-v2-mapfirst">
        <header className="live-v2-head">
          <div>
            <span className="live-v2-eyebrow"><Globe2 size={14} /> Live precious metals</span>
            <h1>Live Gold Rate</h1>
            <p>Click any country on the map — live 24K / 22K / silver / platinum / diamond with FX conversion.</p>
          </div>
          <div className="live-v2-head-actions">
            <button type="button" className={`live-v2-btn ghost ${autoRefresh ? "on" : ""}`} onClick={() => setAutoRefresh((v) => !v)}>
              <RefreshCw size={16} className={autoRefresh ? "spin" : ""} />
              {autoRefresh ? `Auto · ${refreshSec}s` : "Auto off"}
            </button>
            <button type="button" className="live-v2-btn ghost" onClick={refreshNow}><Gauge size={16} /> Refresh</button>
            <button type="button" className="live-v2-btn ghost" onClick={exportReport}><Download size={16} /> Export</button>
            <button type="button" className="live-v2-btn ghost" onClick={() => flash("Share link copied")}><Share2 size={16} /> Share</button>
            <button type="button" className="live-v2-btn gold" onClick={() => setHub("Alerts")}><Bell size={16} /> Alerts</button>
          </div>
        </header>

        <section className="live-glass live-v2-tools live-v2-tools-map">
          <label>
            <span>Country</span>
            <select value={countryCode} onChange={(e) => selectCountry(e.target.value)} aria-label="Country">
              {LIVE_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name} · {c.currency}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Currency</span>
            <input readOnly value={`${country.currency} (${country.symbol})`} />
          </label>
          <label>
            <span>Focus metal</span>
            <select value={focusMetal} onChange={(e) => setFocusMetal(e.target.value as MetalId)}>
              {METALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </label>
          <div className="live-v2-tick">
            <span className="live-pulse" />
            Live · {lastTick.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </section>

        <nav className="live-glass live-v2-tabs" aria-label="Live rates sections">
          {HUB_TABS.map((t) => (
            <button key={t} type="button" className={hub === t ? "active" : ""} onClick={() => setHub(t)}>{t}</button>
          ))}
        </nav>

        {hub === "Live Map" ? (
          <>
            <div className="live-v2-hero">
              <section className="live-glass live-v2-map-hero">
                <div className="live-v2-section-head">
                  <h2><MapPin size={16} /> Global rate map</h2>
                  <span className="live-v2-map-hint">Hover · click a market pin</span>
                </div>

                <div className="live-v2-map live-v2-map-lg live-v2-map-geo" onMouseLeave={() => setHoverCode(null)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="live-v2-map-geo-img"
                    src="/images/world-map.svg"
                    alt=""
                    aria-hidden
                    draggable={false}
                  />

                  {LIVE_COUNTRIES.map((c) => {
                    const active = c.code === countryCode;
                    const hovered = c.code === hoverCode;
                    const price = priceInCurrency(usdSpots[focusMetal], c);
                    return (
                      <button
                        key={c.code}
                        type="button"
                        className={`live-v2-pin ${active ? "active" : ""} ${hovered ? "hover" : ""} ${favorites.includes(c.code) ? "fav" : ""}`}
                        style={pinStyle(c)}
                        onMouseEnter={() => setHoverCode(c.code)}
                        onFocus={() => setHoverCode(c.code)}
                        onClick={() => selectCountry(c.code)}
                        aria-label={`${c.name} ${formatLive(price, c)}`}
                      >
                        <i />
                        <em>{c.code}</em>
                        {(active || hovered) ? (
                          <span className="live-v2-pin-tip">
                            <strong>{c.name}</strong>
                            <small>{focusMeta.label}</small>
                            <b>{formatLive(price, c)}</b>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="live-v2-map-legend">
                  <span><i className="dot gold" /> Selected</span>
                  <span><i className="dot fav" /> Favorite</span>
                  <span><i className="dot soft" /> Live market</span>
                  {hoverCountry ? (
                    <em>Hover · {hoverCountry.name} · {formatLive(priceInCurrency(usdSpots[focusMetal], hoverCountry), hoverCountry)}</em>
                  ) : (
                    <em>Hover pins for {focusMeta.label} · click to lock country</em>
                  )}
                </div>
              </section>

              <aside className="live-v2-country-panel">
                <section className="live-glass live-v2-selected">
                  <div className="live-v2-selected-head">
                    <div>
                      <span className="live-v2-eyebrow">{country.region} · {country.currency}</span>
                      <h2>{country.name}</h2>
                      <p>FX {country.usdFx} / USD · premium {((country.premium - 1) * 100).toFixed(1)}%</p>
                    </div>
                    <button type="button" className="live-v2-btn ghost compact" onClick={() => toggleFav(country.code)}>
                      <Star size={14} fill={favorites.includes(country.code) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="live-v2-spot-stack">
                    {localPrices.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        className={`live-v2-spot-row tone-${m.tone} ${focusMetal === m.id ? "active" : ""}`}
                        onClick={() => setFocusMetal(m.id)}
                      >
                        <span>{m.label}</span>
                        <strong>{formatLive(m.price, country)}</strong>
                        <small>{m.unit}</small>
                      </button>
                    ))}
                  </div>

                  <div className="live-v2-section-head" style={{ marginTop: 14 }}>
                    <h2><TrendingUp size={16} /> {focusMeta.label} trend</h2>
                  </div>
                  <div className="live-v2-chart" aria-hidden>
                    {chartSeries.map((v, i) => (
                      <span
                        key={i}
                        style={{ height: `${8 + ((v - chartMin) / Math.max(chartMax - chartMin, 1)) * 92}%` }}
                        title={String(v)}
                      />
                    ))}
                  </div>
                </section>

                <section className="live-glass">
                  <div className="live-v2-section-head"><h2><Star size={16} /> Favorites</h2></div>
                  <div className="live-v2-fav-list">
                    {favorites.map((code) => {
                      const c = countryByCode(code);
                      return (
                        <button type="button" key={code} className={code === countryCode ? "active" : ""} onClick={() => selectCountry(code)}>
                          <strong>{c.name}</strong>
                          <span>{formatLive(priceInCurrency(usdSpots.gold22, c), c)}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="live-glass">
                  <div className="live-v2-section-head"><h2>ERP sync (India)</h2></div>
                  <div className="live-v2-sync">
                    {(["22K", "24K", "18K", "925", "PT950"] as const).map((k) => (
                      <div key={k}><span>{k}</span><strong>{formatINR(rates[k])}</strong></div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>

            <section className="live-v2-kpis live-v2-kpis-below" aria-label="Spot KPIs">
              {localPrices.map((m) => (
                <button
                  type="button"
                  className={`live-v2-kpi tone-${m.tone} ${focusMetal === m.id ? "active" : ""}`}
                  key={m.id}
                  onClick={() => setFocusMetal(m.id)}
                >
                  <span>{m.label}</span>
                  <strong>{formatLive(m.price, country)}</strong>
                  <small>{m.unit} · {country.code}</small>
                </button>
              ))}
            </section>

            <div className="live-v2-bottom-strip">
              <section className="live-glass live-v2-ai">
                <div className="live-v2-section-head"><h2><Sparkles size={16} /> AI price pulse</h2></div>
                <ul className="live-v2-ai-list">
                  {AI_INSIGHTS.slice(0, 3).map((row) => (
                    <li key={row.title}><strong>{row.title}</strong><small>{row.body}</small></li>
                  ))}
                </ul>
              </section>
              <section className="live-glass">
                <div className="live-v2-section-head"><h2>Market news</h2></div>
                <div className="live-v2-news live-v2-news-compact">
                  {MARKET_NEWS.slice(0, 3).map((n) => (
                    <article key={n.id}>
                      <em>{n.tag}</em>
                      <strong>{n.title}</strong>
                      <small>{n.source} · {n.when}</small>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : null}

        {hub === "Compare" ? (
          <div className="live-v2-compare">
            <section className="live-glass">
              <div className="live-v2-section-head"><h2><GitCompareArrows size={16} /> Compare countries</h2></div>
              <div className="live-v2-compare-tools">
                <label>
                  <span>Country A</span>
                  <select value={compareA} onChange={(e) => setCompareA(e.target.value)}>
                    {LIVE_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Country B</span>
                  <select value={compareB} onChange={(e) => setCompareB(e.target.value)}>
                    {LIVE_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="live-v2-table-wrap">
                <table className="live-v2-table">
                  <thead>
                    <tr>
                      <th>Metal</th>
                      <th>{ca.name}</th>
                      <th>{cb.name}</th>
                      <th>USD parity A</th>
                      <th>USD parity B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METALS.map((m) => {
                      const pa = priceInCurrency(usdSpots[m.id], ca);
                      const pb = priceInCurrency(usdSpots[m.id], cb);
                      return (
                        <tr key={m.id}>
                          <td>{m.label}</td>
                          <td><strong>{formatLive(pa, ca)}</strong></td>
                          <td><strong>{formatLive(pb, cb)}</strong></td>
                          <td>${(pa / ca.usdFx).toFixed(2)}</td>
                          <td>${(pb / cb.usdFx).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {hub === "Insights" ? (
          <div className="live-v2-insights">
            <section className="live-glass live-v2-ai">
              <div className="live-v2-section-head"><h2><Sparkles size={16} /> AI predictions</h2></div>
              <ul className="live-v2-ai-list">
                {AI_INSIGHTS.map((row) => (
                  <li key={row.title}><strong>{row.title}</strong><small>{row.body}</small></li>
                ))}
              </ul>
            </section>
            <section className="live-glass">
              <div className="live-v2-section-head"><h2>Market insights</h2></div>
              <div className="live-v2-insight-cards">
                {[
                  { t: "Retail premium", d: `${country.name} trades at ${((country.premium - 1) * 100).toFixed(1)}% vs London spot.` },
                  { t: "Spread watch", d: "22K–24K spread stable; jewellery desk can keep making bands." },
                  { t: "Cross FX", d: `${country.currency} at ${country.usdFx} vs USD — conversion baked into board.` },
                  { t: "Liquidity", d: "AE / HK bullion windows remain most liquid overnight." },
                ].map((c) => (
                  <article key={c.t}><strong>{c.t}</strong><p>{c.d}</p></article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {hub === "Alerts" ? (
          <div className="live-v2-alerts-hub">
            <section className="live-glass">
              <div className="live-v2-section-head"><h2><Bell size={16} /> Price alerts</h2></div>
              <div className="live-v2-alert-form">
                <label>
                  <span>Metal</span>
                  <select value={alertMetal} onChange={(e) => setAlertMetal(e.target.value as MetalId)}>
                    {METALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Alert when above ({country.symbol})</span>
                  <input type="number" value={alertAbove} onChange={(e) => setAlertAbove(e.target.value)} placeholder="e.g. 7500" />
                </label>
                <label>
                  <span>Channel</span>
                  <select value={alertChannel} onChange={(e) => setAlertChannel(e.target.value as typeof alertChannel)}>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>WhatsApp</option>
                  </select>
                </label>
                <button type="button" className="live-v2-btn gold" onClick={addAlert}>Arm alert</button>
              </div>
              <div className="live-v2-alert-channels">
                <button type="button" className="live-v2-btn ghost" onClick={() => flash("Email channel verified")}><Mail size={14} /> Email</button>
                <button type="button" className="live-v2-btn ghost" onClick={() => flash("SMS channel verified")}><Phone size={14} /> SMS</button>
                <button type="button" className="live-v2-btn ghost" onClick={() => flash("WhatsApp channel verified")}><MessageCircle size={14} /> WhatsApp</button>
              </div>
            </section>
            <section className="live-glass">
              <div className="live-v2-section-head"><h2>Active alerts</h2></div>
              {alerts.length === 0 ? <p className="live-v2-sub">No alerts yet — arm one for {country.name}.</p> : null}
              <div className="live-v2-alert-list">
                {alerts.map((a) => (
                  <article key={a.id}>
                    <strong>{METALS.find((m) => m.id === a.metal)?.label}</strong>
                    <span>Above {a.above} · {a.channel} · {a.country}</span>
                    <button type="button" className="live-v2-btn ghost compact" onClick={() => setAlerts((p) => p.filter((x) => x.id !== a.id))}>Remove</button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {hub === "News" ? (
          <section className="live-glass">
            <div className="live-v2-section-head"><h2>Global market news</h2></div>
            <div className="live-v2-news">
              {MARKET_NEWS.map((n) => (
                <article key={n.id}>
                  <em>{n.tag}</em>
                  <strong>{n.title}</strong>
                  <small>{n.source} · {n.when}</small>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {toast ? <div className="live-v2-toast" role="status">{toast}</div> : null}
      </section>
    </AppShell>
  );
}
