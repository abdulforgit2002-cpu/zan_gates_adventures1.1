import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    useTranslation,
} from "react-i18next";

import {
    getTours,
} from "../services/tourService";

import TourCard from "../components/TourCard";


/*
|--------------------------------------------------------------------------
| ZAN GATES HOME HERO
|--------------------------------------------------------------------------
|
| Each image represents a different Zanzibar experience.
|
| duration = how long the slide remains visible.
|
*/

const HOME_HERO_SLIDES = [

    {
        id: 1,

        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779540443/aaa_faq_ixagv2.webp",

        eyebrow:
            "DISCOVER ZANZIBAR",

        title:
            "Where every journey becomes a story.",

        experience:
            "The Spirit of Zanzibar",

        description:
            "Experience the island through unforgettable places, people, culture and adventure.",

        duration:
            7000,

        position:
            "center center",

        motion:
            "zoom-in",
    },


    {
        id: 2,

        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779537151/Prison_Island_wa08hw.jpg",

        eyebrow:
            "PRISON ISLAND",

        title:
            "History, turquoise waters and unforgettable encounters.",

        experience:
            "Prison Island Adventure",

        description:
            "Discover a legendary island surrounded by the crystal waters of the Indian Ocean.",

        duration:
            8000,

        position:
            "center 45%",

        motion:
            "pan-left",
    },


    {
        id: 3,

        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779537152/Prison_Island2_nbupim.avif",

        eyebrow:
            "OCEAN ADVENTURES",

        title:
            "Dive into the beauty of Zanzibar.",

        experience:
            "Island & Ocean Escape",

        description:
            "Explore the breathtaking waters, hidden beauty and unforgettable marine experiences of Zanzibar.",

        duration:
            7000,

        position:
            "center center",

        motion:
            "zoom-out",
    },


    {
        id: 4,

        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779459606/Jozani_Forest_Tour8_c21zcx.jpg",

        eyebrow:
            "JOZANI FOREST",

        title:
            "Discover Zanzibar's wild side.",

        experience:
            "Jozani Forest Experience",

        description:
            "Walk beneath ancient trees and discover the natural world that makes Zanzibar unique.",

        duration:
            9000,

        position:
            "center 35%",

        motion:
            "pan-right",
    },


    {
        id: 5,

        image:
            "https://res.cloudinary.com/djczmay2i/image/upload/v1779286801/nungwi_car4_zqc7ba.avif",

        eyebrow:
            "NUNGWI",

        title:
            "Where the island meets the Indian Ocean.",

        experience:
            "Nungwi Escape",

        description:
            "Experience the beauty of Zanzibar's northern coast, turquoise waters and unforgettable sunsets.",

        duration:
            8000,

        position:
            "center center",

        motion:
            "zoom-in",
    },

];


