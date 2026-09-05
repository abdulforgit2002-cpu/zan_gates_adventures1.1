import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getTourBySlug,
    getTourPrices,
    getTourImages,
} from "../services/tourService";

const TourDetails = () => {
    const { slug } = useParams();

    const [tour, setTour] = useState(null);
    const [prices, setPrices] = useState([]);
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * ============================================================
     * GALLERY / LIGHTBOX STATE
     * ============================================================
     */

    const [selectedImageIndex, setSelectedImageIndex] =
        useState(null);


    /*
     * ============================================================
     * LOAD TOUR
     * ============================================================
     *
     * URL example:
     *
     * /tours/safari-blue-zanzibar
     *
     * API:
     *
     * GET /api/tours/slug/safari-blue-zanzibar
     *
     * Then:
     *
     * GET /api/tours/{id}/prices
     *
     * GET /api/tours/{id}/images
     */

    useEffect(() => {

        const loadTour = async () => {

            try {

                setLoading(true);
                setError("");

                /*
                 * Make sure a slug exists.
                 */

                if (!slug) {

                    throw new Error(
                        "No tour was specified."
                    );

                }


                /*
                 * Retrieve the tour directly by slug.
                 */

                const tourData =
                    await getTourBySlug(slug);


                if (!tourData) {

                    throw new Error(
                        "The requested tour could not be found."
                    );

                }


                /*
                 * Retrieve pricing options.
                 */

                const priceData =
                    await getTourPrices(
                        tourData.id
                    );


                /*
                 * Retrieve tour images.
                 */

                const imageData =
                    await getTourImages(
                        tourData.id
                    );


                /*
                 * Save data into React state.
                 */

                setTour(tourData);
                setPrices(priceData);
                setImages(imageData);

            } catch (error) {

                console.error(
                    "Failed to load tour:",
                    error
                );

                setTour(null);
                setPrices([]);
                setImages([]);

                setError(
                    error.message ||
                    "Unable to load this tour. Please try again."
                );

            } finally {

                setLoading(false);

            }

        };


        loadTour();

    }, [slug]);


    /*
     * ============================================================
     * LIGHTBOX FUNCTIONS
     * ============================================================
     */


    /*
     * Open selected image.
     */

    const openLightbox = (index) => {

        setSelectedImageIndex(index);

    };


    /*
     * Close lightbox.
     */

    const closeLightbox = () => {

        setSelectedImageIndex(null);

    };


    /*
     * Show previous image.
     */

    const showPreviousImage = () => {

        if (
            selectedImageIndex === null ||
            images.length === 0
        ) {
            return;
        }


        setSelectedImageIndex(
            (selectedImageIndex - 1 + images.length) %
            images.length
        );

    };


    /*
     * Show next image.
     */

    const showNextImage = () => {

        if (
            selectedImageIndex === null ||
            images.length === 0
        ) {
            return;
        }


        setSelectedImageIndex(
            (selectedImageIndex + 1) %
            images.length
        );

    };


    /*
     * ============================================================
     * KEYBOARD NAVIGATION
     * ============================================================
     *
     * ESC   → close
     * ←     → previous
     * →     → next
     */

    useEffect(() => {

        const handleKeyDown = (event) => {

            if (selectedImageIndex === null) {
                return;
            }


            if (event.key === "Escape") {

                closeLightbox();

            }


            if (event.key === "ArrowLeft") {

                showPreviousImage();

            }


            if (event.key === "ArrowRight") {

                showNextImage();

            }

        };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [
        selectedImageIndex,
        images.length
    ]);


    /*
     * ============================================================
     * PREVENT BODY SCROLL WHEN LIGHTBOX IS OPEN
     * ============================================================
     */

    useEffect(() => {

        if (selectedImageIndex !== null) {

            document.body.style.overflow = "hidden";

        } else {

            document.body.style.overflow = "";

        }


        return () => {

            document.body.style.overflow = "";

        };

    }, [selectedImageIndex]);


    /*
     * ============================================================
     * LOADING STATE
     * ============================================================
     */

    if (loading) {

        return (

            <main className="tour-details-page">

                <section className="tour-details-loading">

                    <div className="tour-details-loading-inner">

                        <div className="loading-spinner"></div>

                        <p>
                            Preparing your Zanzibar experience...
                        </p>

                    </div>

                </section>

            </main>

        );

    }


    /*
     * ============================================================
     * ERROR STATE
     * ============================================================
     */

    if (error) {

        return (

            <main className="tour-details-page">

                <section className="tour-details-error">

                    <div className="tour-details-error-inner">

                        <span>
                            TOUR UNAVAILABLE
                        </span>

                        <h1>
                            We couldn't find this experience
                        </h1>

                        <p>
                            {error}
                        </p>

                        <Link
                            to="/"
                            className="primary-button"
                        >
                            Back to Tours
                        </Link>

                    </div>

                </section>

            </main>

        );

    }


    /*
     * ============================================================
     * SAFETY CHECK
     * ============================================================
     */

    if (!tour) {

        return null;

    }


    /*
     * ============================================================
     * PRICE CALCULATIONS
     * ============================================================
     */

    const numericPrices = prices
        .map((price) => Number(price.price))
        .filter(
            (price) => !Number.isNaN(price)
        );


    /*
     * Find the lowest available price.
     */

    const lowestPrice =
        numericPrices.length > 0
            ? Math.min(...numericPrices)
            : null;


    /*
     * Determine currency.
     */

    const currency =
        prices.length > 0 &&
        prices[0].currency
            ? prices[0].currency
            : "USD";


    /*
     * Display USD using "$".
     *
     * Other currencies use the currency code.
     */

    const currencySymbol =
        currency === "USD"
            ? "$"
            : currency;


    /*
     * ============================================================
     * SELECTED LIGHTBOX IMAGE
     * ============================================================
     */

    const selectedImage =
        selectedImageIndex !== null
            ? images[selectedImageIndex]
            : null;


    return (

        <main className="tour-details-page">


            {/* ==================================================
                TOUR HERO
            ================================================== */}

            <section className="tour-details-hero">

                <div className="tour-details-hero-overlay"></div>

                <div className="tour-details-container">


                    {/* ==============================
                        BREADCRUMB
                    ============================== */}

                    <div className="tour-details-breadcrumb">

                        <Link to="/">
                            Home
                        </Link>

                        <span>
                            /
                        </span>

                        <span>
                            Tours
                        </span>

                        <span>
                            /
                        </span>

                        <span>
                            {tour.title}
                        </span>

                    </div>


                    {/* ==============================
                        HERO CONTENT
                    ============================== */}

                    <div className="tour-details-hero-content">

                        <div className="tour-details-category">

                            {tour.category_name ||
                                "Zanzibar Experience"}

                        </div>


                        <h1>
                            {tour.title}
                        </h1>


                        <p>
                            {tour.short_description ||
                                "Discover an unforgettable Zanzibar experience."}
                        </p>


                        {/* ==============================
                            QUICK INFORMATION
                        ============================== */}

                        <div className="tour-details-quick-info">


                            {/* DESTINATION */}

                            <div>

                                <span>
                                    DESTINATION
                                </span>

                                <strong>
                                    {tour.destination_name ||
                                        "Zanzibar"}
                                </strong>

                            </div>


                            {/* DURATION */}

                            <div>

                                <span>
                                    DURATION
                                </span>

                                <strong>
                                    {tour.duration ||
                                        "Flexible"}
                                </strong>

                            </div>


                            {/* LOWEST PRICE */}

                            {lowestPrice !== null && (

                                <div>

                                    <span>
                                        FROM
                                    </span>

                                    <strong>

                                        {currencySymbol}

                                        {lowestPrice.toLocaleString(
                                            "en-US",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}

                                    </strong>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================================
                TOUR GALLERY
            ================================================== */}

            {images.length > 0 && (

                <section className="tour-details-gallery">

                    <div className="tour-details-container">


                        {/* ==============================
                            GALLERY HEADER
                        ============================== */}

                        <div className="tour-gallery-header">

                            <span className="tour-section-label">
                                EXPERIENCE GALLERY
                            </span>

                            <h2>
                                Explore {tour.title}
                            </h2>

                            <p>
                                Discover the places, scenery and
                                experiences that make this journey
                                special.
                            </p>

                        </div>


                        {/* ==============================
                            GALLERY GRID
                        ============================== */}

                        <div className="tour-gallery-grid">

                            {images.map(
                                (image, index) => (

                                    <button
                                        type="button"
                                        key={image.id}
                                        className={
                                            image.is_primary
                                                ? "tour-gallery-item tour-gallery-primary"
                                                : "tour-gallery-item"
                                        }
                                        onClick={() =>
                                            openLightbox(index)
                                        }
                                        aria-label={`View image ${index + 1} of ${images.length}`}
                                    >

                                        <img
                                            src={image.image_url}
                                            alt={
                                                image.alt_text ||
                                                `${tour.title} experience in ${
                                                    tour.destination_name ||
                                                    "Zanzibar"
                                                }`
                                            }
                                            loading={
                                                image.is_primary
                                                    ? "eager"
                                                    : "lazy"
                                            }
                                        />


                                        {/* IMAGE OVERLAY */}

                                        <span className="tour-gallery-overlay">

                                            <span>
                                                View Image
                                            </span>

                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>

                </section>

            )}


            {/* ==================================================
                TOUR CONTENT
            ================================================== */}

            <section className="tour-details-content">

                <div className="tour-details-container">

                    <div className="tour-details-layout">


                        {/* ==================================================
                            MAIN CONTENT
                        ================================================== */}

                        <div className="tour-details-main">


                            {/* ==================================================
                                THE EXPERIENCE
                            ================================================== */}

                            <div className="tour-details-section">

                                <span className="tour-section-label">
                                    THE EXPERIENCE
                                </span>


                                <h2>
                                    Discover {tour.title}
                                </h2>


                                <p>
                                    {tour.description ||
                                        "Experience the beauty, culture and unforgettable moments of Zanzibar."}
                                </p>

                            </div>


                            {/* ==================================================
                                EXPERIENCE HIGHLIGHTS
                            ================================================== */}

                            <div className="tour-details-section">

                                <span className="tour-section-label">
                                    EXPERIENCE HIGHLIGHTS
                                </span>


                                <h2>
                                    What You'll Experience
                                </h2>


                                <div className="tour-highlights">


                                    {/* HIGHLIGHT 01 */}

                                    <div className="tour-highlight">

                                        <div className="tour-highlight-icon">
                                            01
                                        </div>


                                        <div>

                                            <h3>
                                                Authentic Zanzibar
                                            </h3>


                                            <p>
                                                Discover the island
                                                through experiences
                                                shaped by local culture,
                                                nature and traditions.
                                            </p>

                                        </div>

                                    </div>


                                    {/* HIGHLIGHT 02 */}

                                    <div className="tour-highlight">

                                        <div className="tour-highlight-icon">
                                            02
                                        </div>


                                        <div>

                                            <h3>
                                                Local Expertise
                                            </h3>


                                            <p>
                                                Travel with knowledgeable
                                                local guides who help you
                                                experience Zanzibar with
                                                confidence.
                                            </p>

                                        </div>

                                    </div>


                                    {/* HIGHLIGHT 03 */}

                                    <div className="tour-highlight">

                                        <div className="tour-highlight-icon">
                                            03
                                        </div>


                                        <div>

                                            <h3>
                                                Memorable Moments
                                            </h3>


                                            <p>
                                                Enjoy carefully planned
                                                activities designed to
                                                create unforgettable
                                                memories.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                PRICING
                            ================================================== */}

                            {prices.length > 0 && (

                                <div className="tour-details-section">

                                    <span className="tour-section-label">
                                        TOUR PRICING
                                    </span>


                                    <h2>
                                        Choose Your Group Size
                                    </h2>


                                    <div className="tour-pricing-table">

                                        {prices.map((price) => {

                                            const amount =
                                                Number(price.price);


                                            const formattedAmount =
                                                !Number.isNaN(amount)
                                                    ? amount.toLocaleString(
                                                        "en-US",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }
                                                    )
                                                    : "On Request";


                                            const groupLabel =
                                                price.max_people
                                                    ? `${price.min_people}–${price.max_people} people`
                                                    : `${price.min_people}+ people`;


                                            return (

                                                <div
                                                    className="tour-price-row"
                                                    key={price.id}
                                                >

                                                    <div>

                                                        <strong>
                                                            {groupLabel}
                                                        </strong>


                                                        <span>

                                                            {price.pricing_type ===
                                                            "PER_PERSON"
                                                                ? "Price per person"
                                                                : "Group price"}

                                                        </span>

                                                    </div>


                                                    <strong>

                                                        {currencySymbol}

                                                        {formattedAmount}

                                                    </strong>

                                                </div>

                                            );

                                        })}

                                    </div>

                                </div>

                            )}


                            {/* ==================================================
                                IMPORTANT INFORMATION
                            ================================================== */}

                            <div className="tour-details-section">

                                <span className="tour-section-label">
                                    PLAN WITH CONFIDENCE
                                </span>


                                <h2>
                                    Your Zanzibar Adventure
                                </h2>


                                <div className="tour-info-grid">


                                    {/* LOCAL SUPPORT */}

                                    <div className="tour-info-card">

                                        <strong>
                                            Local Support
                                        </strong>


                                        <p>
                                            Our team is available to
                                            help you plan and coordinate
                                            your experience.
                                        </p>

                                    </div>


                                    {/* FLEXIBLE ENQUIRIES */}

                                    <div className="tour-info-card">

                                        <strong>
                                            Flexible Enquiries
                                        </strong>


                                        <p>
                                            Tell us your preferred date,
                                            group size and requirements.
                                        </p>

                                    </div>


                                    {/* EXPERIENCED GUIDES */}

                                    <div className="tour-info-card">

                                        <strong>
                                            Experienced Guides
                                        </strong>


                                        <p>
                                            Enjoy your experience with
                                            knowledgeable local support.
                                        </p>

                                    </div>


                                    {/* PERSONAL SERVICE */}

                                    <div className="tour-info-card">

                                        <strong>
                                            Personal Service
                                        </strong>


                                        <p>
                                            We focus on creating a smooth
                                            and memorable Zanzibar journey.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            BOOKING SIDEBAR
                        ================================================== */}

                        <aside className="tour-details-sidebar">

                            <div className="tour-booking-card">


                                <span>
                                    PLAN YOUR EXPERIENCE
                                </span>


                                <h3>
                                    Ready to explore Zanzibar?
                                </h3>


                                <p>
                                    Send us an enquiry with your
                                    preferred date and number of
                                    travellers. Our team will help
                                    arrange the experience for you.
                                </p>


                                {/* STARTING PRICE */}

                                {lowestPrice !== null && (

                                    <div className="tour-booking-price">

                                        <small>
                                            Starting from
                                        </small>


                                        <strong>

                                            {currencySymbol}

                                            {lowestPrice.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}

                                        </strong>


                                        <span>
                                            per person
                                        </span>

                                    </div>

                                )}


                                {/* BOOKING BUTTON */}

                                <Link
                                    to={`/book/${tour.slug}`}
                                    className="tour-book-button"
                                >
                                    Book / Enquire Now
                                </Link>


                                {/* BACK TO TOURS */}

                                <Link
                                    to="/"
                                    className="tour-back-link"
                                >
                                    ← Explore More Tours
                                </Link>

                            </div>

                        </aside>

                    </div>

                </div>

            </section>


            {/* ==================================================
                IMAGE LIGHTBOX
            ================================================== */}

            {selectedImage && (

                <div
                    className="tour-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Tour image viewer"
                    onClick={closeLightbox}
                >

                    {/* ==============================
                        CLOSE BUTTON
                    ============================== */}

                    <button
                        type="button"
                        className="tour-lightbox-close"
                        onClick={closeLightbox}
                        aria-label="Close image viewer"
                    >
                        ×
                    </button>


                    {/* ==============================
                        PREVIOUS BUTTON
                    ============================== */}

                    {images.length > 1 && (

                        <button
                            type="button"
                            className="tour-lightbox-prev"
                            onClick={(event) => {

                                event.stopPropagation();

                                showPreviousImage();

                            }}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>

                    )}


                    {/* ==============================
                        IMAGE
                    ============================== */}

                    <div
                        className="tour-lightbox-content"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <img
                            src={selectedImage.image_url}
                            alt={
                                selectedImage.alt_text ||
                                `${tour.title} experience in ${
                                    tour.destination_name ||
                                    "Zanzibar"
                                }`
                            }
                        />


                        {/* ==============================
                            IMAGE CAPTION
                        ============================== */}

                        {selectedImage.alt_text && (

                            <p className="tour-lightbox-caption">

                                {selectedImage.alt_text}

                            </p>

                        )}


                        {/* ==============================
                            IMAGE COUNTER
                        ============================== */}

                        <div className="tour-lightbox-counter">

                            {selectedImageIndex + 1}
                            {" / "}
                            {images.length}

                        </div>

                    </div>


                    {/* ==============================
                        NEXT BUTTON
                    ============================== */}

                    {images.length > 1 && (

                        <button
                            type="button"
                            className="tour-lightbox-next"
                            onClick={(event) => {

                                event.stopPropagation();

                                showNextImage();

                            }}
                            aria-label="Next image"
                        >
                            ›
                        </button>

                    )}

                </div>

            )}

        </main>

    );

};

export default TourDetails;