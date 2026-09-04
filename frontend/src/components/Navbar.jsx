import { useState } from "react";

function Navbar() {
    const [mobileMenu, setMobileMenu] = useState(false);

    return (
        <header className="navbar">
            <div className="container navbar-inner">

                {/* Logo */}
                <a href="/" className="brand">
                    <div className="brand-mark">
                        ZG
                    </div>

                    <div className="brand-text">
                        <span>ZAN GATES</span>
                        <small>ADVENTURES</small>
                    </div>
                </a>

                {/* Desktop Navigation */}
                <nav className={`nav-links ${mobileMenu ? "open" : ""}`}>

                    <a href="/" onClick={() => setMobileMenu(false)}>
                        Home
                    </a>

                    <a href="#tours" onClick={() => setMobileMenu(false)}>
                        Tours
                    </a>

                    <a href="#experiences" onClick={() => setMobileMenu(false)}>
                        Experiences
                    </a>

                    <a href="#destinations" onClick={() => setMobileMenu(false)}>
                        Destinations
                    </a>

                    <a href="#about" onClick={() => setMobileMenu(false)}>
                        About Us
                    </a>

                    <a href="#contact" onClick={() => setMobileMenu(false)}>
                        Contact
                    </a>

                    <a
                        href="#tours"
                        className="nav-cta"
                        onClick={() => setMobileMenu(false)}
                    >
                        Explore Tours
                    </a>

                </nav>

                {/* Mobile button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenu(!mobileMenu)}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </div>
        </header>
    );
}

export default Navbar;