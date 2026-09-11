import {
    useEffect,
    useRef,
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
        flag: "🇬🇧",
    },
    {
        code: "de",
        label: "Deutsch",
        flag: "🇩🇪",
    },
    {
        code: "it",
        label: "Italiano",
        flag: "🇮🇹",
    },
    {
        code: "fr",
        label: "Français",
        flag: "🇫🇷",
    },
    {
        code: "pl",
        label: "Polski",
        flag: "🇵🇱",
    },
];


function LanguageSelector({
    compact = false,
}) {

    const {
        t,
        i18n,
    } = useTranslation();

    const containerRef =
        useRef(null);

    const [open, setOpen] =
        useState(false);

    const currentLanguage =
        i18n.language || "en";

    const currentOption =
        LANGUAGE_OPTIONS.find(
            (option) =>
                option.code ===
                currentLanguage
        ) || LANGUAGE_OPTIONS[0];

    const handleLanguageChange = (
        nextLanguage
    ) => {

        if (
            nextLanguage &&
            nextLanguage !==
                currentLanguage
        ) {
            i18n.changeLanguage(
                nextLanguage
            );
        }

        setOpen(false);

    };

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target
                )
            ) {
                setOpen(false);
            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);

    return (

        <div
            ref={containerRef}
            className={
                compact
                    ? "navbar-language navbar-language-compact"
                    : "navbar-language"
            }
        >

            <button
                type="button"
                className="navbar-language-trigger"
                onClick={() =>
                    setOpen(
                        (current) =>
                            !current
                    )
                }
                aria-expanded={open}
                aria-label={t(
                    "accessibility.selectLanguage"
                )}
            >

                <span
                    className="navbar-language-icon"
                    aria-hidden="true"
                >
                    {currentOption.flag}
                </span>

                <span className="navbar-language-value">
                    {currentOption.label}
                </span>

                <span
                    className="navbar-language-caret"
                    aria-hidden="true"
                >
                    ▾
                </span>

            </button>

            {open && (
                <div className="navbar-language-menu" role="listbox" aria-label={t("accessibility.selectLanguage")}>
                    {LANGUAGE_OPTIONS.map(
                        (option) => (
                            <button
                                key={option.code}
                                type="button"
                                className={
                                    option.code ===
                                    currentLanguage
                                        ? "navbar-language-option is-selected"
                                        : "navbar-language-option"
                                }
                                onClick={() =>
                                    handleLanguageChange(
                                        option.code
                                    )
                                }
                                role="option"
                                aria-selected={
                                    option.code ===
                                    currentLanguage
                                }
                            >
                                <span className="navbar-language-option-flag" aria-hidden="true">
                                    {option.flag}
                                </span>

                                <span className="navbar-language-option-label">
                                    {option.label}
                                </span>

                                {option.code === currentLanguage && (
                                    <span className="navbar-language-check" aria-hidden="true">
                                        ✓
                                    </span>
                                )}
                            </button>
                        )
                    )}
                </div>
            )}

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