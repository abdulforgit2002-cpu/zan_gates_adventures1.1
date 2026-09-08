import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    getTours,
} from "../services/tourService";

import TailwindHero from "../components/TailwindHero";
import TailwindTourCard from "../components/TailwindTourCard";


/*
|--------------------------------------------------------------------------
| ZAN GATES HOME HERO
|--------------------------------------------------------------------------
|
| Each image represents a different Zanzibar experience.
            <TailwindHero slides={HOME_HERO_SLIDES} active={activeHeroImage} onChange={handleHeroChange} />
            

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


                
                {!loading &&
                    !error &&
                    tours.length > 0 && (
    /*
    |--------------------------------------------------------------------------
    | PRELOAD ALL HERO IMAGES
    |--------------------------------------------------------------------------
    |
    | Hero images should already be available before they become active.
    |
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


                    <div className="home-tours-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    |--------------------------------------------------------------------------
    | HERO SLIDESHOW
                                <TailwindTourCard
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


    return (

        <main className="home-page">


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
                                    ${index === activeHeroImage
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
                                        : "eager"
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

                            {
                                currentHeroSlide.eyebrow
                            }

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

                            {
                                currentHeroSlide.title
                            }

                        </p>


                        <p className="home-hero-description">

                            {
                                currentHeroSlide.description
                            }

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

                                Discover Zan Gates

                            </a>


                        </div>


                    </div>

                </div>


                {/* -----------------------------------------------------
                    SLIDE NAVIGATION
                    -----------------------------------------------------
                    The experience label, slide counter and scroll
                    indicator have intentionally been removed.
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
                            THE ZAN GATES EXPERIENCE
                        </p>

                    </div>


                    <div className="home-intro-content">

                        <h2>

                            Zanzibar is more than
                            a destination.

                            <span>
                                {" "}It is an experience.
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


                {loading && (

                    <div className="home-tour-loading">

                        <div className="home-loading-spinner" />

                        <p>
                            Discovering Zanzibar
                            experiences...
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
                        to="/"
                        className="home-about-button"
                    >

                        Discover Zan Gates

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

};


export default Home;