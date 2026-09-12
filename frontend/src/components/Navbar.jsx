import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  const [mobileMenu, setMobileMenu] = useState(false);

  /* CLOSE MOBILE MENU WHEN WINDOW BECOMES DESKTOP */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenu(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* PREVENT BODY SCROLL WHEN MOBILE MENU IS OPEN */
  useEffect(() => {
    if (mobileMenu) {
      document.body.classList.add("navbar-menu-open");
    } else {
      document.body.classList.remove("navbar-menu-open");
    }
    return () => document.body.classList.remove("navbar-menu-open");
  }, [mobileMenu]);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  const navLinkClass = ({ isActive }) => {
    return `navbar-link${isActive ? " active" : ""}`;
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* BRAND / LOGO */}
        <Link
          to="/"
          className="navbar-brand"
          aria-label={t("accessibility.logoLink")}
          onClick={closeMobileMenu}
        >
          <Logo variant="navbar" />
          <span className="navbar-brand-text">
            <strong>ZANZIBAR GATES</strong>
            <small>Tours & Safaris</small>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="navbar-navigation"
          aria-label={t("accessibility.mainNavigation")}
        >
          <NavLink to="/" end className={navLinkClass}>
            <span>{t("navigation.home")}</span>
          </NavLink>

          <NavLink to="/tours" className={navLinkClass}>
            <span>{t("navigation.tours")}</span>
          </NavLink>

          <NavLink to="/about" className={navLinkClass}>
            <span>{t("navigation.about")}</span>
          </NavLink>

          <NavLink to="/contact" className={navLinkClass}>
            <span>{t("navigation.contact")}</span>
          </NavLink>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="navbar-actions">
          <div className="desktop-language-switcher">
            <LanguageSwitcher variant="navbar" />
          </div>

          <Link
            to="/tours"
            className="navbar-booking-button"
            onClick={closeMobileMenu}
          >
            <span>{t("actions.bookAdventure")}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 6L19 12L13 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          type="button"
          className={`navbar-menu-toggle${mobileMenu ? " is-open" : ""}`}
          onClick={() => setMobileMenu((current) => !current)}
          aria-label={
            mobileMenu
              ? t("accessibility.closeMenu")
              : t("accessibility.openMenu")
          }
          aria-expanded={mobileMenu}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* MOBILE NAVIGATION DROPDOWN */}
      <div
        id="mobile-navigation"
        className={`navbar-mobile${mobileMenu ? " is-open" : ""}`}
      >
        <div className="navbar-mobile-inner">
          <nav
            className="navbar-mobile-navigation"
            aria-label={t("accessibility.mobileNavigation")}
          >
            <NavLink to="/" end className={navLinkClass} onClick={closeMobileMenu}>
              <span>{t("navigation.home")}</span>
            </NavLink>

            <NavLink to="/tours" className={navLinkClass} onClick={closeMobileMenu}>
              <span>{t("navigation.tours")}</span>
            </NavLink>

            <NavLink to="/about" className={navLinkClass} onClick={closeMobileMenu}>
              <span>{t("navigation.about")}</span>
            </NavLink>

            <NavLink to="/contact" className={navLinkClass} onClick={closeMobileMenu}>
              <span>{t("navigation.contact")}</span>
            </NavLink>
          </nav>

          {/* MOBILE LANGUAGE SELECTOR — uses the mobile variant */}
          <div className="navbar-mobile-language">
            <LanguageSwitcher variant="mobile" />
          </div>

          {/* MOBILE BOOKING CTA */}
          <Link
            to="/tours"
            className="navbar-mobile-booking"
            onClick={closeMobileMenu}
          >
            <div className="booking-text-container">
              <small className="booking-subtitle">
                {t("actions.startJourney")}
              </small>
              <strong className="booking-title">
                {t("actions.bookAdventure")}
              </strong>
            </div>

            <span className="navbar-mobile-booking-arrow" aria-hidden="true">
              →
            </span>
          </Link>

          {/* MOBILE BRAND FOOTER */}
          <div className="navbar-mobile-footer">
            <span>{t("brand.name")}</span>
            <span>{t("brand.location")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;