import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTours } from "../services/tourService";

/* =========================================================
   SAFARI CLASSIFIER
   A tour is treated as a safari if any of these fields match
   one of the keywords below.
   ========================================================= */

const SAFARI_KEYWORDS = [
  "safari",
  "wildlife",
  "serengeti",
  "ngorongoro",
  "tarangire",
  "manyara",
  "mikumi",
  "selous",
  "nyerere",
  "ruaha",
  "arusha",
  "kilimanjaro",
  "mainland",
];

const normalizeString = (value) =>
  String(value || "").toLowerCase().trim();

const looksLikeSafari = (tour) => {
  const haystack = [
    tour?.category_name,
    tour?.category?.name,
    tour?.category?.slug,
    tour?.category,
    tour?.type,
    tour?.tour_type,
    tour?.destination_name,
    tour?.destination?.name,
    tour?.destination?.slug,
    tour?.destination,
    tour?.title,
    tour?.name,
    tour?.tour_title,
    tour?.slug,
  ]
    .filter(Boolean)
    .map((value) => normalizeString(value))
    .join(" ");

  return SAFARI_KEYWORDS.some((keyword) => haystack.includes(keyword));
};

/* =========================================================
   RESPONSE PARSER
   Walks an arbitrary API response and finds the first array
   of tour-like objects, up to 4 levels deep.
   ========================================================= */

const findTourArray = (value, depth = 0) => {
  if (depth > 4) return null;
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  // Preferred keys first — these are the common API shapes
  const preferredKeys = [
    "tours",
    "data",
    "results",
    "items",
    "records",
    "rows",
    "payload",
    "list",
  ];

  for (const key of preferredKeys) {
    if (key in value) {
      const found = findTourArray(value[key], depth + 1);
      if (found && found.length) return found;
    }
  }

  // Fallback: scan every value
  for (const v of Object.values(value)) {
    const found = findTourArray(v, depth + 1);
    if (found && found.length) return found;
  }

  return null;
};

/* =========================================================
   EXCURSION GROUPING
   ========================================================= */

const NESTED_GROUP_PREFIXES = [
  {
    key: "mnemba",
    label: "Mnemba Island",
    match: (title) =>
      normalizeString(title).startsWith("mnemba island"),
    stripPrefix: /^Mnemba Island\s+/i,
  },
];

const getTourTitle = (tour) =>
  tour?.title ||
  tour?.name ||
  tour?.tour_title ||
  "Zanzibar Adventure";

const getTourSlug = (tour) =>
  tour?.slug ||
  tour?.tour_slug ||
  tour?.url_slug ||
  (tour?.id ? String(tour.id) : "");

/**
 * Split excursions into top-level items and nested groups.
 */
const splitExcursions = (tours) => {
  const topLevel = [];
  const buckets = new Map();

  NESTED_GROUP_PREFIXES.forEach((g) => buckets.set(g.key, []));

  tours.forEach((tour) => {
    const title = getTourTitle(tour);

    const group = NESTED_GROUP_PREFIXES.find((g) =>
      g.match(title)
    );

    if (group) {
      buckets.get(group.key).push(tour);
    } else {
      topLevel.push(tour);
    }
  });

  const groups = NESTED_GROUP_PREFIXES.map((g) => ({
    key: g.key,
    label: g.label,
    stripPrefix: g.stripPrefix,
    tours: buckets.get(g.key) || [],
  })).filter((g) => g.tours.length > 0);

  return { topLevel, groups };
};

/* =========================================================
   NAVBAR
   ========================================================= */