const Home = () => {

    const {
        t,
    } = useTranslation();

    /*
    |--------------------------------------------------------------------------
    | TOURS STATE
    |--------------------------------------------------------------------------
    */

    const [
        tours,
        setTours,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | HERO STATE
    |--------------------------------------------------------------------------
    */

    const [
        activeHeroImage,
        setActiveHeroImage,
    ] = useState(0);


    const [
        heroVisible,
        setHeroVisible,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | LOAD TOURS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const loadTours = async () => {

            try {

                setLoading(true);

                setError("");


                const tourData =
                    await getTours();


                setTours(
                    Array.isArray(
                        tourData
                    )
                        ? tourData
                        : []
                );


            } catch (error) {

                console.error(
                    "Failed to load tours:",
                    error
                );


                setTours([]);


                setError(
                    "Unable to load our experiences right now."
                );


            } finally {

                setLoading(false);

            }

        };


        loadTours();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | HERO INTRO ANIMATION
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const revealTimer =
            window.setTimeout(
                () => {

                    setHeroVisible(
                        true
                    );

                },
                120
            );


        return () => {

            window.clearTimeout(
                revealTimer
            );

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | PRELOAD ALL HERO IMAGES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        HOME_HERO_SLIDES.forEach(
            (slide) => {

                const image =
                    new Image();

                image.src =
                    slide.image;

            }
        );

    }, []);


    /*
    |--------------------------------------------------------------------------
    | HERO SLIDESHOW
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const currentSlide =
            HOME_HERO_SLIDES[
                activeHeroImage
            ];


        if (!currentSlide) {

            return undefined;

        }


        const timer =
            window.setTimeout(
                () => {

                    setActiveHeroImage(
                        (previous) =>
                            (
                                previous + 1
                            ) %
                            HOME_HERO_SLIDES.length
                    );

                },
                currentSlide.duration
            );


        return () => {

            window.clearTimeout(
                timer
            );

        };

    }, [
        activeHeroImage,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CURRENT HERO SLIDE
    |--------------------------------------------------------------------------
    */

    const currentHeroSlide =
        HOME_HERO_SLIDES[
            activeHeroImage
        ];


    /*
    |--------------------------------------------------------------------------
    | CHANGE HERO
    |--------------------------------------------------------------------------
    */

    const handleHeroChange =
        (index) => {

            if (
                index ===
                activeHeroImage
            ) {

                return;

            }


            setActiveHeroImage(
                index
            );

        };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <main
            id="home"
            className="home-page"
        >


            {/* =========================================================
                HERO
            ========================================================= */}

            <section
                className="home-hero"
                aria-label="Zan Gates Adventures"
            >


                {/* -----------------------------------------------------
                    BACKGROUND IMAGES
                ----------------------------------------------------- */}

                <div
                    className="home-hero-background"
                    aria-hidden="true"
                >

                    {HOME_HERO_SLIDES.map(
                        (
                            slide,
                            index
                        ) => (

                            <img
                                key={
                                    slide.id
                                }

                                src={
                                    slide.image
                                }

                                alt=""

                                className={`
                                    home-hero-image
                                    ${
                                        index === activeHeroImage
                                            ? "active"
                                            : ""
                                    }
                                    home-hero-motion-${slide.motion}
                                `}

                                style={{
                                    objectPosition:
                                        slide.position,
                                }}

                                loading={
                                    index === 0
                                        ? "eager"
                                        : "lazy"
                                }

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


                {/* -----------------------------------------------------
                    CINEMATIC OVERLAY
                ----------------------------------------------------- */}

                <div
                    className="home-hero-overlay"
                    aria-hidden="true"
                />


                <div
                    className="home-hero-vignette"
                    aria-hidden="true"
                />


                {/* -----------------------------------------------------
                    HERO CONTENT
                ----------------------------------------------------- */}

                <div
                    className={
                        heroVisible
                            ? "home-hero-content visible"
                            : "home-hero-content"
                    }
                >


                    <div
                        key={
                            currentHeroSlide.id
                        }

                        className="home-hero-copy"
                    >


                        <span className="home-hero-eyebrow">

                            <span />

                            {t("home.hero.eyebrow")}

                        </span>


                        <h1>

                            <span>
                                {t("home.hero.prefix")}
                            </span>

                            <strong>
                                {t("home.hero.highlight")}
                            </strong>

                        </h1>


                        <p className="home-hero-title">

                            {t("home.hero.title")}

                        </p>


                        <p className="home-hero-description">

                            {t("home.hero.description")}

                        </p>


                        <div className="home-hero-actions">


                            <Link
                                to="/tours"
                                className="home-primary-button"
                            >

                                <span>
                                    {t("home.hero.primaryCta")}
                                </span>

                                <strong>
                                    →
                                </strong>

                            </Link>


                            <Link
                                to="/about"
                                className="home-secondary-button"
                            >

                                {t("home.hero.secondaryCta")}

                            </Link>


                        </div>


                    </div>

                </div>


                {/* -----------------------------------------------------
                    SLIDE NAVIGATION
                ----------------------------------------------------- */}

                <div
                    className="home-hero-navigation"
                    aria-label="Hero image navigation"
                >

                    {HOME_HERO_SLIDES.map(
                        (
                            slide,
                            index
                        ) => (

                            <button
                                key={
                                    slide.id
                                }

                                type="button"

                                className={
                                    index ===
                                    activeHeroImage
                                        ? "active"
                                        : ""
                                }

                                aria-label={
                                    `View ${
                                        slide.experience
                                    }`
                                }

                                aria-current={
                                    index ===
                                    activeHeroImage
                                        ? "true"
                                        : undefined
                                }

                                onClick={() =>
                                    handleHeroChange(
                                        index
                                    )
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
                            {t("home.experience.eyebrow")}
                        </p>

                    </div>


                    <div className="home-intro-content">

                        <h2>

                            {t("home.experience.title")}

                        </h2>


                        <p>

                            {t("home.experience.description")}

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
                            {t("home.experiences.eyebrow")}
                        </span>

                        <h2>
                            {t("home.experiences.title")}
                        </h2>

                    </div>


                    <p>

                        {t("home.experiences.description")}

                    </p>

                </div>


                {loading && (

                    <div className="home-tour-loading">

                        <div className="home-loading-spinner" />

                        <p>
                            {t("home.experiences.loading")}
                        </p>

                    </div>

                )}


                {!loading &&
                    error && (

                    <div className="home-tour-message">

                        <div className="home-message-icon">
                            !
                        </div>

                        <h3>
                            {t("home.experiences.errorTitle")}
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
                            {t("home.experiences.retry")}
                        </button>

                    </div>

                )}


                {!loading &&
                    !error &&
                    tours.length > 0 && (

                    <div className="home-tours-grid">

                        {tours.map(
                            (tour) => (

                                <TourCard
                                    key={
                                        tour.id
                                    }

                                    tour={
                                        tour
                                    }
                                />

                            )
                        )}

                    </div>

                )}


                {!loading &&
                    !error &&
                    tours.length === 0 && (

                    <div className="home-tour-message">

                        <div className="home-message-icon">
                            +
                        </div>

                        <h3>
                            {t("home.experiences.emptyTitle")}
                        </h3>

                        <p>
                            {t("home.experiences.emptyDescription")}
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
                        {t("home.whyUs.eyebrow")}
                    </span>


                    <h2>

                        {t("home.whyUs.title")}

                    </h2>


                    <p>

                        {t("home.whyUs.description")}

                    </p>


                    <div className="home-about-features">


                        <div className="home-about-feature">

                            <span>
                                01
                            </span>

                            <div>

                                <strong>
                                    {t("home.whyUs.localKnowledge")}
                                </strong>

                                <p>
                                    {t("home.whyUs.localKnowledgeDescription")}
                                </p>

                            </div>

                        </div>


                        <div className="home-about-feature">

                            <span>
                                02
                            </span>

                            <div>

                                <strong>
                                    {t("home.whyUs.personalService")}
                                </strong>

                                <p>
                                    {t("home.whyUs.personalServiceDescription")}
                                </p>

                            </div>

                        </div>


                        <div className="home-about-feature">

                            <span>
                                03
                            </span>

                            <div>

                                <strong>
                                    {t("home.whyUs.flexiblePlanning")}
                                </strong>

                                <p>
                                    {t("home.whyUs.flexiblePlanningDescription")}
                                </p>

                            </div>

                        </div>


                    </div>


                    <Link
                        to="/tours"
                        className="home-about-button"
                    >

                        {t("actions.discoverOurExperiences")}

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
                        {t("home.finalCta.eyebrow")}
                    </span>


                    <h2>

                        {t("home.finalCta.title")}

                    </h2>


                    <p>

                        {t("home.finalCta.description")}

                    </p>


                    <Link
                        to="/tours"
                        className="home-cta-button"
                    >

                        {t("home.finalCta.button")}

                        <span>
                            →
                        </span>

                    </Link>

                </div>

            </section>


        </main>

    );

};


export default Home;