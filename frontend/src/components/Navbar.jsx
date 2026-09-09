import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    NavLink,
} from "react-router-dom";

import Logo from "./Logo";


function Navbar() {

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
    | CLOSE MENU
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
                    aria-label="ZAN GATES Adventures home"
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
                    aria-label="Main navigation"
                >

                    <NavLink
                        to="/"
                        end
                        className={navLinkClass}
                    >

                        <span>
                            Home
                        </span>

                    </NavLink>


                    <NavLink
                        to="/tours"
                        className={navLinkClass}
                    >

                        <span>
                            Tours
                        </span>

                    </NavLink>


                    <NavLink
                        to="/about"
                        className={navLinkClass}
                    >

                        <span>
                            About Us
                        </span>

                    </NavLink>


                    <NavLink
                        to="/contact"
                        className={navLinkClass}
                    >

                        <span>
                            Contact
                        </span>

                    </NavLink>

                </nav>


                {/* =====================================================
                    RIGHT SIDE ACTIONS
                ===================================================== */}

                <div className="navbar-actions">


                    <Link
                        to="/booking"
                        className="navbar-booking-button"
                        onClick={closeMobileMenu}
                    >

                        <span>
                            Book Your Adventure
                        </span>


                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
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
                            ? "Close navigation menu"
                            : "Open navigation menu"
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


                    <nav
                        className="navbar-mobile-navigation"
                        aria-label="Mobile navigation"
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
                                Home
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
                                Tours
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
                                About Us
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
                                Contact
                            </span>

                        </NavLink>

                    </nav>


                    {/* =================================================
                        MOBILE BOOKING CTA
                    ================================================= */}

                    <Link
                        to="/booking"
                        className="navbar-mobile-booking"
                        onClick={closeMobileMenu}
                    >

                        <div>

                            <small>
                                START YOUR JOURNEY
                            </small>

                            <strong>
                                Book Your Adventure
                            </strong>

                        </div>


                        <span className="navbar-mobile-booking-arrow">

                            →

                        </span>

                    </Link>


                    {/* =================================================
                        MOBILE BRAND LINE
                    ================================================= */}

                    <div className="navbar-mobile-footer">

                        <span>
                            ZAN GATES ADVENTURES
                        </span>

                        <span>
                            ZANZIBAR · TANZANIA
                        </span>

                    </div>

                </div>

            </div>


        </header>

    );

}


export default Navbar;