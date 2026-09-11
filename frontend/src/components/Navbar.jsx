import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    NavLink,
} from "react-router-dom";

import {
    useTranslation,
} from "react-i18next";

import Logo from "./Logo";


const LANGUAGE_OPTIONS = [
    {
        code: "en",
        label: "English",
    },
    {
        code: "de",
        label: "Deutsch",
    },
    {
        code: "it",
        label: "Italiano",
    },
    {
        code: "fr",
        label: "Français",
    },
    {
        code: "pl",
        label: "Polski",
    },
];


function LanguageSelector({
    compact = false,
}) {

    const {
        t,
        i18n,
    } = useTranslation();

    const currentLanguage =
        i18n.language || "en";

    const handleLanguageChange = (
        event
    ) => {

        const nextLanguage =
            event.target.value;

        if (
            nextLanguage &&
            nextLanguage !==
                currentLanguage
        ) {
            i18n.changeLanguage(
                nextLanguage
            );
        }

    };

    return (

        <div
            className={
                compact
                    ? "navbar-language navbar-language-compact"
                    : "navbar-language"
            }
        >

            <label
                htmlFor={
                    compact
                        ? "mobile-language-select"
                        : "desktop-language-select"
                }
                className="navbar-language-label"
            >
                {t("language.select")}
            </label>

            <select
                id={
                    compact
                        ? "mobile-language-select"
                        : "desktop-language-select"
                }
                className="navbar-language-select"
                value={currentLanguage}
                onChange={handleLanguageChange}
                aria-label={t(
                    "accessibility.selectLanguage"
                )}
            >

                {LANGUAGE_OPTIONS.map(
                    (option) => (

                        <option
                            key={option.code}
                            value={option.code}
                        >
                            {option.label}
                        </option>

                    )
                )}

            </select>

        </div>

    );

}


