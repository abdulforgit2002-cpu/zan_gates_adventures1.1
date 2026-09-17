import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTours } from "../services/tourService";
import TourCard from "../components/TourCard";

/*
|--------------------------------------------------------------------------
| HERO SLIDES
|--------------------------------------------------------------------------
*/

const HOME_HERO_SLIDES = [
    {
        id: 1,
        experience: "Safari Blue",
        eyebrow: "OCEAN ADVENTURES",
        title: "Sail through Zanzibar's turquoise waters.",
        description:
            "Cruise across crystal-clear waters, discover beautiful sandbanks and enjoy an unforgettable day on Zanzibar's ocean.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779540443/aaa_faq_ixagv2.webp",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
    {
        id: 2,
        experience: "Jozani Forest",
        eyebrow: "WILDLIFE & NATURE",
        title: "Walk into the wild heart of Zanzibar.",
        description:
            "Explore the lush Jozani Forest, discover its unique ecosystem and encounter the famous red colobus monkeys of Zanzibar.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779459606/Jozani_Forest_Tour8_c21zcx.jpg",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
    {
        id: 3,
        experience: "Prison Island",
        eyebrow: "HISTORY & DISCOVERY",
        title: "Step into Zanzibar's fascinating history.",
        description:
            "Journey across the Indian Ocean to Prison Island and discover its historic heritage, beautiful beaches and giant Aldabra tortoises.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779537151/Prison_Island_wa08hw.jpg",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
    {
        id: 4,
        experience: "Prison Island Escape",
        eyebrow: "ISLAND EXPERIENCES",
        title: "Discover an island where history meets paradise.",
        description:
            "Escape to the beautiful waters of Prison Island and experience a perfect blend of tropical scenery, culture, history and adventure.",
        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779537152/Prison_Island2_nbupim.avif",
        position: "center",
        motion: "zoom",
        duration: 6000,
    },
];

/*
|--------------------------------------------------------------------------
| SAFARI CLASSIFIER — matches Navbar so Home agrees with the navigation
|--------------------------------------------------------------------------
*/

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
        tour?.category,
        tour?.type,
        tour?.tour_type,
        tour?.destination_name,
        tour?.destination?.name,
        tour?.destination,
    ]
        .filter(Boolean)
        .map((value) => normalizeString(value))
        .join(" ");

    return SAFARI_KEYWORDS.some((keyword) =>
        haystack.includes(keyword)
    );
};

/*
|--------------------------------------------------------------------------
| ROUTES — kept in one place so Home matches the Navbar
|--------------------------------------------------------------------------
*/

const SAFARIS_LISTING_ROUTE = "/safaris";
const EXCURSIONS_LISTING_ROUTE = "/tours";

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

    /* ------------------------------------------------------------------
       LOAD TOURS
       ------------------------------------------------------------------ */

    useEffect(() => {
        let mounted = true;

        const loadTours = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getTours();
                if (!mounted) return;

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
                if (mounted) setLoading(false);
            }
        };

        loadTours();

        return () => {
            mounted = false;
        };
    }, []);

    /* ------------------------------------------------------------------
       HERO INTRO ANIMATION
       ------------------------------------------------------------------ */

    useEffect(() => {
        const revealTimer = window.setTimeout(() => {
            setHeroVisible(true);
        }, 120);
        return () => window.clearTimeout(revealTimer);
    }, []);

    /* ------------------------------------------------------------------
       PRELOAD HERO IMAGES
       ------------------------------------------------------------------ */

    useEffect(() => {
        HOME_HERO_SLIDES.forEach((slide) => {
            const image = new Image();
            image.src = slide.image;
        });
    }, []);

    /* ------------------------------------------------------------------
       HERO SLIDESHOW
       ------------------------------------------------------------------ */

    useEffect(() => {
        const currentSlide = HOME_HERO_SLIDES[activeHeroImage];
        if (!currentSlide) return undefined;

        const timer = window.setTimeout(() => {
            setActiveHeroImage(
                (previous) =>
                    (previous + 1) % HOME_HERO_SLIDES.length
            );
        }, currentSlide.duration);

        return () => window.clearTimeout(timer);
    }, [activeHeroImage]);

    const currentHeroSlide =
        HOME_HERO_SLIDES[activeHeroImage] || HOME_HERO_SLIDES[0];

    /* ------------------------------------------------------------------
       SPLIT TOURS — 2 SAFARIS + 2 EXCURSIONS
       ------------------------------------------------------------------ */

    const safariTours = tours
        .filter(looksLikeSafari)
        .slice(0, 2);

    const excursionTours = tours
        .filter((tour) => !looksLikeSafari(tour))
        .slice(0, 2);

    return (
        <main className="home-page">

            {/* HERO */}
            <section className="home-hero" aria-label="ZAN GATES Adventures">
                <div className="home-hero-background" aria-hidden="true">
                    {HOME_HERO_SLIDES.map((slide, index) => (
                        <img
                            key={slide.id}
                            src={slide.image}
                            alt=""
                            className={`
                                home-hero-image
                                ${index === activeHeroImage ? "active" : ""}
                                home-hero-motion-${slide.motion}
                            `}
                            style={{ objectPosition: slide.position }}
                            loading="eager"
                            fetchPriority={index === 0 ? "high" : "auto"}
                            decoding="async"
                            draggable="false"
                        />
                    ))}
                </div>

                <div className="home-hero-overlay" aria-hidden="true" />
                <div className="home-hero-vignette" aria-hidden="true" />

                <div
                    className={
                        heroVisible
                            ? "home-hero-content visible"
                            : "home-hero-content"
                    }
                >
                    <div key={currentHeroSlide.id} className="home-hero-copy">
                        <span className="home-hero-eyebrow">
                            <span />
                            {currentHeroSlide.eyebrow}
                        </span>

                        <h1>
                            <span>Discover</span>
                            <strong>Zanzibar.</strong>
                        </h1>

                        <p className="home-hero-title">
                            {currentHeroSlide.title}
                        </p>

                        <p className="home-hero-description">
                            {currentHeroSlide.description}
                        </p>

                        <div className="home-hero-actions">
                            <a href="#tours" className="home-primary-button">
                                <span>Explore Experiences</span>
                                <strong>→</strong>
                            </a>
                            <a href="#about" className="home-secondary-button">
                                Discover ZAN GATES
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTRO */}
            <section className="home-intro">
                <div className="home-intro-inner">
                    <div className="home-intro-label">
                        <span />
                        <p>THE ZAN GATES EXPERIENCE</p>
                    </div>
                    <div className="home-intro-content">
                        <h2>
                            Zanzibar is more than a destination.
                            <span> It is an experience.</span>
                        </h2>
                        <p>
                            We create unforgettable journeys across the
                            island, connecting travelers with the ocean,
                            nature, culture and the authentic beauty of
                            Zanzibar.
                        </p>
                    </div>
                </div>
            </section>

            {/* TOURS */}
            <section id="tours" className="home-tours-section">
                <div className="home-section-heading">
                    <div>
                        <span className="home-section-eyebrow">
                            OUR EXPERIENCES
                        </span>
                        <h2>Adventures worth remembering.</h2>
                    </div>
                    <p>
                        A curated preview of what awaits — browse our
                        safaris and excursions below, then dive deeper
                        into either collection.
                    </p>
                </div>

                {loading && (
                    <div className="home-tour-loading">
                        <div className="home-loading-spinner" />
                        <p>Discovering Zanzibar experiences...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="home-tour-message">
                        <div className="home-message-icon">!</div>
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && tours.length === 0 && (
                    <div className="home-tour-message">
                        <div className="home-message-icon">+</div>
                        <h3>New adventures are coming</h3>
                        <p>
                            We are preparing exciting Zanzibar
                            experiences for you.
                        </p>
                    </div>
                )}

                {/* SAFARIS BLOCK */}
                {!loading && !error && safariTours.length > 0 && (
                    <div className="home-collection">
                        <header className="home-collection-heading">
                            <div>
                                <span className="home-section-eyebrow">
                                    SAFARIS
                                </span>
                                <h3>
                                    Into the wild heart of Tanzania.
                                </h3>
                            </div>

                            <Link
                                to={SAFARIS_LISTING_ROUTE}
                                className="home-collection-link"
                            >
                                View all safaris
                                <span>→</span>
                            </Link>
                        </header>

                        <div className="home-tours-grid">
                            {safariTours.map((tour) => (
                                <TourCard key={tour.id} tour={tour} />
                            ))}
                        </div>
                    </div>
                )}

                {/* EXCURSIONS BLOCK */}
                {!loading && !error && excursionTours.length > 0 && (
                    <div className="home-collection">
                        <header className="home-collection-heading">
                            <div>
                                <span className="home-section-eyebrow">
                                    ZANZIBAR EXCURSIONS
                                </span>
                                <h3>Ocean, nature & island culture.</h3>
                            </div>

                            <Link
                                to={EXCURSIONS_LISTING_ROUTE}
                                className="home-collection-link"
                            >
                                View all excursions
                                <span>→</span>
                            </Link>
                        </header>

                        <div className="home-tours-grid">
                            {excursionTours.map((tour) => (
                                <TourCard key={tour.id} tour={tour} />
                            ))}
                        </div>
                    </div>
                )}

                {/* SPLIT CTA — same destinations as the navbar */}
                {!loading && !error && tours.length > 0 && (
                    <div className="home-collections-footer">
                        <Link
                            to={SAFARIS_LISTING_ROUTE}
                            className="home-collection-cta"
                        >
                            <span className="home-collection-cta-eyebrow">
                                SAFARIS
                            </span>
                            <strong>
                                Explore Tanzania's wild heart
                            </strong>
                            <span className="home-collection-cta-arrow">
                                →
                            </span>
                        </Link>

                        <Link
                            to={EXCURSIONS_LISTING_ROUTE}
                            className="home-collection-cta home-collection-cta--alt"
                        >
                            <span className="home-collection-cta-eyebrow">
                                ZANZIBAR EXCURSIONS
                            </span>
                            <strong>
                                Discover the island's experiences
                            </strong>
                            <span className="home-collection-cta-arrow">
                                →
                            </span>
                        </Link>
                    </div>
                )}
            </section>

            {/* WHY ZAN GATES */}
            <section id="about" className="home-about-section">
                <div className="home-about-visual">
                    <div className="home-about-image" />
                    <div className="home-about-stat">
                        <strong>ZG</strong>
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
                        <span>through a different lens.</span>
                    </h2>
                    <p>
                        We believe the best journeys are not simply about
                        visiting beautiful places. They are about the
                        stories, people, landscapes and moments that
                        stay with you.
                    </p>

                    <div className="home-about-features">
                        <div className="home-about-feature">
                            <span>01</span>
                            <div>
                                <strong>Authentic Experiences</strong>
                                <p>
                                    Discover the real character of
                                    Zanzibar.
                                </p>
                            </div>
                        </div>

                        <div className="home-about-feature">
                            <span>02</span>
                            <div>
                                <strong>Island Adventures</strong>
                                <p>
                                    From turquoise waters to
                                    unforgettable excursions.
                                </p>
                            </div>
                        </div>

                        <div className="home-about-feature">
                            <span>03</span>
                            <div>
                                <strong>Memorable Journeys</strong>
                                <p>Experiences designed around you.</p>
                            </div>
                        </div>
                    </div>

                    <Link to="/about" className="home-about-button">
                        Discover ZAN GATES
                        <span>→</span>
                    </Link>
                </div>
            </section>

            {/* FINAL CTA */}
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
                        Choose your experience and let the island do
                        the rest.
                    </p>
                    <Link to={EXCURSIONS_LISTING_ROUTE} className="home-cta-button">
                        Explore Our Tours
                        <span>→</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Home;