function Navbar() {
  const { t } = useTranslation();
  const [mobileMenu, setMobileMenu] = useState(false);

  /* About dropdown */
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef(null);

  /* Excursions dropdown */
  const [excursionsOpen, setExcursionsOpen] = useState(false);
  const excursionsRef = useRef(null);

  /* Safaris dropdown */
  const [safarisOpen, setSafarisOpen] = useState(false);
  const safarisRef = useRef(null);

  /* Data (fetched once) */
  const [excursions, setExcursions] = useState([]);
  const [safaris, setSafaris] = useState([]);
  const [excursionsLoaded, setExcursionsLoaded] = useState(false);

  /* CLOSE MOBILE MENU WHEN WINDOW BECOMES DESKTOP */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
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

  /* FETCH TOURS ONCE, DERIVE EXCURSIONS + SAFARIS */
  useEffect(() => {
    let mounted = true;

    const loadTours = async () => {
      try {
        const data = await getTours();

        if (!mounted) return;

        /* ---- DEBUG (remove once confirmed) ---- */
        console.log("[Navbar] getTours() raw response:", data);

        const list = findTourArray(data) || [];

        /* ---- DEBUG (remove once confirmed) ---- */
        console.log("[Navbar] parsed tour list:", list);

        const safariList = list.filter(looksLikeSafari);
        const excursionList = list.filter(
          (tour) => !looksLikeSafari(tour)
        );

        setSafaris(safariList);
        setExcursions(excursionList);
      } catch (err) {
        console.error("[Navbar] Failed to load tours:", err);
        if (mounted) {
          setExcursions([]);
          setSafaris([]);
        }
      } finally {
        if (mounted) setExcursionsLoaded(true);
      }
    };

    loadTours();

    return () => {
      mounted = false;
    };
  }, []);

  /* CLOSE ABOUT DROPDOWN */
  useEffect(() => {
    if (!aboutOpen) return undefined;

    const handlePointerDown = (event) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setAboutOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setAboutOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aboutOpen]);

  /* CLOSE EXCURSIONS DROPDOWN */
  useEffect(() => {
    if (!excursionsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        excursionsRef.current &&
        !excursionsRef.current.contains(event.target)
      ) {
        setExcursionsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setExcursionsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [excursionsOpen]);

  /* CLOSE SAFARIS DROPDOWN */
  useEffect(() => {
    if (!safarisOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        safarisRef.current &&
        !safarisRef.current.contains(event.target)
      ) {
        setSafarisOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSafarisOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [safarisOpen]);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  const navLinkClass = ({ isActive }) => {
    return `navbar-link${isActive ? " active" : ""}`;
  };

  /* SPLIT EXCURSIONS INTO TOP-LEVEL + NESTED GROUPS */
  const { topLevel: topLevelExcursions, groups: excursionGroups } =
    splitExcursions(excursions);

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

          {/* EXCURSIONS DROPDOWN */}
          <div
            ref={excursionsRef}
            className={`navbar-dropdown navbar-dropdown--wide${
              excursionsOpen ? " is-open" : ""
            }`}
          >
            <button
              type="button"
              className="navbar-dropdown-trigger navbar-link"
              aria-haspopup="menu"
              aria-expanded={excursionsOpen}
              onClick={() => setExcursionsOpen((current) => !current)}
            >
              <span>{t("navigation.excursions", "Excursions")}</span>
              <svg
                className="navbar-dropdown-caret"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
                width="10"
                height="10"
              >
                <path
                  d="M4 6l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {excursionsOpen && (
              <div className="navbar-dropdown-menu" role="menu">
                {!excursionsLoaded && (
                  <span className="navbar-dropdown-loading">
                    {t("common.loading", "Loading…")}
                  </span>
                )}

                {excursionsLoaded && excursions.length === 0 && (
                  <span className="navbar-dropdown-loading">
                    {t("common.noResults", "No excursions available")}
                  </span>
                )}

                {/* TOP-LEVEL EXCURSIONS */}
                {topLevelExcursions.map((tour) => {
                  const slug = getTourSlug(tour);
                  const title = getTourTitle(tour);
                  if (!slug) return null;

                  return (
                    <NavLink
                      key={tour.id || slug}
                      to={`/tours/${encodeURIComponent(slug)}`}
                      className={({ isActive }) =>
                        `navbar-dropdown-item${
                          isActive ? " is-selected" : ""
                        }`
                      }
                      onClick={() => setExcursionsOpen(false)}
                      role="menuitem"
                    >
                      {title}
                    </NavLink>
                  );
                })}

                {/* NESTED EXCURSION GROUPS */}
                {excursionGroups.map((group) => (
                  <div
                    key={group.key}
                    className="navbar-dropdown-group"
                    role="group"
                    aria-label={group.label}
                  >
                    <span
                      className="navbar-dropdown-group-label"
                      tabIndex={0}
                    >
                      <span>{group.label}</span>
                      <span
                        className="navbar-dropdown-group-arrow"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </span>

                    <div className="navbar-dropdown-submenu" role="menu">
                      {group.tours.map((tour) => {
                        const slug = getTourSlug(tour);
                        if (!slug) return null;

                        const fullTitle = getTourTitle(tour);
                        const childTitle = group.stripPrefix
                          ? fullTitle.replace(
                              group.stripPrefix,
                              ""
                            )
                          : fullTitle;

                        return (
                          <NavLink
                            key={tour.id || slug}
                            to={`/tours/${encodeURIComponent(slug)}`}
                            className={({ isActive }) =>
                              `navbar-dropdown-item${
                                isActive ? " is-selected" : ""
                              }`
                            }
                            onClick={() => setExcursionsOpen(false)}
                            role="menuitem"
                          >
                            {childTitle}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <NavLink
                  to="/tours"
                  className="navbar-dropdown-item navbar-dropdown-item--all"
                  onClick={() => setExcursionsOpen(false)}
                  role="menuitem"
                >
                  {t("actions.viewAllExcursions", "View all excursions")}
                  <span aria-hidden="true">→</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* SAFARIS DROPDOWN */}
          <div
            ref={safarisRef}
            className={`navbar-dropdown navbar-dropdown--wide${
              safarisOpen ? " is-open" : ""
            }`}
          >
            <button
              type="button"
              className="navbar-dropdown-trigger navbar-link"
              aria-haspopup="menu"
              aria-expanded={safarisOpen}
              onClick={() => setSafarisOpen((current) => !current)}
            >
              <span>{t("navigation.safaris", "Safaris")}</span>
              <svg
                className="navbar-dropdown-caret"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
                width="10"
                height="10"
              >
                <path
                  d="M4 6l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {safarisOpen && (
              <div className="navbar-dropdown-menu" role="menu">
                {!excursionsLoaded && (
                  <span className="navbar-dropdown-loading">
                    {t("common.loading", "Loading…")}
                  </span>
                )}

                {excursionsLoaded && safaris.length === 0 && (
                  <span className="navbar-dropdown-loading">
                    {t("common.noResults", "No safaris available")}
                  </span>
                )}

                {safaris.map((tour) => {
                  const slug = getTourSlug(tour);
                  const title = getTourTitle(tour);
                  if (!slug) return null;

                  return (
                    <NavLink
                      key={tour.id || slug}
                      to={`/tours/${encodeURIComponent(slug)}`}
                      className={({ isActive }) =>
                        `navbar-dropdown-item${
                          isActive ? " is-selected" : ""
                        }`
                      }
                      onClick={() => setSafarisOpen(false)}
                      role="menuitem"
                    >
                      {title}
                    </NavLink>
                  );
                })}

                <NavLink
                  to="/safaris"
                  className="navbar-dropdown-item navbar-dropdown-item--all"
                  onClick={() => setSafarisOpen(false)}
                  role="menuitem"
                >
                  {t("actions.viewAllSafaris", "View all safaris")}
                  <span aria-hidden="true">→</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* DESTINATIONS */}
          <NavLink to="/destinations" className={navLinkClass}>
            <span>{t("navigation.destinations", "Destinations")}</span>
          </NavLink>

          {/* HOTELS */}
          <NavLink to="/hotels" className={navLinkClass}>
            <span>{t("navigation.hotels", "Hotels")}</span>
          </NavLink>

          {/* WEDDING & PROPOSALS */}
          <NavLink to="/wedding-and-proposals" className={navLinkClass}>
            <span>
              {t("navigation.weddingAndProposals", "Wedding & Proposals")}
            </span>
          </NavLink>

          {/* TRANSFERS LINK */}
          <NavLink to="/transfers" className={navLinkClass}>
            <span>{t("navigation.transfers", "Transfers")}</span>
          </NavLink>

          {/* ABOUT DROPDOWN */}
          <div
            ref={aboutRef}
            className={`navbar-dropdown${aboutOpen ? " is-open" : ""}`}
          >
            <button
              type="button"
              className="navbar-dropdown-trigger navbar-link"
              aria-haspopup="menu"
              aria-expanded={aboutOpen}
              onClick={() => setAboutOpen((current) => !current)}
            >
              <span>{t("navigation.about")}</span>
              <svg
                className="navbar-dropdown-caret"
                viewBox="0 0 16 16"
                aria-hidden="true"
                focusable="false"
                width="10"
                height="10"
              >
                <path
                  d="M4 6l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {aboutOpen && (
              <div className="navbar-dropdown-menu" role="menu">
                <NavLink
                  to="/about"
                  end
                  className={({ isActive }) =>
                    `navbar-dropdown-item${isActive ? " is-selected" : ""}`
                  }
                  onClick={() => setAboutOpen(false)}
                  role="menuitem"
                >
                  {t("navigation.aboutUs", "About Us")}
                </NavLink>

                <NavLink
                  to="/about-zanzibar"
                  className={({ isActive }) =>
                    `navbar-dropdown-item${isActive ? " is-selected" : ""}`
                  }
                  onClick={() => setAboutOpen(false)}
                  role="menuitem"
                >
                  {t("navigation.aboutZanzibar", "About Zanzibar")}
                </NavLink>
              </div>
            )}
          </div>

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

        {/* MOBILE MENU TOGGLE */}
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

      {/* MOBILE NAVIGATION */}
      <div
        id="mobile-navigation"
        className={`navbar-mobile${mobileMenu ? " is-open" : ""}`}
      >
        <div className="navbar-mobile-inner">
          <nav
            className="navbar-mobile-navigation"
            aria-label={t("accessibility.mobileNavigation")}
          >
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              <span>{t("navigation.home")}</span>
            </NavLink>

            {/* MOBILE EXCURSIONS ACCORDION */}
            <details className="navbar-mobile-details">
              <summary className="navbar-link">
                {t("navigation.excursions", "Excursions")}
              </summary>

              <div className="navbar-mobile-submenu">
                {!excursionsLoaded && (
                  <span className="navbar-dropdown-loading">
                    {t("common.loading", "Loading…")}
                  </span>
                )}
                {excursionsLoaded && excursions.length === 0 && (
                  <span className="navbar-dropdown-loading">
                    {t("common.noResults", "No excursions available")}
                  </span>
                )}

                {excursions.map((tour) => {
                  const slug = getTourSlug(tour);
                  const title = getTourTitle(tour);
                  if (!slug) return null;

                  return (
                    <NavLink
                      key={tour.id || slug}
                      to={`/tours/${encodeURIComponent(slug)}`}
                      className={navLinkClass}
                      onClick={closeMobileMenu}
                    >
                      {title}
                    </NavLink>
                  );
                })}

                <NavLink
                  to="/tours"
                  className={navLinkClass}
                  onClick={closeMobileMenu}
                >
                  {t("actions.viewAllExcursions", "View all excursions")}
                </NavLink>
              </div>
            </details>

            {/* MOBILE SAFARIS ACCORDION */}
            <details className="navbar-mobile-details">
              <summary className="navbar-link">
                {t("navigation.safaris", "Safaris")}
              </summary>

              <div className="navbar-mobile-submenu">
                {!excursionsLoaded && (
                  <span className="navbar-dropdown-loading">
                    {t("common.loading", "Loading…")}
                  </span>
                )}
                {excursionsLoaded && safaris.length === 0 && (
                  <span className="navbar-dropdown-loading">
                    {t("common.noResults", "No safaris available")}
                  </span>
                )}

                {safaris.map((tour) => {
                  const slug = getTourSlug(tour);
                  const title = getTourTitle(tour);
                  if (!slug) return null;

                  return (
                    <NavLink
                      key={tour.id || slug}
                      to={`/tours/${encodeURIComponent(slug)}`}
                      className={navLinkClass}
                      onClick={closeMobileMenu}
                    >
                      {title}
                    </NavLink>
                  );
                })}

                <NavLink
                  to="/safaris"
                  className={navLinkClass}
                  onClick={closeMobileMenu}
                >
                  {t("actions.viewAllSafaris", "View all safaris")}
                </NavLink>
              </div>
            </details>

            {/* MOBILE DESTINATIONS */}
            <NavLink
              to="/destinations"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              <span>{t("navigation.destinations", "Destinations")}</span>
            </NavLink>

            {/* MOBILE HOTELS */}
            <NavLink
              to="/hotels"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              <span>{t("navigation.hotels", "Hotels")}</span>
            </NavLink>

            {/* MOBILE WEDDING & PROPOSALS */}
            <NavLink
              to="/wedding-and-proposals"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              <span>
                {t("navigation.weddingAndProposals", "Wedding & Proposals")}
              </span>
            </NavLink>

            {/* MOBILE TRANSFERS LINK */}
            <NavLink
              to="/transfers"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              <span>{t("navigation.transfers", "Transfers")}</span>
            </NavLink>

            {/* MOBILE ABOUT ACCORDION */}
            <details className="navbar-mobile-details">
              <summary className="navbar-link">
                {t("navigation.about")}
              </summary>

              <div className="navbar-mobile-submenu">
                <NavLink
                  to="/about"
                  end
                  className={navLinkClass}
                  onClick={closeMobileMenu}
                >
                  {t("navigation.aboutUs", "About Us")}
                </NavLink>

                <NavLink
                  to="/about-zanzibar"
                  className={navLinkClass}
                  onClick={closeMobileMenu}
                >
                  {t("navigation.aboutZanzibar", "About Zanzibar")}
                </NavLink>
              </div>
            </details>

            <NavLink
              to="/contact"
              className={navLinkClass}
              onClick={closeMobileMenu}
            >
              <span>{t("navigation.contact")}</span>
            </NavLink>
          </nav>

          <div className="navbar-mobile-language">
            <LanguageSwitcher variant="mobile" />
          </div>

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