function Navbar() {

    const {
        t,
    } = useTranslation();


    const [
        mobileMenu,
        setMobileMenu,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | CLOSE MOBILE MENU WHEN WINDOW BECOMES DESKTOP
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const handleResize = () => {

            if (window.innerWidth > 900) {

                setMobileMenu(false);

            }

        };


        window.addEventListener(
            "resize",
            handleResize
        );


        return () => {

            window.removeEventListener(
                "resize",
                handleResize
            );

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | PREVENT BODY SCROLL WHEN MOBILE MENU IS OPEN
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (mobileMenu) {

            document.body.classList.add(
                "navbar-menu-open"
            );

        } else {

            document.body.classList.remove(
                "navbar-menu-open"
            );

        }


        return () => {

            document.body.classList.remove(
                "navbar-menu-open"
            );

        };

    }, [mobileMenu]);


    /*
    |--------------------------------------------------------------------------
    | CLOSE MOBILE MENU
    |--------------------------------------------------------------------------
    */

    const closeMobileMenu = () => {

        setMobileMenu(false);

    };


    /*
    |--------------------------------------------------------------------------
    | NAVIGATION LINK CLASS
    |--------------------------------------------------------------------------
    */

    const navLinkClass = ({
        isActive,
    }) => {

        return `navbar-link${
            isActive
                ? " active"
                : ""
        }`;

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <header className="navbar">


            {/* =========================================================
                NAVBAR CONTAINER
            ========================================================= */}

            <div className="navbar-container">


                {/* =====================================================
                    BRAND / LOGO
                ===================================================== */}

                <Link
                    to="/"
                    className="navbar-brand"
                    aria-label={t(
                        "accessibility.logoLink"
                    )}
                    onClick={closeMobileMenu}
                >

                    <Logo
                        variant="navbar"
                    />


                    <span className="navbar-brand-text">

                        <strong>
                            ZAN GATES
                        </strong>

                        <small>
                            ADVENTURES
                        </small>

                    </span>

                </Link>


                {/* =====================================================
                    DESKTOP NAVIGATION
                ===================================================== */}

                <nav
                    className="navbar-navigation"
                    aria-label={t(
                        "accessibility.mainNavigation"
                    )}
                >

                    <NavLink
                        to="/"
                        end
                        className={navLinkClass}
                    >

                        <span>
                            {t("navigation.home")}
                        </span>

                    </NavLink>


                    <NavLink
                        to="/tours"
                        className={navLinkClass}
                    >

                        <span>
                            {t("navigation.tours")}
                        </span>

                    </NavLink>


                    <NavLink
                        to="/about"
                        className={navLinkClass}
                    >

                        <span>
                            {t("navigation.about")}
                        </span>

                    </NavLink>


                    <NavLink
                        to="/contact"
                        className={navLinkClass}
                    >

                        <span>
                            {t("navigation.contact")}
                        </span>

                    </NavLink>

                </nav>


                {/* =====================================================
                    RIGHT SIDE ACTIONS
                ===================================================== */}

                <div className="navbar-actions">

                    <LanguageSelector />


                    <Link
                        to="/tours"
                        className="navbar-booking-button"
                        onClick={closeMobileMenu}
                    >

                        <span>
                            {t(
                                "actions.bookAdventure"
                            )}
                        </span>


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


                {/* =====================================================
                    MOBILE MENU BUTTON
                ===================================================== */}

                <button
                    type="button"
                    className={`navbar-menu-toggle${
                        mobileMenu
                            ? " is-open"
                            : ""
                    }`}
                    onClick={() =>
                        setMobileMenu(
                            (current) =>
                                !current
                        )
                    }
                    aria-label={
                        mobileMenu
                            ? t(
                                "accessibility.closeMenu"
                            )
                            : t(
                                "accessibility.openMenu"
                            )
                    }
                    aria-expanded={
                        mobileMenu
                    }
                    aria-controls="mobile-navigation"
                >

                    <span />
                    <span />
                    <span />

                </button>

            </div>


            {/* =========================================================
                MOBILE NAVIGATION
            ========================================================= */}

            <div
                id="mobile-navigation"
                className={`navbar-mobile${
                    mobileMenu
                        ? " is-open"
                        : ""
                }`}
            >

                <div className="navbar-mobile-inner">


                    {/* =================================================
                        MOBILE NAVIGATION LINKS
                    ================================================= */}

                    <nav
                        className="navbar-mobile-navigation"
                        aria-label={t(
                            "accessibility.mobileNavigation"
                        )}
                    >

                        <NavLink
                            to="/"
                            end
                            className={navLinkClass}
                            onClick={closeMobileMenu}
                        >

                            <span className="mobile-nav-number">
                                01
                            </span>

                            <span>
                                {t("navigation.home")}
                            </span>

                        </NavLink>


                        <NavLink
                            to="/tours"
                            className={navLinkClass}
                            onClick={closeMobileMenu}
                        >

                            <span className="mobile-nav-number">
                                02
                            </span>

                            <span>
                                {t("navigation.tours")}
                            </span>

                        </NavLink>


                        <NavLink
                            to="/about"
                            className={navLinkClass}
                            onClick={closeMobileMenu}
                        >

                            <span className="mobile-nav-number">
                                03
                            </span>

                            <span>
                                {t("navigation.about")}
                            </span>

                        </NavLink>


                        <NavLink
                            to="/contact"
                            className={navLinkClass}
                            onClick={closeMobileMenu}
                        >

                            <span className="mobile-nav-number">
                                04
                            </span>

                            <span>
                                {t("navigation.contact")}
                            </span>

                        </NavLink>

                    </nav>


                    {/* =================================================
                        MOBILE LANGUAGE SELECTOR
                    ================================================= */}

                    <LanguageSelector
                        compact
                    />


                    {/* =================================================
                        MOBILE BOOKING CTA
                    ================================================= */}

                    <Link
                        to="/tours"
                        className="navbar-mobile-booking"
                        onClick={closeMobileMenu}
                    >

                        <div>

                            <small>
                                {t(
                                    "actions.startJourney"
                                )}
                            </small>

                            <strong>
                                {t(
                                    "actions.bookAdventure"
                                )}
                            </strong>

                        </div>


                        <span
                            className="navbar-mobile-booking-arrow"
                            aria-hidden="true"
                        >
                            →
                        </span>

                    </Link>


                    {/* =================================================
                        MOBILE BRAND LINE
                    ================================================= */}

                    <div className="navbar-mobile-footer">

                        <span>
                            {t("brand.name")}
                        </span>

                        <span>
                            {t("brand.location")}
                        </span>

                    </div>

                </div>

            </div>


        </header>

    );

}


export default Navbar;