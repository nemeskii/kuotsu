import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

// Static fallback shape used only until the real data loads (or if the
// request fails) — units default to 0 so nothing falsely reads as available.
const BLOOD_TYPE_ORDER = ["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"];

// TODO: point this at your real Laravel route. Expected response shape:
// [{ type: 'A+', units: 1 }, { type: 'O-', units: 0 }, ...]
// Using the full origin here since the Laravel API (kuotsu-api) runs on a
// different port than the Vite dev server (kuotsu) — a relative path like
// '/api/blood-inventory' would 404 or hit the wrong server otherwise.
const INVENTORY_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/blood-inventory`;

// lucide-react dropped brand/logo icons (Instagram, Facebook, Twitter, etc.)
// in newer versions, so we use a small inline SVG matching the same outline
// style as the Mail and Phone icons above.
function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Thresholds that turn a raw unit count into a status. Tune these to
// whatever your medical/ops team considers critical vs. adequate.
function getLevel(units) {
  if (units <= 0) return "none";
  if (units < 10) return "critical";
  if (units < 25) return "low";
  return "adequate";
}

// Bar fill is relative to a rough "full stock" reference point, not a
// literal percentage of anything — purely visual, capped at 100%.
const FULL_STOCK_REFERENCE = 50;
function getPct(units) {
  return Math.max(
    0,
    Math.min(100, Math.round((units / FULL_STOCK_REFERENCE) * 100)),
  );
}

const levelColor = {
  critical: "#E31E24",
  low: "#D98A3D",
  adequate: "#4CAF7D",
  none: "#B0AEA6",
};

const levelLabel = {
  critical: "Critical need",
  low: "Running low",
  adequate: "Adequate",
  none: "Not available",
};

const steps = [
  {
    n: "01",
    title: "Register",
    body: "Create a donor profile with your blood type and contact details. Two minutes, done.",
  },
  {
    n: "02",
    title: "Get matched",
    body: "We call when someone nearby needs your type, or when a drive lands in your area.",
  },
  {
    n: "03",
    title: "Donate",
    body: "Show up. Give blood. One donation can help up to three patients.",
  },
];

export default function Home() {
  const [openType, setOpenType] = useState(null);
  const [inventory, setInventory] = useState(
    Object.fromEntries(BLOOD_TYPE_ORDER.map((t) => [t, 0])),
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch(INVENTORY_ENDPOINT);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const next = { ...inventory };
      data.forEach((row) => {
        if (BLOOD_TYPE_ORDER.includes(row.type))
          next[row.type] = row.units ?? 0;
      });
      setInventory(next);
      setLoadError(false);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchInventory();

    // Poll periodically so a donor registering elsewhere (or a unit being
    // used) shows up here without the visitor needing to refresh.
    const interval = setInterval(fetchInventory, 20000);

    // Also refetch when the tab regains focus — catches updates fast for
    // someone who registered in another tab and switched back.
    const onFocus = () => fetchInventory();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchInventory]);

  const bloodTypes = BLOOD_TYPE_ORDER.map((type) => {
    const units = inventory[type] ?? 0;
    return { type, units, level: getLevel(units), pct: getPct(units) };
  });

  return (
    <div className="cbd-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        * { box-sizing: border-box; }

        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
        }

        .cbd-page {
          --ink: #0A0A0A;
          --paper: #F4F2ED;
          --crimson: #E31E24;
          --grey: #8A8880;
          --grey-dark: #B0AEA6;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--ink);
          color: var(--paper);
          overflow-x: hidden;
          min-height: 100vh;
          /* Breaks out of any parent container's max-width/padding so this
             page always goes edge-to-edge, no matter what wraps it. */
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }

        /* ---- Top bar ---- */
        .cbd-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          max-width: 1400px;
          margin: 0 auto;
          gap: 24px;
        }

        .cbd-nav {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .cbd-nav a {
          color: var(--grey-dark);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .cbd-nav a:hover {
          color: var(--paper);
          border-color: var(--crimson);
        }

        .cbd-mark {
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          letter-spacing: 0.04em;
          color: var(--paper);
        }

        .cbd-mark span { color: var(--crimson); }

        .cbd-admin-link-top {
          color: var(--grey-dark);
          font-size: 12px;
          text-decoration: none;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-bottom: 1px solid transparent;
          transition: border-color 0.15s ease, color 0.15s ease;
        }

        .cbd-admin-link-top:hover {
          color: var(--paper);
          border-color: var(--paper);
        }

        /* ---- Hero, full viewport ---- */
        .cbd-hero {
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .cbd-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(11px, 1.5vw, 13px);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--crimson);
          margin-bottom: 20px;
        }

        .cbd-heading {
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          font-size: clamp(48px, 11vw, 128px);
          line-height: 0.95;
          letter-spacing: -0.01em;
          color: var(--paper);
          margin: 0 auto 28px;
          max-width: 900px;
        }

        .cbd-heading em {
          font-style: normal;
          color: var(--crimson);
        }

        .cbd-text {
          font-size: clamp(15px, 2vw, 18px);
          line-height: 1.6;
          color: var(--grey-dark);
          max-width: 520px;
          margin: 0 auto 40px;
        }

        .cbd-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cbd-button {
          display: inline-block;
          padding: 18px 36px;
          background: var(--crimson);
          color: #fff;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 20px rgba(227, 30, 36, 0.35);
        }

        .cbd-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(227, 30, 36, 0.45);
        }

        .cbd-button--ghost {
          background: transparent;
          color: var(--paper);
          border: 1.5px solid var(--paper);
          box-shadow: none;
        }

        .cbd-button--ghost:hover {
          background: var(--paper);
          color: var(--ink);
        }

        /* ---- Pulse divider ---- */
        .cbd-pulse-wrap {
          background: var(--ink);
          padding: 0 24px 40px;
        }

        .cbd-pulse {
          display: block;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          height: 48px;
        }

        .cbd-pulse-path {
          stroke-dasharray: 1400;
          stroke-dashoffset: 1400;
          animation: cbd-draw 1.6s ease-out 0.3s forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .cbd-pulse-path { animation: none; stroke-dashoffset: 0; }
        }

        @keyframes cbd-draw {
          to { stroke-dashoffset: 0; }
        }

        /* ---- Stats: full-bleed red band ---- */
        .cbd-stats-band {
          background: var(--crimson);
          padding: 64px 24px;
        }

        .cbd-stats {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .cbd-stat-num {
          font-family: 'Anton', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          line-height: 1;
          color: #fff;
          display: block;
        }

        .cbd-stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: clamp(11px, 1.5vw, 13px);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.85);
          margin-top: 8px;
        }

        /* ---- Blood type section: off-white, full bleed ---- */
        .cbd-section-light {
          background: var(--paper);
          color: var(--ink);
          padding: 80px 24px;
        }

        .cbd-section-inner {
          max-width: 1400px;
          margin: 0 auto;
        }

        .cbd-section-title {
          font-family: 'Anton', sans-serif;
          text-transform: uppercase;
          font-size: clamp(28px, 5vw, 44px);
          margin: 0 0 44px;
          letter-spacing: -0.01em;
        }

        .cbd-blood-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .cbd-blood-card {
          background: #fff;
          border: 2px solid var(--ink);
          border-radius: 4px;
          padding: 20px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .cbd-blood-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(10, 10, 10, 0.14);
          border-color: var(--crimson);
        }

        .cbd-blood-card:focus-visible {
          outline: 3px solid var(--crimson);
          outline-offset: 2px;
        }

        .cbd-blood-card--active {
          border-color: var(--crimson);
          box-shadow: 0 12px 24px rgba(227, 30, 36, 0.18);
        }

        .cbd-blood-card--empty {
          opacity: 0.6;
        }

        .cbd-blood-card--empty:hover {
          border-color: var(--ink);
          transform: none;
          box-shadow: none;
        }

        .cbd-inventory-note {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--grey);
          margin: -24px 0 32px;
        }

        .cbd-blood-type {
          font-family: 'Anton', sans-serif;
          font-size: 28px;
          color: var(--ink);
        }

        .cbd-blood-bar-track {
          background: #E3E0D8;
          border-radius: 4px;
          height: 6px;
          margin: 14px 0 10px;
          overflow: hidden;
        }

        .cbd-blood-bar-fill {
          height: 100%;
          border-radius: 4px;
        }

        .cbd-blood-level {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .cbd-blood-units {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.2s ease;
        }

        .cbd-blood-card--active .cbd-blood-units {
          grid-template-rows: 1fr;
        }

        .cbd-blood-units-inner {
          overflow: hidden;
        }

        .cbd-blood-units-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--grey);
          padding-top: 12px;
          margin-top: 4px;
          border-top: 1px solid #E3E0D8;
        }

        .cbd-blood-units-num {
          color: var(--ink);
          font-weight: 600;
        }

        /* ---- How it works: dark section with huge outline numbers ---- */
        .cbd-section-dark {
          background: var(--ink);
          padding: 80px 24px 96px;
        }

        .cbd-steps {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .cbd-step-n {
          font-family: 'Anton', sans-serif;
          font-size: 72px;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1.5px var(--crimson);
          margin-bottom: 16px;
        }

        .cbd-step-title {
          font-family: 'Anton', sans-serif;
          text-transform: uppercase;
          font-size: 22px;
          color: var(--paper);
          margin: 0 0 10px;
        }

        .cbd-step-body {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--grey-dark);
        }

        /* ---- Final CTA, full bleed ---- */
        .cbd-cta-band {
          background: var(--crimson);
          padding: 80px 24px;
          text-align: center;
        }

        .cbd-cta-heading {
          font-family: 'Anton', sans-serif;
          text-transform: uppercase;
          font-size: clamp(36px, 8vw, 80px);
          color: #fff;
          line-height: 1;
          margin: 0;
        }

        .cbd-about {
          max-width: 760px;
          text-align: center;
        }

        .cbd-about-text {
          font-size: clamp(15px, 2vw, 18px);
          line-height: 1.7;
          color: var(--ink);
          opacity: 0.75;
        }

        /* ---- Contact ---- */
        .cbd-contact {
          background: var(--ink);
          padding: 80px 24px 96px;
        }

        .cbd-contact-inner {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
        }

        .cbd-contact-title {
          font-family: 'Anton', sans-serif;
          text-transform: uppercase;
          font-size: clamp(28px, 5vw, 44px);
          color: var(--paper);
          margin: 0 0 12px;
        }

        .cbd-contact-sub {
          color: var(--grey-dark);
          font-size: 15px;
          margin: 0 0 44px;
        }

        .cbd-contact-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .cbd-contact-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 24px;
          background: rgba(244, 242, 237, 0.05);
          border: 1px solid rgba(244, 242, 237, 0.15);
          border-radius: 999px;
          color: var(--paper);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
        }

        .cbd-contact-link:hover {
          border-color: var(--crimson);
          background: rgba(227, 30, 36, 0.1);
          transform: translateY(-2px);
        }

        .cbd-contact-link svg {
          width: 18px;
          height: 18px;
          color: var(--crimson);
          flex-shrink: 0;
        }
        @media (max-width: 720px) {
          .cbd-stats { grid-template-columns: 1fr; gap: 36px; text-align: center; }
          .cbd-blood-grid { grid-template-columns: repeat(2, 1fr); }
          .cbd-steps { grid-template-columns: 1fr; gap: 44px; }
          .cbd-hero { min-height: 82vh; }
          .cbd-actions { flex-direction: column; }
          .cbd-actions .cbd-button { text-align: center; }
          .cbd-topbar { flex-wrap: wrap; justify-content: center; text-align: center; }
          .cbd-nav { gap: 18px; flex-wrap: wrap; justify-content: center; order: 3; width: 100%; }
          .cbd-contact-links { flex-direction: column; align-items: stretch; }
          .cbd-contact-link { justify-content: center; }
        }
      `}</style>

      {/* Top bar */}
      <div className="cbd-topbar">
        <div className="cbd-mark">
          COMMUNITY<span>BLOOD</span>
        </div>
        <ul className="cbd-nav">
          <li>
            <a href="#top">Home</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#how-it-works">How It Works</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
        <Link to="/admin/login" className="cbd-admin-link-top">
          Admin
        </Link>
      </div>

      {/* Hero */}
      <div className="cbd-hero" id="top">
        <div className="cbd-eyebrow">Community Blood Donation Network</div>
        <h1 className="cbd-heading">
          SOMEONE NEEDS
          <br />
          YOUR BLOOD TYPE
          <br />
          <em>TODAY.</em>
        </h1>
        <p className="cbd-text">
          Join a network of donors matched to real, local need. Register once,
          get called when it matters, and see the impact of every donation.
        </p>
        <div className="cbd-actions">
          <Link to="/register" className="cbd-button">
            Register Now
          </Link>
          <a href="#how-it-works" className="cbd-button cbd-button--ghost">
            How It Works
          </a>
        </div>
      </div>

      {/* Pulse divider */}
      <div className="cbd-pulse-wrap">
        <svg
          className="cbd-pulse"
          viewBox="0 0 900 48"
          preserveAspectRatio="none"
        >
          <path
            className="cbd-pulse-path"
            d="M0 24 H320 L345 24 L360 6 L378 42 L396 24 L420 24 H580 L605 24 L620 6 L638 42 L656 24 L680 24 H900"
            fill="none"
            stroke="#E31E24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* About */}
      <div className="cbd-section-light" id="about">
        <div className="cbd-section-inner cbd-about">
          <h2 className="cbd-section-title">About This Network</h2>
          <p className="cbd-about-text">
            Community Blood is a local donor network built to close the gap
            between people who need blood and people willing to give it. Instead
            of relying on one-off donation drives, donors register once and get
            matched to real requests as they come in — whenever and wherever
            their blood type is needed most.
          </p>
        </div>
      </div>

      {/* Stats band */}
      <div className="cbd-stats-band">
        <div className="cbd-stats">
          <div>
            <span className="cbd-stat-num">3</span>
            <div className="cbd-stat-label">Lives helped per donation</div>
          </div>
          <div>
            <span className="cbd-stat-num">56</span>
            <div className="cbd-stat-label">Days between donations</div>
          </div>
          <div>
            <span className="cbd-stat-num">24/7</span>
            <div className="cbd-stat-label">Emergency request line</div>
          </div>
        </div>
      </div>

      {/* Blood type urgency board */}
      <div className="cbd-section-light">
        <div className="cbd-section-inner">
          <h2 className="cbd-section-title">Current Need by Blood Type</h2>
          {loadError && (
            <p className="cbd-inventory-note">
              Couldn't load live inventory right now — showing the last known
              status.
            </p>
          )}
          <div className="cbd-blood-grid">
            {bloodTypes.map((b) => {
              const isOpen = openType === b.type;
              const unavailable = b.level === "none";
              return (
                <button
                  type="button"
                  key={b.type}
                  className={`cbd-blood-card${isOpen ? " cbd-blood-card--active" : ""}${unavailable ? " cbd-blood-card--empty" : ""}`}
                  onClick={() => setOpenType(isOpen ? null : b.type)}
                  aria-expanded={isOpen}
                >
                  <div className="cbd-blood-type">{b.type}</div>
                  <div className="cbd-blood-bar-track">
                    <div
                      className="cbd-blood-bar-fill"
                      style={{
                        width: `${b.pct}%`,
                        background: levelColor[b.level],
                      }}
                    />
                  </div>
                  <div
                    className="cbd-blood-level"
                    style={{ color: levelColor[b.level] }}
                  >
                    {loading ? "Loading…" : levelLabel[b.level]}
                  </div>
                  <div className="cbd-blood-units">
                    <div className="cbd-blood-units-inner">
                      <div className="cbd-blood-units-text">
                        {unavailable ? (
                          "No units currently available"
                        ) : (
                          <>
                            <span className="cbd-blood-units-num">
                              {b.units} units
                            </span>{" "}
                            available now
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="cbd-section-dark" id="how-it-works">
        <div className="cbd-steps">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="cbd-step-n">{s.n}</div>
              <h3 className="cbd-step-title">{s.title}</h3>
              <p className="cbd-step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA — closing statement only; the Register CTA already
          lives in the hero, so we don't repeat the button here. */}
      <div className="cbd-cta-band">
        <h2 className="cbd-cta-heading">
          Be Someone's
          <br />
          Reason to Live.
        </h2>
      </div>

      {/* Contact */}
      <div className="cbd-contact" id="contact">
        <div className="cbd-contact-inner">
          <h2 className="cbd-contact-title">Get In Touch</h2>
          <p className="cbd-contact-sub">
            Questions, partnerships, or press — reach out directly.
          </p>
          <div className="cbd-contact-links">
            <a
              className="cbd-contact-link"
              href="https://www.instagram.com/nemeskii/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
            </a>
            <a className="cbd-contact-link" href="mailto:kuotsuato58@gmail.com">
              <Mail /> kuotsuato58@gmail.com
            </a>
            <a className="cbd-contact-link" href="tel:+918259030753">
              <Phone /> +91 8259030753
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
