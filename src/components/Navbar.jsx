import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ tone = "dark" }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const onHome = location.pathname === "/";
  const onAbout = location.pathname === "/about";
  const onHowItWorks = location.pathname === "/how-it-works";
  const onContact = location.pathname === "/contact";

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className={`site-topbar site-topbar--${tone}`}>
      <Link to="/" className="site-mark">
        COMMUNITY<span>BLOOD</span>
      </Link>

      <ul className="site-nav">
        <li>
          <Link to="/" className={onHome ? "is-active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className={onAbout ? "is-active" : ""}>
            About
          </Link>
        </li>
        <li>
          <Link to="/how-it-works" className={onHowItWorks ? "is-active" : ""}>
            How It Works
          </Link>
        </li>
        <li>
          <Link to="/contact" className={onContact ? "is-active" : ""}>
            Contact
          </Link>
        </li>
      </ul>

      {onHome && (
        <Link to="/admin/login" className="site-admin-link">
          Admin
        </Link>
      )}

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className={`site-nav-toggle${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav-menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Backdrop, click to close */}
      <div
        className={`site-nav-backdrop${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        id="mobile-nav-menu"
        className={`site-nav-mobile${menuOpen ? " is-open" : ""}`}
      >
        <ul>
          <li>
            <Link to="/" className={onHome ? "is-active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={onAbout ? "is-active" : ""}>
              About
            </Link>
          </li>
          <li>
            <Link
              to="/how-it-works"
              className={onHowItWorks ? "is-active" : ""}
            >
              How It Works
            </Link>
          </li>
          <li>
            <Link to="/contact" className={onContact ? "is-active" : ""}>
              Contact
            </Link>
          </li>
          {onHome && (
            <li>
              <Link to="/admin/login">Admin</Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}