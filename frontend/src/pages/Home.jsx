import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTours } from "../services/tourService";
import TourCard from "../components/TourCard";

/*
|--------------------------------------------------------------------------
| ZAN GATES HOME HERO
|--------------------------------------------------------------------------
|
| Each image represents a different Zanzibar experience.
|
*/

const HOME_HERO_SLIDES = [
    {
        id: 1,
        experience: "Safari Blue",
        eyebrow: "OCEAN ADVENTURES",
        title: "Sail into Zanzibar's turquoise paradise.",
        description:
            "Discover sandbanks, crystal-clear waters, marine life and unforgettable dhow adventures.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
    {
        id: 2,
        experience: "Jozani Forest",
        eyebrow: "WILDLIFE & NATURE",
        title: "Discover the wild heart of Zanzibar.",
        description:
            "Explore lush tropical forest and encounter the unique wildlife of Zanzibar.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779459607/Jozani_Forest_Tour9_dz9pcv.jpg",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
    {
        id: 3,
        experience: "Zanzibar Adventures",
        eyebrow: "ISLAND DISCOVERY",
        title: "Your gateway to unforgettable Zanzibar adventures.",
        description:
            "Experience the ocean, nature, culture and unforgettable destinations of Zanzibar.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
];

/*
|--------------------------------------------------------------------------
| HOME PAGE
|--------------------------------------------------------------------------
*/

function Home() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeHeroImage, setActiveHeroImage] = useState(0);
    const [heroVisible, setHeroVisible] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | LOAD TOURS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let mounted = true;

        const loadTours = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getTours();

                if (!mounted) {
                    return;
                }

                const loadedTours = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

                setTours(loadedTours);
            } catch (err) {
                console.error("Failed to load tours:", err);

                if (mounted) {
                    setError(
                        err?.message ||
                            "Unable to load Zanzibar experiences."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadTours();

        return () => {
            mounted = false;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | HERO INTRO ANIMATION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const revealTimer = window.setTimeout(() => {
            setHeroVisible(true);
        }, 120);

        return () => {
            window.clearTimeout(revealTimer);
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | PRELOAD ALL HERO IMAGES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        HOME_HERO_SLIDES.forEach((slide) => {
            const image = new Image();
            image.src = slide.image;
        });
    }, []);

    /*
    |--------------------------------------------------------------------------
    | HERO SLIDESHOW
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const currentSlide =
            HOME_HERO_SLIDES[activeHeroImage];

        if (!currentSlide) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setActiveHeroImage((previous) => {
                return (
                    (previous + 1) %
                    HOME_HERO_SLIDES.length
                );
            });
        }, currentSlide.duration);

        return () => {
            window.clearTimeout(timer);
        };
    }, [activeHeroImage]);

    /*
    |--------------------------------------------------------------------------
    | CURRENT HERO SLIDE
    |--------------------------------------------------------------------------
    */

    const currentHeroSlide =
        HOME_HERO_SLIDES[activeHeroImage] ||
        HOME_HERO_SLIDES[0];

    /*
    |--------------------------------------------------------------------------
    | CHANGE HERO
    |--------------------------------------------------------------------------
    */

    const handleHeroChange = (index) => {
        if (index === activeHeroImage) {
            return;
        }

        setActiveHeroImage(index);
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <main className="home-page">

            {/* =========================================================
                HERO
            ========================================================= */}

            <section
                className="home-hero"
                aria-label="ZAN GATES Adventures"
            >

                {/* Background images */}

                <div
                    className="home-hero-background"
                    aria-hidden="true"
                >
                    {HOME_HERO_SLIDES.map(
                        (slide, index) => (
                            <img
                                key={slide.id}
                                src={slide.image}
                                alt=""
                                className={`
                                    home-hero-image
                                    ${
                                        index ===
                                        activeHeroImage
                                            ? "active"
                                            : ""
                                    }
                                    home-hero-motion-${slide.motion}
                                `}
                                style={{
                                    objectPosition:
                                        slide.position,
                                }}
                                loading="eager"
                                fetchPriority={
                                    index === 0
                                        ? "high"
                                        : "auto"
                                }
                                decoding="async"
                                draggable="false"
                            />
                        )
                    )}
                </div>

                {/* Cinematic overlay */}

                <div
                    className="home-hero-overlay"
                    aria-hidden="true"
                />

                <div
                    className="home-hero-vignette"
                    aria-hidden="true"
                />

                {/* Hero content */}

                <div
                    className={
                        heroVisible
                            ? "home-hero-content visible"
                            : "home-hero-content"
                    }
                >
                    <div
                        key={currentHeroSlide.id}
                        className="home-hero-copy"
                    >

                        <span className="home-hero-eyebrow">
                            <span />

                            {currentHeroSlide.eyebrow}
                        </span>

                        <h1>
                            <span>
                                Discover
                            </span>

                            <strong>
                                Zanzibar.
                            </strong>
                        </h1>

                        <p className="home-hero-title">
                            {currentHeroSlide.title}
                        </p>

                        <p className="home-hero-description">
                            {currentHeroSlide.description}
                        </p>

                        <div className="home-hero-actions">

                            <a
                                href="#tours"
                                className="home-primary-button"
                            >
                                <span>
                                    Explore Experiences
                                </span>

                                <strong>
                                    →
                                </strong>
                            </a>

                            <a
                                href="#about"
                                className="home-secondary-button"
                            >
                                Discover ZAN GATES
                            </a>

                        </div>

                    </div>
                </div>

                {/* Slide navigation */}

                <div
                    className="home-hero-navigation"
                    aria-label="Hero image navigation"
                >
                    {HOME_HERO_SLIDES.map(
                        (slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                className={
                                    index ===
                                    activeHeroImage
                                        ? "active"
                                        : ""
                                }
                                aria-label={`View ${slide.experience}`}
                                aria-current={
                                    index ===
                                    activeHeroImage
                                        ? "true"
                                        : undefined
                                }
                                onClick={() =>
                                    handleHeroChange(index)
                                }
                            >
                                <span />
                            </button>
                        )
                    )}
                </div>

            </section>

            {/* =========================================================
                INTRO
            ========================================================= */}

            <section className="home-intro">
                <div className="home-intro-inner">

                    <div className="home-intro-label">
                        <span />

                        <p>
                            THE ZAN GATES EXPERIENCE
                        </p>
                    </div>

                    <div className="home-intro-content">

                        <h2>
                            Zanzibar is more than
                            a destination.

                            <span>
                                {" "}
                                It is an experience.
                            </span>
                        </h2>

                        <p>
                            We create unforgettable
                            journeys across the island,
                            connecting travelers with
                            the ocean, nature, culture
                            and the authentic beauty
                            of Zanzibar.
                        </p>

                    </div>

                </div>
            </section>

            {/* =========================================================
                TOURS
            ========================================================= */}

            <section
                id="tours"
                className="home-tours-section"
            >

                <div className="home-section-heading">

                    <div>

                        <span className="home-section-eyebrow">
                            OUR EXPERIENCES
                        </span>

                        <h2>
                            Adventures worth
                            remembering.
                        </h2>

                    </div>

                    <p>
                        Explore our hand-selected
                        Zanzibar experiences and
                        find the adventure that
                        speaks to you.
                    </p>

                </div>

                {/* Loading */}

                {loading && (
                    <div className="home-tour-loading">

                        <div className="home-loading-spinner" />

                        <p>
                            Discovering Zanzibar
                            experiences...
                        </p>

                    </div>
                )}

                {/* Error */}

                {!loading && error && (
                    <div className="home-tour-message">

                        <div className="home-message-icon">
                            !
                        </div>

                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* Tours */}

                {!loading &&
                    !error &&
                    tours.length > 0 && (
                        <div className="home-tours-grid">

                            {tours.map((tour) => (
                                <TourCard
                                    key={tour.id}
                                    tour={tour}
                                />
                            ))}

                        </div>
                    )}

                {/* Empty state */}

                {!loading &&
                    !error &&
                    tours.length === 0 && (
                        <div className="home-tour-message">

                            <div className="home-message-icon">
                                +
                            </div>

                            <h3>
                                New adventures are coming
                            </h3>

                            <p>
                                We are preparing exciting
                                Zanzibar experiences for you.
                            </p>

                        </div>
                    )}

            </section>

            {/* =========================================================
                WHY ZAN GATES
            ========================================================= */}

            <section
                id="about"
                className="home-about-section"
            >

                <div className="home-about-visual">

                    <div className="home-about-image" />

                    <div className="home-about-stat">

                        <strong>
                            ZG
                        </strong>

                        <span>
                            Zanzibar
                            <br />
                            Adventures
                        </span>

                    </div>

                </div>

                <div className="home-about-content">

                    <span className="home-section-eyebrow">
                        WHY ZAN GATES
                    </span>

                    <h2>
                        See Zanzibar
                        <br />

                        <span>
                            through a different lens.
                        </span>
                    </h2>

                    <p>
                        We believe the best journeys
                        are not simply about visiting
                        beautiful places. They are about
                        the stories, people, landscapes
                        and moments that stay with you.
                    </p>

                    <div className="home-about-features">

                        <div className="home-about-feature">

                            <span>
                                01
                            </span>

                            <div>

                                <strong>
                                    Authentic Experiences
                                </strong>

                                <p>
                                    Discover the real
                                    character of Zanzibar.
                                </p>

                            </div>

                        </div>

                        <div className="home-about-feature">

                            <span>
                                02
                            </span>

                            <div>

                                <strong>
                                    Island Adventures
                                </strong>

                                <p>
                                    From turquoise waters
                                    to unforgettable
                                    excursions.
                                </p>

                            </div>

                        </div>

                        <div className="home-about-feature">

                            <span>
                                03
                            </span>

                            <div>

                                <strong>
                                    Memorable Journeys
                                </strong>

                                <p>
                                    Experiences designed
                                    around you.
                                </p>

                            </div>

                        </div>

                    </div>

                    <Link
                        to="/about"
                        className="home-about-button"
                    >
                        Discover ZAN GATES

                        <span>
                            →
                        </span>
                    </Link>

                </div>

            </section>

            {/* =========================================================
                FINAL CTA
            ========================================================= */}

            <section className="home-cta">

                <div className="home-cta-overlay" />

                <div className="home-cta-content">

                    <span className="home-section-eyebrow">
                        YOUR ZANZIBAR STORY STARTS HERE
                    </span>

                    <h2>
                        Ready to discover
                        <br />
                        Zanzibar?
                    </h2>

                    <p>
                        Choose your experience and
                        let the island do the rest.
                    </p>

                    <a
                        href="#tours"
                        className="home-cta-button"
                    >
                        Explore Our Tours

                        <span>
                            →
                        </span>
                    </a>

                </div>

            </section>

        </main>
    );
}

export default Home;