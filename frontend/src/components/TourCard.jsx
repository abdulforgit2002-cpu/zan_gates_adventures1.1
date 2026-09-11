import {
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    useTranslation,
} from "react-i18next";


const TourCard = ({ tour }) => {

    const {
        t,
    } = useTranslation();

    if (!tour) {
        return null;
    }


    const [
        imageError,
        setImageError,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    */

    const imageUrl =
        tour.image_url ||
        tour.primary_image ||
        tour.primary_image_url ||
        (
            Array.isArray(tour.images) &&
            tour.images.length > 0
                ? (
                    tour.images.find(
                        (image) =>
                            image?.is_primary === true ||
                            image?.is_primary === 1 ||
                            image?.is_primary === "1"
                    )?.image_url ||
                    tour.images.find(
                        (image) =>
                            image?.url
                    )?.url ||
                    tour.images[0]?.image_url ||
                    tour.images[0]?.url
                )
                : null
        );


    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    const hasPrice =
        tour.price !== null &&
        tour.price !== undefined &&
        tour.price !== "";


    const numericPrice =
        hasPrice
            ? Number(tour.price)
            : null;


    const hasValidPrice =
        numericPrice !== null &&
        Number.isFinite(numericPrice);


    const formattedPrice =
        hasValidPrice
            ? numericPrice.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }
            )
            : null;


    /*
    |--------------------------------------------------------------------------
    | CURRENCY
    |--------------------------------------------------------------------------
    */

    const currency =
        String(
            tour.currency || "USD"
        ).toUpperCase();


    const currencySymbol =
        currency === "USD"
            ? "$"
            : currency === "EUR"
                ? "€"
                : currency === "GBP"
                    ? "£"
                    : `${currency} `;


    /*
    |--------------------------------------------------------------------------
    | PRICING TYPE
    |--------------------------------------------------------------------------
    */

    const pricingType =
        String(
            tour.pricing_type || ""
        ).toUpperCase();


    /*
    |--------------------------------------------------------------------------
    | TOUR DATA
    |--------------------------------------------------------------------------
    */

    const destination =
        tour.destination_name ||
        tour.destination?.name ||
        tour.destination ||
        "Zanzibar";


    const duration =
        tour.duration ||
        "Flexible";


    const title =
        tour.title ||
        "Zanzibar Adventure";


    const description =
        tour.short_description ||
        tour.description ||
        "Discover an unforgettable Zanzibar experience with ZAN GATES ADVENTURES.";


    const tourSlug =
        tour.slug ||
        "";


    const isFeatured =
        tour.featured === true ||
        tour.featured === 1 ||
        tour.featured === "1";


    /*
    |--------------------------------------------------------------------------
    | IMAGE ERROR
    |--------------------------------------------------------------------------
    */

    const handleImageError = () => {
        setImageError(true);
    };


    return (
        <article className="tour-card">


            {/* =========================================================
                IMAGE
            ========================================================= */}

            <div className="tour-card-image">

                {imageUrl && !imageError ? (

                    <img
                        src={imageUrl}
                        alt={title}
                        className="tour-card-image-element"
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                    />

                ) : (

                    <div
                        className="tour-card-placeholder"
                        aria-hidden="true"
                    >

                        <span>
                            ZAN GATES
                        </span>

                        <strong>
                            ZANZIBAR
                        </strong>

                    </div>

                )}


                <div
                    className="tour-card-image-shade"
                    aria-hidden="true"
                />


                {isFeatured && (

                    <span className="tour-card-badge">

                        <span
                            className="tour-card-badge-dot"
                            aria-hidden="true"
                        />

                        {t("common.featured")}

                    </span>

                )}


                <span className="tour-card-image-label">
                    ZANZIBAR
                </span>

            </div>



            {/* =========================================================
                CONTENT
            ========================================================= */}

            <div className="tour-card-content">


                {/* -----------------------------------------------------
                    META
                ----------------------------------------------------- */}

                <div className="tour-card-meta">


                    <span>

                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            aria-hidden="true"
                            focusable="false"
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

                        <span>
                            {destination}
                        </span>

                    </span>


                    <span>

                        <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            aria-hidden="true"
                            focusable="false"
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

                        <span>
                            {duration}
                        </span>

                    </span>

                </div>



                {/* -----------------------------------------------------
                    TITLE
                ----------------------------------------------------- */}

                <h3>
                    {title}
                </h3>



                {/* -----------------------------------------------------
                    DESCRIPTION
                ----------------------------------------------------- */}

                <p className="tour-card-description">
                    {description}
                </p>



                {/* -----------------------------------------------------
                    FOOTER
                ----------------------------------------------------- */}

                <div className="tour-card-footer">


                    {/* PRICE */}

                    <div className="tour-card-price">

                        <span>
                            {t("common.from")}
                        </span>


                        {formattedPrice !== null ? (

                            <div>

                                <strong>
                                    {currencySymbol}
                                    {formattedPrice}
                                </strong>


                                {pricingType === "PER_PERSON" && (

                            <small>
                                {` / ${t("common.perPerson")}`}
                            </small>

                        )}

                    </div>

                ) : (

                    <strong>
                        {t("common.onRequest")}
                    </strong>

                )}

                    </div>



                    {/* VIEW TOUR */}

                    {tourSlug ? (

                        <Link
                            to={`/tours/${encodeURIComponent(tourSlug)}`}
                            className="tour-card-button"
                            aria-label={`${t("actions.viewTour")} ${title}`}
                        >

                            <span>
                                {t("actions.viewTour")}
                            </span>

                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                                focusable="false"
                            >

                                <path
                                    d="M5 12h13M13 6l6 6-6 6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                            </svg>

                        </Link>

                    ) : (

                        <span
                            className="tour-card-button tour-card-button-disabled"
                            aria-disabled="true"
                        >

                            <span>
                                {t("actions.viewTour")}
                            </span>

                        </span>

                    )}

                </div>

            </div>

        </article>
    );
};


export default TourCard;