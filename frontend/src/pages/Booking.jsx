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
    getTourPrices,
} from "../services/tourService";

import {
    createBookingEnquiry,
} from "../services/bookingService";


const Booking = () => {

    const { slug } = useParams();

    /*
     * ============================================================
     * TOUR STATE
     * ============================================================
     */

    const [tour, setTour] = useState(null);
    const [prices, setPrices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * ============================================================
     * FORM STATE
     * ============================================================
     */

    const [formData, setFormData] = useState({
        travel_date: "",
        adults: 2,
        children: 0,
        full_name: "",
        email: "",
        phone: "",
        special_requirements: "",
    });

    /*
     * ============================================================
     * SUBMISSION STATE
     * ============================================================
     */

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successData, setSuccessData] = useState(null);


    /*
     * ============================================================
     * TODAY
     * ============================================================
     */

    const today = useMemo(() => {

        const date = new Date();

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }, []);


    /*
     * ============================================================
     * LOAD TOUR
     * ============================================================
     */

    useEffect(() => {

        const loadBookingData = async () => {

            try {

                setLoading(true);
                setError("");

                if (!slug) {

                    throw new Error(
                        "No tour was specified."
                    );

                }

                /*
                 * Get tour using its slug.
                 */

                const tourData =
                    await getTourBySlug(slug);


                if (!tourData) {

                    throw new Error(
                        "The requested tour could not be found."
                    );

                }


                /*
                 * Get official pricing information.
                 */

                const priceData =
                    await getTourPrices(
                        tourData.id
                    );


                setTour(tourData);
                setPrices(priceData);

            } catch (err) {

                console.error(
                    "Failed to load booking page:",
                    err
                );

                setTour(null);
                setPrices([]);

                setError(
                    err.message ||
                    "Unable to load this experience."
                );

            } finally {

                setLoading(false);

            }

        };


        loadBookingData();

    }, [slug]);


    /*
     * ============================================================
     * FORM HANDLER
     * ============================================================
     */

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));


        /*
         * Clear submission error
         * once the customer starts editing.
         */

        if (submitError) {
            setSubmitError("");
        }

    };


    /*
     * ============================================================
     * NUMBER CONTROL
     * ============================================================
     */

    const updateTravellerCount = (
        field,
        amount
    ) => {

        setFormData((previous) => {

            const currentValue =
                Number(previous[field]) || 0;

            let nextValue =
                currentValue + amount;


            if (field === "adults") {

                nextValue =
                    Math.max(1, nextValue);

            } else {

                nextValue =
                    Math.max(0, nextValue);

            }


            return {
                ...previous,
                [field]: nextValue,
            };

        });

    };


    /*
     * ============================================================
     * CURRENCY
     * ============================================================
     */

    const currency =
        prices.length > 0 &&
        prices[0].currency
            ? prices[0].currency
            : "USD";


    const currencySymbol =
        currency === "USD"
            ? "$"
            : currency;


    /*
     * ============================================================
     * FIND APPLICABLE PRICE
     * ============================================================
     *
     * This mirrors the current backend pricing model.
     *
     * The backend remains authoritative.
     *
     * This calculation is ONLY for the
     * customer's live UI estimate.
     */

    const selectedPrice = useMemo(() => {

        const adults =
            Number(formData.adults) || 1;


        const applicablePrices =
            prices
                .filter(
                    (price) =>
                        price.pricing_type ===
                        "PER_PERSON"
                )
                .filter(
                    (price) =>
                        Number(price.min_people) <=
                        adults
                )
                .filter(
                    (price) =>
                        price.max_people === null ||
                        price.max_people === undefined ||
                        Number(price.max_people) >=
                        adults
                )
                .sort(
                    (a, b) => {

                        const aMax =
                            a.max_people === null ||
                            a.max_people === undefined
                                ? Infinity
                                : Number(a.max_people);

                        const bMax =
                            b.max_people === null ||
                            b.max_people === undefined
                                ? Infinity
                                : Number(b.max_people);


                        if (aMax !== bMax) {
                            return aMax - bMax;
                        }


                        return (
                            Number(b.min_people) -
                            Number(a.min_people)
                        );

                    }
                );


        return applicablePrices.length > 0
            ? applicablePrices[0]
            : null;

    }, [
        prices,
        formData.adults,
    ]);


    /*
     * ============================================================
     * ESTIMATED TOTAL
     * ============================================================
     */

    const estimatedTotal = useMemo(() => {

        if (!selectedPrice) {
            return null;
        }


        const unitPrice =
            Number(selectedPrice.price);


        const adults =
            Number(formData.adults) || 1;


        if (
            Number.isNaN(unitPrice) ||
            unitPrice < 0
        ) {
            return null;
        }


        return adults * unitPrice;

    }, [
        selectedPrice,
        formData.adults,
    ]);


    /*
     * ============================================================
     * FORMAT MONEY
     * ============================================================
     */

    const formatMoney = (amount) => {

        if (
            amount === null ||
            amount === undefined ||
            Number.isNaN(Number(amount))
        ) {
            return "On Request";
        }


        return Number(amount).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );

    };


    /*
     * ============================================================
     * FORM SUBMISSION
     * ============================================================
     */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSubmitError("");
        setSuccessData(null);


        /*
         * Basic frontend validation.
         */

        if (!formData.travel_date) {

            setSubmitError(
                "Please select your preferred travel date."
            );

            return;

        }


        if (
            Number(formData.adults) < 1
        ) {

            setSubmitError(
                "At least one adult is required."
            );

            return;

        }


        if (!formData.full_name.trim()) {

            setSubmitError(
                "Please enter your full name."
            );

            return;

        }


        if (!formData.email.trim()) {

            setSubmitError(
                "Please enter your email address."
            );

            return;

        }


        if (!formData.phone.trim()) {

            setSubmitError(
                "Please enter your phone or WhatsApp number."
            );

            return;

        }


        try {

            setSubmitting(true);


            /*
             * IMPORTANT:
             *
             * Do NOT send:
             *
             * estimated_total
             * currency
             * status
             *
             * The PHP backend controls these values.
             */

            const booking =
                await createBookingEnquiry({

                    tour_id: Number(tour.id),

                    travel_date:
                        formData.travel_date,

                    adults:
                        Number(formData.adults),

                    children:
                        Number(formData.children),

                    full_name:
                        formData.full_name.trim(),

                    email:
                        formData.email.trim(),

                    phone:
                        formData.phone.trim(),

                    special_requirements:
                        formData.special_requirements.trim(),

                });


            setSuccessData(booking);

        } catch (err) {

            console.error(
                "Booking enquiry failed:",
                err
            );

            setSubmitError(
                err.message ||
                "We could not submit your enquiry. Please try again."
            );

        } finally {

            setSubmitting(false);

        }

    };


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {

        return (

            <main className="booking-page">

                <section className="booking-loading">

                    <div>

                        <div className="booking-spinner"></div>

                        <p>
                            Preparing your booking experience...
                        </p>

                    </div>

                </section>

            </main>

        );

    }


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (error || !tour) {

        return (

            <main className="booking-page">

                <section className="booking-error">

                    <span>
                        BOOKING UNAVAILABLE
                    </span>

                    <h1>
                        We couldn't load this experience
                    </h1>

                    <p>
                        {error ||
                            "The requested tour is unavailable."}
                    </p>

                    <Link
                        to="/"
                        className="booking-primary-button"
                    >
                        Back to Tours
                    </Link>

                </section>

            </main>

        );

    }


    /*
     * ============================================================
     * SUCCESS STATE
     * ============================================================
     */

    if (successData) {

        return (

            <main className="booking-page">

                <section className="booking-success-section">

                    <div className="booking-success-card">

                        <div className="booking-success-icon">
                            ✓
                        </div>


                        <span className="booking-section-label">
                            ENQUIRY RECEIVED
                        </span>


                        <h1>
                            Thank you, {formData.full_name}.
                        </h1>


                        <p>
                            Your enquiry for{" "}
                            <strong>
                                {tour.title}
                            </strong>{" "}
                            has been received successfully.
                        </p>


                        <div className="booking-success-summary">

                            <div>

                                <span>
                                    TRAVEL DATE
                                </span>

                                <strong>
                                    {successData.travel_date}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    TRAVELLERS
                                </span>

                                <strong>
                                    {successData.adults} adult
                                    {successData.adults !== 1
                                        ? "s"
                                        : ""}

                                    {successData.children > 0 &&
                                        ` + ${successData.children} child${
                                            successData.children !== 1
                                                ? "ren"
                                                : ""
                                        }`}
                                </strong>

                            </div>


                            {successData.estimated_total !==
                                null &&
                                successData.estimated_total !==
                                    undefined && (

                                    <div>

                                        <span>
                                            ESTIMATED TOTAL
                                        </span>

                                        <strong>

                                            {successData.currency ===
                                            "USD"
                                                ? "$"
                                                : successData.currency}

                                            {formatMoney(
                                                successData.estimated_total
                                            )}

                                        </strong>

                                    </div>

                                )}

                        </div>


                        <div className="booking-success-note">

                            <strong>
                                What happens next?
                            </strong>

                            <p>
                                Our team will review your
                                preferred date and arrangements
                                and contact you to confirm
                                availability and final details.
                            </p>

                        </div>


                        <div className="booking-success-actions">

                            <Link
                                to={`/tours/${tour.slug}`}
                                className="booking-secondary-button"
                            >
                                Back to Tour
                            </Link>


                            <Link
                                to="/"
                                className="booking-primary-button"
                            >
                                Explore More Tours
                            </Link>

                        </div>

                    </div>

                </section>

            </main>

        );

    }


    /*
     * ============================================================
     * BOOKING PAGE
     * ============================================================
     */

    return (

        <main className="booking-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <section className="booking-header">

                <div className="booking-container">

                    <div className="booking-breadcrumb">

                        <Link to="/">
                            Home
                        </Link>

                        <span>
                            /
                        </span>

                        <Link
                            to={`/tours/${tour.slug}`}
                        >
                            {tour.title}
                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Book
                        </strong>

                    </div>


                    <span className="booking-section-label">
                        BOOK YOUR EXPERIENCE
                    </span>


                    <h1>
                        Plan your Zanzibar adventure
                    </h1>


                    <p>
                        Tell us when you would like to
                        travel and how many people will
                        be joining you. Our team will review
                        your enquiry and help arrange the
                        experience.
                    </p>

                </div>

            </section>


            {/* ==================================================
                BOOKING CONTENT
            ================================================== */}

            <section className="booking-content">

                <div className="booking-container">

                    <div className="booking-layout">


                        {/* ==================================================
                            FORM
                        ================================================== */}

                        <div className="booking-form-wrapper">

                            <form
                                className="booking-form"
                                onSubmit={handleSubmit}
                            >


                                {/* ==============================
                                    TOUR
                                ============================== */}

                                <div className="booking-tour-preview">

                                    <div>

                                        <span>
                                            YOUR EXPERIENCE
                                        </span>

                                        <h2>
                                            {tour.title}
                                        </h2>

                                        <p>
                                            {tour.destination_name ||
                                                "Zanzibar"}{" "}
                                            •{" "}
                                            {tour.duration ||
                                                "Flexible"}

                                        </p>

                                    </div>


                                    <Link
                                        to={`/tours/${tour.slug}`}
                                    >
                                        View Tour
                                    </Link>

                                </div>


                                {/* ==============================
                                    YOUR TRIP
                                ============================== */}

                                <div className="booking-form-section">

                                    <div className="booking-form-heading">

                                        <span>
                                            01
                                        </span>

                                        <div>

                                            <h2>
                                                Your Trip
                                            </h2>

                                            <p>
                                                Choose your preferred
                                                date and group size.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="booking-form-grid">


                                        {/* DATE */}

                                        <div className="booking-field booking-field-full">

                                            <label htmlFor="travel_date">
                                                Travel Date
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="travel_date"
                                                name="travel_date"
                                                type="date"
                                                min={today}
                                                value={
                                                    formData.travel_date
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* ADULTS */}

                                        <div className="booking-field">

                                            <label>
                                                Adults
                                                <span>
                                                    *
                                                </span>
                                            </label>


                                            <div className="traveller-counter">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateTravellerCount(
                                                            "adults",
                                                            -1
                                                        )
                                                    }
                                                    disabled={
                                                        Number(
                                                            formData.adults
                                                        ) <= 1
                                                    }
                                                    aria-label="Remove adult"
                                                >
                                                    −
                                                </button>


                                                <strong>
                                                    {
                                                        formData.adults
                                                    }
                                                </strong>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateTravellerCount(
                                                            "adults",
                                                            1
                                                        )
                                                    }
                                                    aria-label="Add adult"
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>


                                        {/* CHILDREN */}

                                        <div className="booking-field">

                                            <label>
                                                Children
                                            </label>


                                            <div className="traveller-counter">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateTravellerCount(
                                                            "children",
                                                            -1
                                                        )
                                                    }
                                                    disabled={
                                                        Number(
                                                            formData.children
                                                        ) <= 0
                                                    }
                                                    aria-label="Remove child"
                                                >
                                                    −
                                                </button>


                                                <strong>
                                                    {
                                                        formData.children
                                                    }
                                                </strong>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateTravellerCount(
                                                            "children",
                                                            1
                                                        )
                                                    }
                                                    aria-label="Add child"
                                                >
                                                    +
                                                </button>

                                            </div>

                                        </div>

                                    </div>


                                    <p className="booking-helper-text">
                                        Children are recorded for
                                        planning; child pricing will
                                        be confirmed by our team.
                                    </p>

                                </div>


                                {/* ==============================
                                    CUSTOMER DETAILS
                                ============================== */}

                                <div className="booking-form-section">

                                    <div className="booking-form-heading">

                                        <span>
                                            02
                                        </span>

                                        <div>

                                            <h2>
                                                Your Details
                                            </h2>

                                            <p>
                                                Tell us how we can
                                                contact you.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="booking-form-grid">


                                        {/* FULL NAME */}

                                        <div className="booking-field booking-field-full">

                                            <label htmlFor="full_name">
                                                Full Name
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="full_name"
                                                name="full_name"
                                                type="text"
                                                maxLength="150"
                                                autoComplete="name"
                                                placeholder="Your full name"
                                                value={
                                                    formData.full_name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* EMAIL */}

                                        <div className="booking-field">

                                            <label htmlFor="email">
                                                Email Address
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                maxLength="180"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* PHONE */}

                                        <div className="booking-field">

                                            <label htmlFor="phone">
                                                Phone / WhatsApp
                                                <span>
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                maxLength="40"
                                                autoComplete="tel"
                                                placeholder="+255..."
                                                value={
                                                    formData.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        {/* REQUIREMENTS */}

                                        <div className="booking-field booking-field-full">

                                            <label htmlFor="special_requirements">
                                                Special Requirements
                                            </label>

                                            <textarea
                                                id="special_requirements"
                                                name="special_requirements"
                                                maxLength="5000"
                                                rows="6"
                                                placeholder="Dietary requirements, accessibility needs, special occasions or anything else we should know..."
                                                value={
                                                    formData.special_requirements
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* ==============================
                                    ERROR
                                ============================== */}

                                {submitError && (

                                    <div
                                        className="booking-submit-error"
                                        role="alert"
                                    >
                                        {submitError}
                                    </div>

                                )}


                                {/* ==============================
                                    SUBMIT
                                ============================== */}

                                <button
                                    type="submit"
                                    className="booking-submit-button"
                                    disabled={submitting}
                                >

                                    {submitting
                                        ? "Sending Enquiry..."
                                        : "Send Enquiry"}

                                    {!submitting && (
                                        <span>
                                            →
                                        </span>
                                    )}

                                </button>


                                <p className="booking-form-disclaimer">
                                    No payment is required at this
                                    stage. Your enquiry will be
                                    reviewed by our team before
                                    arrangements are confirmed.
                                </p>

                            </form>

                        </div>


                        {/* ==================================================
                            SUMMARY
                        ================================================== */}

                        <aside className="booking-summary">

                            <div className="booking-summary-card">

                                <span className="booking-summary-label">
                                    TRIP SUMMARY
                                </span>


                                <h2>
                                    {tour.title}
                                </h2>


                                <div className="booking-summary-meta">

                                    <div>

                                        <span>
                                            DESTINATION
                                        </span>

                                        <strong>
                                            {tour.destination_name ||
                                                "Zanzibar"}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            DURATION
                                        </span>

                                        <strong>
                                            {tour.duration ||
                                                "Flexible"}
                                        </strong>

                                    </div>

                                </div>


                                <div className="booking-summary-divider"></div>


                                {/* TRAVELLERS */}

                                <div className="booking-summary-row">

                                    <span>
                                        Adults
                                    </span>

                                    <strong>
                                        {formData.adults}
                                    </strong>

                                </div>


                                <div className="booking-summary-row">

                                    <span>
                                        Children
                                    </span>

                                    <strong>
                                        {formData.children}
                                    </strong>

                                </div>


                                {formData.travel_date && (

                                    <div className="booking-summary-row">

                                        <span>
                                            Travel date
                                        </span>

                                        <strong>
                                            {formData.travel_date}
                                        </strong>

                                    </div>

                                )}


                                <div className="booking-summary-divider"></div>


                                {/* TOTAL */}

                                <div className="booking-summary-total">

                                    <span>
                                        Estimated Total
                                    </span>


                                    <strong>

                                        {estimatedTotal !== null
                                            ? `${currencySymbol}${formatMoney(
                                                  estimatedTotal
                                              )}`
                                            : "On Request"}

                                    </strong>


                                    {estimatedTotal !== null && (

                                        <small>
                                            {currency} • Adults
                                            charged per person
                                        </small>

                                    )}

                                </div>


                                <div className="booking-summary-note">

                                    <strong>
                                        No payment required
                                    </strong>

                                    <p>
                                        This is an enquiry, not an
                                        online payment. Our team will
                                        confirm availability and final
                                        arrangements with you.
                                    </p>

                                </div>

                            </div>


                            {/* ==============================
                                TRUST CARD
                            ============================== */}

                            <div className="booking-confidence-card">

                                <span>
                                    ZAN GATES ADVENTURES
                                </span>

                                <h3>
                                    Travel with confidence
                                </h3>

                                <ul>

                                    <li>
                                        Local support
                                    </li>

                                    <li>
                                        Experienced guides
                                    </li>

                                    <li>
                                        Flexible enquiries
                                    </li>

                                    <li>
                                        Personal service
                                    </li>

                                </ul>

                            </div>

                        </aside>

                    </div>

                </div>

            </section>

        </main>

    );

};

export default Booking;