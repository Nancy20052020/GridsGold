"use client";

const TRUSTED_COMPANIES = [
  "Kalyan Jewellers",
  "Malabar Gold",
  "Tanishq",
  "Joyalukkas",
  "Senco Gold",
  "CaratLane",
  "TBZ Zaveri",
  "P.N. Gadgil",
  "Orra Diamonds",
  "Bluestone",
  "Candere",
  "Giva Jewels",
];

/** Infinite sideways company strip — Gem Logic style social proof. */
export function CompanyCarousel() {
  const loop = [...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES];

  return (
    <section className="landing-logos" aria-label="Jewellery houses that trust Grids Gold">
      <p className="landing-logos-label">Trusted by jewellery houses across India</p>
      <div className="landing-marquee">
        <div className="landing-marquee-track">
          {loop.map((name, index) => (
            <span className="landing-marquee-item" key={`${name}-${index}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
