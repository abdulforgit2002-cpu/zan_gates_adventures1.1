import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    getTourBySlug,
    getTourImages,
    getTourPrices,
} from "../services/tourService";

import {
    createBookingEnquiry,
} from "../services/bookingService";

import {
    useTranslation,
} from "react-i18next";

import "./TourDetails.css";


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const localeMap = {
    en: "en-US",
    de: "de-DE",
    it: "it-IT",
    fr: "fr-FR",
    pl: "pl-PL",
};


const normalizeTour = (response) => {

    const data =
        response?.data ??
        response ??
        null;

    if (!data) {
        return null;
    }

    if (data.tour) {

        return {
            ...data.tour,

            prices:
                data.tour.prices ??
                data.prices ??
                [],

            images:
                data.tour.images ??
                data.images ??
                [],
        };
    }

    return data;
};


const normalizeArray = (value) => {

    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.images)) {
        return value.images;
    }

    if (Array.isArray(value?.prices)) {
        return value.prices;
    }

    return [];
};


const getImageUrl = (image) => {

    if (!image) {
        return "";
    }

    if (typeof image === "string") {
        return image;
    }

    return (
        image.image_url ||
        image.url ||
        image.secure_url ||
        image.src ||
        ""
    );
};


const getImageAlt = (
    image,
    fallback
) => {

    return (
        image?.alt_text ||
        image?.alt ||
        image?.caption ||
        fallback
    );
};


const formatPricingRange = (
    price,
    peopleLabel = "people"
) => {

    const min =
        Number(
            price?.min_people || 1
        );

    const max =
        price?.max_people === null ||
        price?.max_people === undefined ||
        price?.max_people === ""
            ? null
            : Number(
                price.max_people
            );

    if (
        max === null ||
        !Number.isFinite(max)
    ) {
        return `${min}+ ${peopleLabel}`;
    }

    if (min === max) {
        return `${min} ${peopleLabel}`;
    }

    return `${min} – ${max} ${peopleLabel}`;
};


const getPrimaryImage = (
    images
) => {

    if (
        !Array.isArray(images) ||
        images.length === 0
    ) {
        return "";
    }

    const primary =
        images.find(
            (image) =>
                image?.is_primary === true ||
                image?.is_primary === 1 ||
                image?.is_primary === "1"
        );

    return (
        getImageUrl(primary) ||
        getImageUrl(images[0])
    );
};


