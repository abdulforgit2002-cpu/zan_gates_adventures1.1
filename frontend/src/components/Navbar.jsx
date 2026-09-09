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


    const closeMobileMenu = () => {

        setMobileMenu(false);

    };


    const navLinkClass = ({
        isActive,
    }) => {

        return `navbar-link${
            isActive
                ? " active"
                : ""
        }`;

    };


    return (

        <header className="navbar">

            <div className="navbar-container">


                {/* =====================================================
                    LOGO
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
                        Home
                    </NavLink>


                    <NavLink
                        to="/tours"
                        className={navLinkClass}
                    >
                        Tours
                    </NavLink>


                    <NavLink
                        to="/about"
                        className={navLinkClass}
                    >
                        About Us
                    </NavLink>


                    <NavLink
                        to="/contact"
                        className={navLinkClass}
                    >
                        Contact
                    </NavLink>

                </nav>


                {/* =====================================================
                    BOOKING BUTTON
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
                    MOBILE BUTTON
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
                        Home
                    </NavLink>


                    <NavLink
                        to="/tours"
                        className={navLinkClass}
                        onClick={closeMobileMenu}
                    >
                        Tours
                    </NavLink>


                    <NavLink
                        to="/about"
                        className={navLinkClass}
                        onClick={closeMobileMenu}
                    >
                        About Us
                    </NavLink>


                    <NavLink
                        to="/contact"
                        className={navLinkClass}
                        onClick={closeMobileMenu}
                    >
                        Contact
                    </NavLink>


                    <Link
                        to="/booking"
                        className="navbar-mobile-booking"
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

                </nav>

            </div>

        </header>

    );

}


export default Navbar;