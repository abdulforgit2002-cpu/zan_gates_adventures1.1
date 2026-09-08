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
    createBookingEnquiry,
    getTourBySlug,
    getTourImages,
    getTourPrices,
} from "../services/tourService";

import "./TourDetails.css";


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

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


const formatMoney = (
    amount,
    currency = "USD"
) => {
    const numeric =
        Number(amount);

    if (
        !Number.isFinite(numeric)
    ) {
        return "—";
    }

    try {
        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency:
                    currency || "USD",
                minimumFractionDigits:
                    0,
                maximumFractionDigits:
                    2,
            }
        ).format(numeric);
    } catch {
        return `${currency || "USD"} ${numeric.toLocaleString("en-US")}`;
    }
};


const formatPricingRange = (
    price
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
        return `${min}+ people`;
    }

    if (min === max) {
        return `${min} people`;
    }

    return `${min} – ${max} people`;
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


const isFeatured = (tour) => {
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
                        "Tour could not be found."
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
                        "Unable to load this tour."
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
                "No tour was specified."
            );
        }


        return () => {
            mounted = false;
        };

    }, [slug]);


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
    | OPEN LIGHTBOX
    |--------------------------------------------------------------------------
    */

    const openLightbox = () => {

        if (!primaryImage) {
            return;
        }

        setLightboxOpen(
            true
        );
    };


    /*
    |--------------------------------------------------------------------------
    | MAIN GALLERY KEYBOARD
    |--------------------------------------------------------------------------
    |
    | The gallery itself is now a div instead of a button because it
    | contains independent previous/next button controls.
    |
    */

    const handleGalleryKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            openLightbox();
        }
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
                setLightboxOpen(false);
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
                "Please enter your full name."
            );
            return;
        }


        if (!email) {
            setBookingError(
                "Please enter your email address."
            );
            return;
        }


        if (!form.travel_date) {
            setBookingError(
                "Please select your preferred travel date."
            );
            return;
        }


        if (
            form.travel_date <
            todayString()
        ) {
            setBookingError(
                "Travel date cannot be in the past."
            );
            return;
        }


        if (
            !Number.isInteger(adults) ||
            adults < 1
        ) {
            setBookingError(
                "At least one adult is required."
            );
            return;
        }


        if (
            !Number.isInteger(children) ||
            children < 0
        ) {
            setBookingError(
                "Number of children is invalid."
            );
            return;
        }


        if (!tour?.id) {
            setBookingError(
                "Tour information is unavailable."
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
                "We could not submit your enquiry. Please try again."
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
                        ZAN GATES ADVENTURES
                    </span>

                    <p>
                        Preparing your Zanzibar experience...
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
                        TOUR NOT FOUND
                    </span>

                    <h1>
                        This experience is unavailable.
                    </h1>

                    <p>
                        We could not find the tour
                        you requested. Please return
                        to our experiences and choose
                        another Zanzibar adventure.
                    </p>

                    <Link
                        to="/#tours"
                        className="tour-error-button"
                    >
                        Explore Tours
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
        <div className="tour-details-page bg-white min-h-screen">


            {/* ==========================================================
                HERO
            ========================================================== */}

            <section
                className="tour-details-hero relative bg-cover bg-center"
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

                <div className="tour-details-container max-w-7xl mx-auto px-6">

                    <div className="tour-details-breadcrumb">

                        <Link to="/">
                            Home
                        </Link>

                        <span>•</span>

                        <Link to="/#tours">
                            Experiences
                        </Link>

                        <span>•</span>

                        <span>
                            {tour.title}
                        </span>

                    </div>


                    <div className="tour-details-hero-content max-w-3xl">

                        <div className="tour-details-category-row">

                            {isFeatured(tour) && (
                                <span className="tour-details-featured">
                                    Featured experience
                                </span>
                            )}

                            <span className="tour-details-category">
                                {tour.category_name ||
                                    tour.category?.name ||
                                    "Zanzibar Experience"}
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
                                        Destination
                                    </small>

                                    <strong>
                                        {tour.destination_name ||
                                            tour.destination?.name ||
                                            "Zanzibar"}
                                    </strong>
                                </div>
                            </div>


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
                                        Duration
                                    </small>

                                    <strong>
                                        {tour.duration ||
                                            "Flexible"}
                                    </strong>
                                </div>
                            </div>


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
                                            Starting from
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
                                                per person
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
                        ZAN GATES ADVENTURES
                    </span>

                    <span>
                        ZANZIBAR • TANZANIA
                    </span>

                </div>

            </section>


            {/* ==========================================================
                MAIN
            ========================================================== */}

            <main className="tour-details-content">

                <div className="tour-details-container max-w-7xl mx-auto px-6">

                    <div className="tour-details-layout grid grid-cols-1 lg:grid-cols-3 gap-10">


                        {/* ==================================================
                            MAIN CONTENT
                        ================================================== */}

                        <div className="tour-details-main lg:col-span-2">


                            {/* ==================================================
                                GALLERY
                            ================================================== */}

                            <section className="tour-details-section tour-gallery-section">

                                <div className="tour-gallery-heading">

                                    <div>

                                        <span className="tour-section-eyebrow">
                                            VISUAL JOURNEY
                                        </span>

                                        <h2>
                                            Explore the experience
                                        </h2>

                                    </div>


                                    {images.length > 0 && (
                                        <span className="tour-gallery-count">

                                            {imageIndex + 1}

                                            {" "}

                                            /

                                            {" "}

                                            {images.length}

                                        </span>
                                    )}

                                </div>


                                {primaryImage ? (

                                    <div className="tour-gallery">


                                        {/* ==================================================
                                            MAIN IMAGE

                                            IMPORTANT:
                                            This is a DIV rather than a BUTTON because
                                            the previous/next controls are independent
                                            buttons inside this gallery area.
                                        ================================================== */}

                                        <div
                                            className="tour-gallery-main"
                                            role="button"
                                            tabIndex={0}
                                            onClick={
                                                openLightbox
                                            }
                                            onKeyDown={
                                                handleGalleryKeyDown
                                            }
                                            aria-label="Open tour image gallery"
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

                                                View gallery

                                            </span>


                                            {/* ==================================================
                                                PREVIOUS IMAGE
                                            ================================================== */}

                                            {images.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="tour-gallery-arrow tour-gallery-arrow-left"
                                                    onClick={(event) => {

                                                        event.stopPropagation();

                                                        showPreviousImage();

                                                    }}
                                                    aria-label="Previous image"
                                                >
                                                    ←
                                                </button>
                                            )}


                                            {/* ==================================================
                                                NEXT IMAGE
                                            ================================================== */}

                                            {images.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="tour-gallery-arrow tour-gallery-arrow-right"
                                                    onClick={(event) => {

                                                        event.stopPropagation();

                                                        showNextImage();

                                                    }}
                                                    aria-label="Next image"
                                                >
                                                    →
                                                </button>
                                            )}

                                        </div>


                                        {/* ==================================================
                                            THUMBNAILS
                                        ================================================== */}

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
                                    THE EXPERIENCE
                                </span>

                                <h2>
                                    About this experience
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
                                            Discover an unforgettable
                                            Zanzibar experience with
                                            our local team.
                                        </p>

                                    )}

                                </div>

                            </section>


                            {/* ==================================================
                                TOUR INFORMATION
                            ================================================== */}

                            <section className="tour-details-section">

                                <span className="tour-section-eyebrow">
                                    TOUR INFORMATION
                                </span>

                                <h2>
                                    Everything you need to know
                                </h2>


                                <div className="tour-info-grid">

                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            01
                                        </span>

                                        <div>

                                            <span>
                                                Destination
                                            </span>

                                            <strong>
                                                {tour.destination_name ||
                                                    tour.destination?.name ||
                                                    "Zanzibar"}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            02
                                        </span>

                                        <div>

                                            <span>
                                                Duration
                                            </span>

                                            <strong>
                                                {tour.duration ||
                                                    "Flexible"}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            03
                                        </span>

                                        <div>

                                            <span>
                                                Category
                                            </span>

                                            <strong>
                                                {tour.category_name ||
                                                    tour.category?.name ||
                                                    "Experience"}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="tour-info-card">

                                        <span className="tour-info-number">
                                            04
                                        </span>

                                        <div>

                                            <span>
                                                Availability
                                            </span>

                                            <strong>
                                                Daily enquiry
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
                                    PRICING
                                </span>

                                <h2>
                                    Simple, transparent pricing
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
                                                                price
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
                                                                per person
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
                                            Pricing available on request
                                        </strong>

                                        <span>
                                            Send us your travel details
                                            and our team will prepare
                                            the right arrangement for you.
                                        </span>

                                    </div>

                                )}

                            </section>


                            {/* ==================================================
                                WHY ZAN GATES
                            ================================================== */}

                            <section className="tour-details-section tour-benefits-section">

                                <span className="tour-section-eyebrow">
                                    WHY ZAN GATES
                                </span>

                                <h2>
                                    Travel with a local team
                                </h2>


                                <div className="tour-benefits">

                                    <div>

                                        <span>
                                            01
                                        </span>

                                        <div>

                                            <strong>
                                                Local knowledge
                                            </strong>

                                            <p>
                                                Experience Zanzibar
                                                with people who know
                                                the island, its waters
                                                and its hidden places.
                                            </p>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            02
                                        </span>

                                        <div>

                                            <strong>
                                                Personal service
                                            </strong>

                                            <p>
                                                We tailor your
                                                experience around
                                                your travel plans
                                                and preferences.
                                            </p>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            03
                                        </span>

                                        <div>

                                            <strong>
                                                Easy enquiry
                                            </strong>

                                            <p>
                                                Send your request
                                                online and our team
                                                will contact you to
                                                confirm the details.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </section>

                        </div>


                        {/* ==================================================
                            SIDEBAR
                        ================================================== */}

                        <aside className="tour-details-sidebar lg:col-span-1">

                            <div className="tour-booking-card">

                                <div className="tour-booking-top">

                                    <span className="tour-booking-label">
                                        PLAN YOUR EXPERIENCE
                                    </span>

                                    {startingPrice && (

                                        <div className="tour-booking-starting-price">

                                            <small>
                                                From
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
                                                    / person
                                                </span>
                                            )}

                                        </div>

                                    )}

                                </div>


                                <h3>
                                    Enquire about this tour
                                </h3>

                                <p>
                                    Tell us when you would like
                                    to travel and how many guests
                                    will be joining you.
                                </p>


                                {submitted ? (

                                    <div className="booking-success">

                                        <div className="booking-success-icon">
                                            ✓
                                        </div>

                                        <span className="booking-success-label">
                                            REQUEST RECEIVED
                                        </span>

                                        <h4>
                                            Thank you.
                                        </h4>

                                        <p>
                                            Your enquiry has been
                                            successfully received.
                                            Our team will review
                                            your request and contact
                                            you shortly.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSubmitted(
                                                    false
                                                )
                                            }
                                        >
                                            Send another enquiry
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


                                        <div className="booking-field">

                                            <label htmlFor="full_name">
                                                Full name
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
                                                placeholder="Your full name"
                                                autoComplete="name"
                                                required
                                            />

                                        </div>


                                        <div className="booking-field">

                                            <label htmlFor="email">
                                                Email address
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
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                required
                                            />

                                        </div>


                                        <div className="booking-field">

                                            <label htmlFor="phone">

                                                Phone number

                                                <span>
                                                    Optional
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
                                                placeholder="+255 ..."
                                                autoComplete="tel"
                                            />

                                        </div>


                                        <div className="booking-field">

                                            <label htmlFor="travel_date">
                                                Preferred travel date
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


                                        <div className="booking-form-row">

                                            <div className="booking-field">

                                                <label htmlFor="adults">
                                                    Adults
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
                                                    Children
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


                                        <div className="booking-field">

                                            <label htmlFor="message">

                                                Message

                                                <span>
                                                    Optional
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
                                                placeholder="Tell us anything we should know about your trip..."
                                            />

                                        </div>


                                        {estimatedPrice && (

                                            <div className="tour-booking-price">

                                                <div>

                                                    <span>
                                                        Estimated total
                                                    </span>

                                                    <strong>
                                                        {formatMoney(
                                                            estimatedPrice.amount,
                                                            estimatedPrice.currency
                                                        )}
                                                    </strong>

                                                </div>

                                                <small>

                                                    Based on{" "}

                                                    {guestCount}

                                                    {" "}

                                                    guest
                                                    {guestCount === 1
                                                        ? ""
                                                        : "s"}

                                                </small>

                                            </div>

                                        )}


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

                                                    Sending enquiry...

                                                </>

                                            ) : (

                                                <>

                                                    Send Enquiry

                                                    <span>
                                                        →
                                                    </span>

                                                </>

                                            )}

                                        </button>


                                        <div className="booking-security">

                                            <span>
                                                ✓
                                            </span>

                                            <p>
                                                No payment required.
                                                Availability and final
                                                arrangements are confirmed
                                                by our team.
                                            </p>

                                        </div>

                                    </form>

                                )}

                            </div>


                            <Link
                                to="/#tours"
                                className="tour-back-link"
                            >

                                <span>
                                    ←
                                </span>

                                Back to all experiences

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
                    aria-label="Tour image gallery"
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
                        aria-label="Close gallery"
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
                        aria-label="Previous image"
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
                        aria-label="Next image"
                    >
                        →
                    </button>

                </div>

            )}

        </div>
    );
}


export default TourDetails;