const todayString = () => {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const isPerPerson = (
    price
) => {

    return (
        String(
            price?.pricing_type || ""
        ).toUpperCase() ===
        "PER_PERSON"
    );
};


const isFeatured = (
    tour
) => {

    return (
        tour?.featured === true ||
        tour?.featured === 1 ||
        tour?.featured === "1"
    );
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function TourDetails() {

    const {
        slug,
    } = useParams();


    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    | React hooks must be called INSIDE the component.
    |--------------------------------------------------------------------------
    */

    const {
        t,
        i18n,
    } = useTranslation();


    const currentLocale =
        localeMap[i18n.language] ||
        "en-US";


    /*
    |--------------------------------------------------------------------------
    | TOUR STATE
    |--------------------------------------------------------------------------
    */

    const [
        tour,
        setTour,
    ] = useState(null);

    const [
        prices,
        setPrices,
    ] = useState([]);

    const [
        images,
        setImages,
    ] = useState([]);

    const [
        selectedImage,
        setSelectedImage,
    ] = useState("");

    const [
        imageIndex,
        setImageIndex,
    ] = useState(0);

    const [
        lightboxOpen,
        setLightboxOpen,
    ] = useState(false);

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
    | BOOKING STATE
    |--------------------------------------------------------------------------
    */

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        submitted,
        setSubmitted,
    ] = useState(false);

    const [
        bookingError,
        setBookingError,
    ] = useState("");


    const [
        form,
        setForm,
    ] = useState({
        full_name: "",
        email: "",
        phone: "",
        travel_date: "",
        adults: 1,
        children: 0,
        message: "",
    });


    /*
    |--------------------------------------------------------------------------
    | LOAD TOUR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let mounted = true;

        const loadTour = async () => {

            try {

                setLoading(true);
                setError("");

                if (!slug) {

                    throw new Error(
                        t("validation.noTourSpecified")
                    );
                }


                const response =
                    await getTourBySlug(
                        slug
                    );


                const normalizedTour =
                    normalizeTour(
                        response
                    );


                if (!normalizedTour) {

                    throw new Error(
                        t("validation.tourNotFound")
                    );
                }


                if (!mounted) {
                    return;
                }


                setTour(
                    normalizedTour
                );


                /*
                |--------------------------------------------------------------------------
                | PRICES
                |--------------------------------------------------------------------------
                */

                let loadedPrices =
                    normalizeArray(
                        normalizedTour.prices
                    );


                if (
                    loadedPrices.length === 0 &&
                    normalizedTour.id
                ) {

                    const priceResponse =
                        await getTourPrices(
                            normalizedTour.id
                        );

                    loadedPrices =
                        normalizeArray(
                            priceResponse
                        );
                }


                /*
                |--------------------------------------------------------------------------
                | IMAGES
                |--------------------------------------------------------------------------
                */

                let loadedImages =
                    normalizeArray(
                        normalizedTour.images
                    );


                if (
                    loadedImages.length === 0 &&
                    normalizedTour.id
                ) {

                    const imageResponse =
                        await getTourImages(
                            normalizedTour.id
                        );

                    loadedImages =
                        normalizeArray(
                            imageResponse
                        );
                }


                if (!mounted) {
                    return;
                }


                setPrices(
                    loadedPrices
                );

                setImages(
                    loadedImages
                );


                const primary =
                    getPrimaryImage(
                        loadedImages
                    );


                setSelectedImage(
                    primary
                );


                const primaryIndex =
                    loadedImages.findIndex(
                        (image) =>
                            getImageUrl(image) ===
                            primary
                    );


                setImageIndex(
                    primaryIndex >= 0
                        ? primaryIndex
                        : 0
                );


            } catch (err) {

                console.error(
                    "Failed to load tour:",
                    err
                );


                if (mounted) {

                    setError(
                        err?.message ||
                        t("validation.loadFailed")
                    );
                }


            } finally {

                if (mounted) {
                    setLoading(false);
                }
            }
        };


        if (slug) {

            loadTour();

        } else {

            setLoading(false);

            setError(
                t("validation.noTourSpecified")
            );
        }


        return () => {

            mounted = false;

        };

    }, [
        slug,
        t,
    ]);


    /*
    |--------------------------------------------------------------------------
    | IMAGE NAVIGATION
    |--------------------------------------------------------------------------
    */

    const selectImage = (
        image,
        index
    ) => {

        const url =
            getImageUrl(image);


        if (!url) {
            return;
        }


        setSelectedImage(
            url
        );

        setImageIndex(
            index
        );
    };


    const showPreviousImage = () => {

        if (images.length <= 1) {
            return;
        }


        const nextIndex =
            imageIndex <= 0
                ? images.length - 1
                : imageIndex - 1;


        selectImage(
            images[nextIndex],
            nextIndex
        );
    };


    const showNextImage = () => {

        if (images.length <= 1) {
            return;
        }


        const nextIndex =
            imageIndex >= images.length - 1
                ? 0
                : imageIndex + 1;


        selectImage(
            images[nextIndex],
            nextIndex
        );
    };


    /*
    |--------------------------------------------------------------------------
    | LIGHTBOX KEYBOARD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!lightboxOpen) {
            return undefined;
        }


        const handleKeyDown = (
            event
        ) => {

            if (event.key === "Escape") {

                setLightboxOpen(
                    false
                );
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


        document.body.style.overflow =
            "hidden";


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );


            document.body.style.overflow =
                "";
        };

    }, [
        lightboxOpen,
        imageIndex,
        images,
    ]);


    /*
    |--------------------------------------------------------------------------
    | DERIVED VALUES
    |--------------------------------------------------------------------------
    */

    const primaryImage =
        selectedImage ||
        getPrimaryImage(
            images
        );


    const startingPrice =
        useMemo(() => {

            if (
                !Array.isArray(prices) ||
                prices.length === 0
            ) {
                return null;
            }


            const validPrices =
                prices.filter(
                    (price) =>
                        Number.isFinite(
                            Number(
                                price?.price
                            )
                        )
                );


            if (
                validPrices.length === 0
            ) {
                return null;
            }


            return validPrices.reduce(
                (
                    lowest,
                    current
                ) => {

                    if (!lowest) {
                        return current;
                    }


                    return Number(
                        current.price
                    ) <
                    Number(
                        lowest.price
                    )
                        ? current
                        : lowest;

                },
                null
            );

        }, [
            prices,
        ]);


    const currency =
        startingPrice?.currency ||
        tour?.currency ||
        "USD";


    const guestCount =
        Number(form.adults || 0) +
        Number(form.children || 0);


    /*
    |--------------------------------------------------------------------------
    | ESTIMATED PRICE
    |--------------------------------------------------------------------------
    */

    const estimatedPrice =
        useMemo(() => {

            if (
                !prices.length ||
                guestCount <= 0
            ) {
                return null;
            }


            const perPersonPrices =
                prices
                    .filter(
                        isPerPerson
                    )
                    .filter(
                        (price) =>
                            Number.isFinite(
                                Number(
                                    price.price
                                )
                            )
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            Number(
                                a.min_people || 1
                            ) -
                            Number(
                                b.min_people || 1
                            )
                    );


            const matching =
                perPersonPrices.find(
                    (price) => {

                        const min =
                            Number(
                                price.min_people || 1
                            );


                        const max =
                            price.max_people === null ||
                            price.max_people === undefined ||
                            price.max_people === ""
                                ? Infinity
                                : Number(
                                    price.max_people
                                );


                        return (
                            guestCount >= min &&
                            guestCount <= max
                        );
                    }
                );


            if (matching) {

                return {
                    amount:
                        Number(
                            matching.price
                        ) *
                        guestCount,

                    currency:
                        matching.currency ||
                        currency,
                };
            }


            if (
                perPersonPrices.length
            ) {

                const fallback =
                    perPersonPrices[0];


                return {
                    amount:
                        Number(
                            fallback.price
                        ) *
                        guestCount,

                    currency:
                        fallback.currency ||
                        currency,
                };
            }


            return null;

        }, [
            prices,
            guestCount,
            currency,
        ]);


    /*
    |--------------------------------------------------------------------------
    | FORMAT MONEY
    |--------------------------------------------------------------------------
    */

    const formatMoney = (
        amount,
        moneyCurrency
    ) => {

        if (
            amount === null ||
            amount === undefined ||
            Number.isNaN(Number(amount))
        ) {
            return t("common.onRequest");
        }


        const symbol =
            moneyCurrency === "USD"
                ? "$"
                : moneyCurrency === "EUR"
                    ? "€"
                    : moneyCurrency === "GBP"
                        ? "£"
                        : moneyCurrency || "";


        return `${symbol}${Number(
            amount
        ).toLocaleString(
            currentLocale,
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        )}`;
    };


    /*
    |--------------------------------------------------------------------------
    | FORM HANDLING
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        setBookingError("");
    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT BOOKING
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setBookingError("");


        const fullName =
            form.full_name.trim();

        const email =
            form.email.trim();

        const phone =
            form.phone.trim();

        const adults =
            Number(
                form.adults
            );

        const children =
            Number(
                form.children
            );


        if (!fullName) {

            setBookingError(
                t("validation.fullNameRequired")
            );

            return;
        }


        if (!email) {

            setBookingError(
                t("validation.emailRequired")
            );

            return;
        }


        if (!form.travel_date) {

            setBookingError(
                t("validation.travelDateRequired")
            );

            return;
        }


        if (
            form.travel_date <
            todayString()
        ) {

            setBookingError(
                t("validation.travelDatePast")
            );

            return;
        }


        if (
            !Number.isInteger(adults) ||
            adults < 1
        ) {

            setBookingError(
                t("validation.adultRequired")
            );

            return;
        }


        if (
            !Number.isInteger(children) ||
            children < 0
        ) {

            setBookingError(
                t("validation.childrenInvalid")
            );

            return;
        }


        if (!tour?.id) {

            setBookingError(
                t("validation.tourUnavailable")
            );

            return;
        }


        setSubmitting(true);


        try {

            const payload = {

                tour_id:
                    Number(
                        tour.id
                    ),

                full_name:
                    fullName,

                email,

                phone:
                    phone || null,

                travel_date:
                    form.travel_date,

                adults,

                children,

                message:
                    form.message.trim() ||
                    null,

                estimated_total:
                    estimatedPrice
                        ? estimatedPrice.amount
                        : null,

                currency:
                    estimatedPrice?.currency ||
                    currency,
            };


            const response =
                await createBookingEnquiry(
                    payload
                );


            console.log(
                "Booking enquiry created:",
                response
            );


            setSubmitted(
                true
            );


            setForm({
                full_name: "",
                email: "",
                phone: "",
                travel_date: "",
                adults: 1,
                children: 0,
                message: "",
            });


        } catch (err) {

            console.error(
                "Booking submission failed:",
                err
            );


            setBookingError(
                err?.message ||
                t("validation.submitFailed")
            );


        } finally {

            setSubmitting(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="tour-details-loading">

                <div className="tour-details-loading-inner">

                    <div className="loading-spinner" />

                    <span>
                        {t("brand.name")}
                    </span>

                    <p>
                        {t("tourDetails.loading")}
                    </p>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error || !tour) {

        return (

            <div className="tour-details-error">

                <div className="tour-details-error-inner">

                    <span>
                        {t("tourDetails.errorLabel")}
                    </span>

                    <h1>
                        {t("tourDetails.errorTitle")}
                    </h1>

                    <p>
                        {error ||
                            t("tourDetails.errorDescription")}
                    </p>

                    <Link
                        to="/#tours"
                        className="tour-error-button"
                    >
                        {t("actions.exploreOurTours")}

                        <span>
                            →
                        </span>
                    </Link>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="tour-details-page">


            {/* ==========================================================
                HERO
            ========================================================== */}

            <section
                className="tour-details-hero"
                style={
                    primaryImage
                        ? {
                            backgroundImage:
                                `url("${primaryImage}")`,
                        }
                        : undefined
                }
            >

                <div className="tour-details-hero-overlay" />


                <div className="tour-details-container">

                    <div className="tour-details-breadcrumb">

                        <Link to="/">
                            {t("navigation.home")}
                        </Link>

                        <span>
                            •
                        </span>

                        <Link to="/#tours">
                            {t("navigation.tours")}
                        </Link>

                        <span>
                            •
                        </span>

                        <span>
                            {tour.title}
                        </span>

                    </div>


                    <div className="tour-details-hero-content">

                        <div className="tour-details-category-row">

                            {isFeatured(tour) && (

                                <span className="tour-details-featured">
                                    {t("common.featured")}
                                </span>
                            )}


                            <span className="tour-details-category">

                                {tour.category_name ||
                                    tour.category?.name ||
                                    t("common.zanzibarAdventure")}

                            </span>

                        </div>


                        <h1>
                            {tour.title}
                        </h1>


                        {tour.short_description && (

                            <p>
                                {tour.short_description}
                            </p>
                        )}


                        <div className="tour-details-quick-info">


                            {/* DESTINATION */}

                            <div>

                                <span className="quick-info-icon">

                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />

                                        <circle
                                            cx="12"
                                            cy="9"
                                            r="2.2"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />
                                    </svg>

                                </span>


                                <div>

                                    <small>
                                        {t("tourDetails.destination")}
                                    </small>

                                    <strong>
                                        {tour.destination_name ||
                                            tour.destination?.name ||
                                            t("common.zanzibar")}
                                    </strong>

                                </div>

                            </div>


                            {/* DURATION */}

                            <div>

                                <span className="quick-info-icon">

                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="8.5"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />

                                        <path
                                            d="M12 7v5l3.2 2"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                </span>


                                <div>

                                    <small>
                                        {t("tourDetails.duration")}
                                    </small>

                                    <strong>
                                        {tour.duration ||
                                            t("common.flexible")}
                                    </strong>

                                </div>

                            </div>


                            {/* STARTING PRICE */}

                            {startingPrice && (

                                <div>

                                    <span className="quick-info-icon">

                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 3v18M16.5 7.5c-.7-1.1-2-1.8-4-1.8-2.4 0-4 1.1-4 2.8 0 4.2 8 2 8 6.2 0 1.8-1.7 3.1-4.1 3.1-2 0-3.6-.7-4.4-2"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                    </span>


                                    <div>

                                        <small>
                                            {t("tourDetails.startingFrom")}
                                        </small>

                                        <strong>
                                            {formatMoney(
                                                startingPrice.price,
                                                startingPrice.currency
                                            )}
                                        </strong>


                                        {isPerPerson(
                                            startingPrice
                                        ) && (

                                            <span>
                                                {t("common.perPerson")}
                                            </span>
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </div>


                <div className="tour-hero-bottom">

                    <span>
                        {t("brand.name")}
                    </span>

                    <span>
                        {t("brand.location")}
                    </span>

                </div>

            </section>


            {/* ==========================================================
                MAIN
            ========================================================== */}

            <main className="tour-details-content">

                <div className="tour-details-container">

                    <div className="tour-details-layout">


                        {/* ==================================================
                            MAIN CONTENT
                        ================================================== */}

                        <div className="tour-details-main">


                            {/* ==================================================
                                GALLERY
                            ================================================== */}

                            <section className="tour-details-section tour-gallery-section">

                                <div className="tour-gallery-heading">

                                    <div>

                                        <span className="tour-section-eyebrow">
                                            {t("tourDetails.gallery.eyebrow")}
                                        </span>

                                        <h2>
                                            {t("tourDetails.gallery.title")}
                                        </h2>

                                    </div>


                                    {images.length > 0 && (

                                        <span className="tour-gallery-count">

                                            {imageIndex + 1}

                                            {" / "}

                                            {images.length}

                                        </span>
                                    )}

                                </div>


                                {primaryImage ? (

                                    <div className="tour-gallery">

                                        <button
                                            type="button"
                                            className="tour-gallery-main"
                                            onClick={() =>
                                                setLightboxOpen(
                                                    true
                                                )
                                            }
                                            aria-label={
                                                t("tourDetails.gallery.openImage")
                                            }
                                        >

                                            <img
                                                src={
                                                    primaryImage
                                                }
                                                alt={
                                                    getImageAlt(
                                                        images[imageIndex],
                                                        tour.title
                                                    )
                                                }
                                                onError={(event) => {

                                                    event.currentTarget.style.display =
                                                        "none";

                                                }}
                                            />


                                            <span className="tour-gallery-open">

                                                <svg
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>

                                                {t("tourDetails.gallery.viewGallery")}

                                            </span>


                                            {images.length > 1 && (

                                                <>

                                                    <button
                                                        type="button"
                                                        className="tour-gallery-arrow tour-gallery-arrow-left"
                                                        onClick={(event) => {

                                                            event.stopPropagation();

                                                            showPreviousImage();

                                                        }}
                                                        aria-label={
                                                            t("tourDetails.gallery.previousImage")
                                                        }
                                                    >
                                                        ←
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="tour-gallery-arrow tour-gallery-arrow-right"
                                                        onClick={(event) => {

                                                            event.stopPropagation();

                                                            showNextImage();

                                                        }}
                                                        aria-label={
                                                            t("tourDetails.gallery.nextImage")
                                                        }
                                                    >
                                                        →
                                                    </button>

                                                </>

                                            )}

                                        </button>


                                        {images.length > 1 && (

                                            <div className="tour-gallery-thumbnails">

                                                {images.map(
                                                    (
                                                        image,
                                                        index
                                                    ) => {

                                                        const url =
                                                            getImageUrl(
                                                                image
                                                            );


                                                        if (!url) {
                                                            return null;
                                                        }


                                                        return (

                                                            <button
                                                                key={
                                                                    image.id ||
                                                                    url ||
                                                                    index
                                                                }
                                                                type="button"
                                                                className={
                                                                    imageIndex ===
                                                                    index
                                                                        ? "active"
                                                                        : ""
                                                                }
                                                                onClick={() =>
                                                                    selectImage(
                                                                        image,
                                                                        index
                                                                    )
                                                                }
                                                            >

                                                                <img
                                                                    src={
                                                                        url
                                                                    }
                                                                    alt={
                                                                        getImageAlt(
                                                                            image,
                                                                            `${tour.title} ${index + 1}`
                                                                        )
                                                                    }
                                                                />

                                                            </button>

                                                        );

                                                    }
                                                )}

                                            </div>
                                        )}

                                    </div>

                                ) : (

                                    <div className="tour-gallery-placeholder">

                                        <span>
                                            ZAN GATES
                                        </span>

                                        <strong>
                                            ZANZIBAR
                                        </strong>

                                    </div>
                                )}

                            </section>


                            {/* ==================================================
                                DESCRIPTION
                            ================================================== */}

                            <section className="tour-details-section">

                                <span className="tour-section-eyebrow">
                                    {t("tourDetails.experienceEyebrow")}
                                </span>

                                <h2>
                                    {t("tourDetails.aboutTitle")}
                                </h2>


                                <div className="tour-description">

                                    {tour.description ? (

                                        String(
                                            tour.description
                                        )
                                            .split(
                                                /\n\s*\n/
                                            )
                                            .map(
                                                (
                                                    paragraph,
                                                    index
                                                ) => (

                                                    <p
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            paragraph
                                                        }
                                                    </p>

                                                )
                                            )

                                    ) : (

                                        <p>
                                            {t("tourDetails.defaultDescription")}
                                        </p>
                                    )}

                                </div>

                            </section>


                            {/* ==================================================
                                TOUR INFORMATION
                            ================================================== */}

                            <section className="tour-details-section">

                                <span className="tour-section-eyebrow">
                                    {t("tourDetails.informationEyebrow")}
                                </span>

                                <h2>
                                    {t("tourDetails.informationTitle")}
                                </h2>


                                <div className="tour-info-grid">


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            01
                                        </span>

                                        <div>

                                            <span>
                                                {t("tourDetails.destination")}
                                            </span>

                                            <strong>
                                                {tour.destination_name ||
                                                    tour.destination?.name ||
                                                    t("common.zanzibar")}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            02
                                        </span>

                                        <div>

                                            <span>
                                                {t("tourDetails.duration")}
                                            </span>

                                            <strong>
                                                {tour.duration ||
                                                    t("common.flexible")}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            03
                                        </span>

                                        <div>

                                            <span>
                                                {t("tourDetails.category")}
                                            </span>

                                            <strong>
                                                {tour.category_name ||
                                                    tour.category?.name ||
                                                    t("common.zanzibarAdventure")}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            04
                                        </span>

                                        <div>

                                            <span>
                                                {t("tourDetails.availability")}
                                            </span>

                                            <strong>
                                                {t("tourDetails.dailyEnquiry")}
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* ==================================================
                                PRICING
                            ================================================== */}

                            <section className="tour-details-section">

                                <span className="tour-section-eyebrow">
                                    {t("tourDetails.pricingEyebrow")}
                                </span>

                                <h2>
                                    {t("tourDetails.pricingTitle")}
                                </h2>


                                {prices.length > 0 ? (

                                    <div className="tour-pricing-list">

                                        {prices.map(
                                            (
                                                price,
                                                index
                                            ) => (

                                                <div
                                                    className="tour-price-row"
                                                    key={
                                                        price.id ||
                                                        index
                                                    }
                                                >

                                                    <div className="tour-price-description">

                                                        <span className="tour-price-type">

                                                            {String(
                                                                price.pricing_type ||
                                                                "PRICING"
                                                            ).replace(
                                                                /_/g,
                                                                " "
                                                            )}

                                                        </span>


                                                        <strong>
                                                            {formatPricingRange(
                                                                price,
                                                                t("tourDetails.people")
                                                            )}
                                                        </strong>

                                                    </div>


                                                    <div className="tour-price-value">

                                                        <strong>
                                                            {formatMoney(
                                                                price.price,
                                                                price.currency
                                                            )}
                                                        </strong>


                                                        {isPerPerson(
                                                            price
                                                        ) && (

                                                            <span>
                                                                {t("common.perPerson")}
                                                            </span>
                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div className="tour-no-pricing">

                                        <strong>
                                            {t("tourDetails.pricingOnRequest")}
                                        </strong>

                                        <span>
                                            {t("tourDetails.pricingOnRequestDescription")}
                                        </span>

                                    </div>
                                )}

                            </section>


                            {/* ==================================================
                                WHY ZAN GATES
                            ================================================== */}

                            <section className="tour-details-section tour-benefits-section">

                                <span className="tour-section-eyebrow">
                                    {t("tourDetails.whyZanGates")}
                                </span>

                                <h2>
                                    {t("tourDetails.localTeamTitle")}
                                </h2>


                                <div className="tour-benefits">


                                    <div>

                                        <span>
                                            01
                                        </span>

                                        <div>

                                            <strong>
                                                {t("tourDetails.benefits.localKnowledge.title")}
                                            </strong>

                                            <p>
                                                {t("tourDetails.benefits.localKnowledge.description")}
                                            </p>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            02
                                        </span>

                                        <div>

                                            <strong>
                                                {t("tourDetails.benefits.personalService.title")}
                                            </strong>

                                            <p>
                                                {t("tourDetails.benefits.personalService.description")}
                                            </p>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            03
                                        </span>

                                        <div>

                                            <strong>
                                                {t("tourDetails.benefits.easyEnquiry.title")}
                                            </strong>

                                            <p>
                                                {t("tourDetails.benefits.easyEnquiry.description")}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </section>

                        </div>


                        {/* ==================================================
                            SIDEBAR
                        ================================================== */}

                        <aside className="tour-details-sidebar">

                            <div className="tour-booking-card">


                                <div className="tour-booking-top">

                                    <span className="tour-booking-label">
                                        {t("tourDetails.booking.planYourExperience")}
                                    </span>


                                    {startingPrice && (

                                        <div className="tour-booking-starting-price">

                                            <small>
                                                {t("tourDetails.booking.from")}
                                            </small>

                                            <strong>
                                                {formatMoney(
                                                    startingPrice.price,
                                                    startingPrice.currency
                                                )}
                                            </strong>


                                            {isPerPerson(
                                                startingPrice
                                            ) && (

                                                <span>
                                                    / {t("tourDetails.booking.perPerson")}
                                                </span>
                                            )}

                                        </div>
                                    )}

                                </div>


                                <h3>
                                    {t("tourDetails.booking.enquireTitle")}
                                </h3>


                                <p>
                                    {t("tourDetails.booking.enquireDescription")}
                                </p>


                                {submitted ? (

                                    <div className="booking-success">

                                        <div className="booking-success-icon">
                                            ✓
                                        </div>


                                        <span className="booking-success-label">
                                            {t("tourDetails.booking.requestReceived")}
                                        </span>


                                        <h4>
                                            {t("tourDetails.booking.thankYou")}
                                        </h4>


                                        <p>
                                            {t("tourDetails.booking.requestReceivedDescription")}
                                        </p>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSubmitted(
                                                    false
                                                )
                                            }
                                        >
                                            {t("tourDetails.booking.sendAnother")}
                                        </button>

                                    </div>

                                ) : (

                                    <form
                                        className="tour-booking-form"
                                        onSubmit={
                                            handleSubmit
                                        }
                                    >


                                        {bookingError && (

                                            <div
                                                className="booking-error"
                                                role="alert"
                                            >

                                                <span>
                                                    !
                                                </span>

                                                <p>
                                                    {bookingError}
                                                </p>

                                            </div>
                                        )}


                                        {/* FULL NAME */}

                                        <div className="booking-field">

                                            <label htmlFor="full_name">

                                                {t("tourDetails.booking.fullName")}

                                            </label>


                                            <input
                                                id="full_name"
                                                type="text"
                                                name="full_name"
                                                value={
                                                    form.full_name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    t("tourDetails.booking.fullNamePlaceholder")
                                                }
                                                autoComplete="name"
                                                required
                                            />

                                        </div>


                                        {/* EMAIL */}

                                        <div className="booking-field">

                                            <label htmlFor="email">

                                                {t("tourDetails.booking.emailAddress")}

                                            </label>


                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={
                                                    form.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    t("tourDetails.booking.emailPlaceholder")
                                                }
                                                autoComplete="email"
                                                required
                                            />

                                        </div>


                                        {/* PHONE */}

                                        <div className="booking-field">

                                            <label htmlFor="phone">

                                                {t("tourDetails.booking.phoneNumber")}

                                                <span>
                                                    {t("tourDetails.booking.optional")}
                                                </span>

                                            </label>


                                            <input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                value={
                                                    form.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder={
                                                    t("tourDetails.booking.phonePlaceholder")
                                                }
                                                autoComplete="tel"
                                            />

                                        </div>


                                        {/* DATE */}

                                        <div className="booking-field">

                                            <label htmlFor="travel_date">

                                                {t("tourDetails.booking.preferredTravelDate")}

                                            </label>


                                            <input
                                                id="travel_date"
                                                type="date"
                                                name="travel_date"
                                                value={
                                                    form.travel_date
                                                }
                                                min={
                                                    todayString()
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* TRAVELLERS */}

                                        <div className="booking-form-row">


                                            <div className="booking-field">

                                                <label htmlFor="adults">

                                                    {t("tourDetails.booking.adults")}

                                                </label>


                                                <input
                                                    id="adults"
                                                    type="number"
                                                    name="adults"
                                                    min="1"
                                                    max="100"
                                                    value={
                                                        form.adults
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                />

                                            </div>


                                            <div className="booking-field">

                                                <label htmlFor="children">

                                                    {t("tourDetails.booking.children")}

                                                </label>


                                                <input
                                                    id="children"
                                                    type="number"
                                                    name="children"
                                                    min="0"
                                                    max="100"
                                                    value={
                                                        form.children
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                        </div>


                                        {/* MESSAGE */}

                                        <div className="booking-field">

                                            <label htmlFor="message">

                                                {t("tourDetails.booking.message")}

                                                <span>
                                                    {t("tourDetails.booking.optional")}
                                                </span>

                                            </label>


                                            <textarea
                                                id="message"
                                                name="message"
                                                value={
                                                    form.message
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows="4"
                                                placeholder={
                                                    t("tourDetails.booking.messagePlaceholder")
                                                }
                                            />

                                        </div>


                                        {/* ESTIMATED PRICE */}

                                        {estimatedPrice && (

                                            <div className="tour-booking-price">

                                                <div>

                                                    <span>
                                                        {t("tourDetails.booking.estimatedTotal")}
                                                    </span>


                                                    <strong>
                                                        {formatMoney(
                                                            estimatedPrice.amount,
                                                            estimatedPrice.currency
                                                        )}
                                                    </strong>

                                                </div>


                                                <small>

                                                    {t(
                                                        guestCount === 1
                                                            ? "tourDetails.booking.basedOnGuest"
                                                            : "tourDetails.booking.basedOnGuests",
                                                        {
                                                            count: guestCount,
                                                        }
                                                    )}

                                                </small>

                                            </div>
                                        )}


                                        {/* SUBMIT */}

                                        <button
                                            type="submit"
                                            className="tour-book-button"
                                            disabled={
                                                submitting
                                            }
                                        >

                                            {submitting ? (

                                                <>

                                                    <span className="button-spinner" />

                                                    {t("tourDetails.booking.sendingEnquiry")}

                                                </>

                                            ) : (

                                                <>

                                                    {t("tourDetails.booking.sendEnquiry")}

                                                    <span>
                                                        →
                                                    </span>

                                                </>
                                            )}

                                        </button>


                                        {/* SECURITY */}

                                        <div className="booking-security">

                                            <span>
                                                ✓
                                            </span>

                                            <p>
                                                {t("tourDetails.booking.noPaymentRequired")}{" "}
                                                {t("tourDetails.booking.availabilityConfirmation")}
                                            </p>

                                        </div>

                                    </form>
                                )}

                            </div>


                            {/* BACK */}

                            <Link
                                to="/#tours"
                                className="tour-back-link"
                            >

                                <span>
                                    ←
                                </span>

                                {t("tourDetails.backToExperiences")}

                            </Link>

                        </aside>

                    </div>

                </div>

            </main>


            {/* ==========================================================
                LIGHTBOX
            ========================================================== */}

            {lightboxOpen &&
                primaryImage && (

                <div
                    className="tour-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={
                        t("tourDetails.gallery.tourImageGallery")
                    }
                    onClick={() =>
                        setLightboxOpen(false)
                    }
                >

                    <button
                        type="button"
                        className="tour-lightbox-close"
                        onClick={() =>
                            setLightboxOpen(false)
                        }
                        aria-label={
                            t("tourDetails.gallery.closeGallery")
                        }
                    >
                        ×
                    </button>


                    <button
                        type="button"
                        className="tour-lightbox-arrow tour-lightbox-left"
                        onClick={(event) => {

                            event.stopPropagation();

                            showPreviousImage();

                        }}
                        aria-label={
                            t("tourDetails.gallery.previousImage")
                        }
                    >
                        ←
                    </button>


                    <div
                        className="tour-lightbox-content"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <img
                            src={
                                primaryImage
                            }
                            alt={
                                getImageAlt(
                                    images[imageIndex],
                                    tour.title
                                )
                            }
                        />


                        <div className="tour-lightbox-caption">

                            <span>
                                {tour.title}
                            </span>


                            <small>

                                {imageIndex + 1}

                                {" / "}

                                {images.length}

                            </small>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="tour-lightbox-arrow tour-lightbox-right"
                        onClick={(event) => {

                            event.stopPropagation();

                            showNextImage();

                        }}
                        aria-label={
                            t("tourDetails.gallery.nextImage")
                        }
                    >
                        →
                    </button>

                </div>
            )}

        </div>
    );
}


export default TourDetails;