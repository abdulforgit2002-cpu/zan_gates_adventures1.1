import {
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";


const TourCard = ({ tour }) => {

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
    | PRICING
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
                        loading="lazy"
                        decoding="async"
                        onError={() =>
                            setImageError(true)
                        }
                    />

                ) : (

                    <div className="tour-card-placeholder">

                        <span>
                            ZAN GATES
                        </span>

                        <strong>
                            ZANZIBAR
                        </strong>

                    </div>

                )}


                <div className="tour-card-image-shade" />


                {isFeatured && (

                    <span className="tour-card-badge">

                        <span className="tour-card-badge-dot" />

                        Featured

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


                <div className="tour-card-meta">

                    <span>

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

                        {destination}

                    </span>


                    <span>

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

                        {duration}

                    </span>

                </div>



                <h3>
                    {title}
                </h3>


                <p className="tour-card-description">
                    {description}
                </p>



                <div className="tour-card-footer">


                    <div className="tour-card-price">

                        <span>
                            From
                        </span>


                        {formattedPrice !== null ? (

                            <div>

                                <strong>
                                    {currencySymbol}
                                    {formattedPrice}
                                </strong>


                                {pricingType === "PER_PERSON" && (

                                    <small>
                                        / person
                                    </small>

                                )}

                            </div>

                        ) : (

                            <strong>
                                On Request
                            </strong>

                        )}

                    </div>



                    {tourSlug ? (

                        <Link
                            to={`/tours/${encodeURIComponent(tourSlug)}`}
                            className="tour-card-button"
                        >
                            <span>
                                View Tour
                            </span>

                            <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
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
                            className="tour-card-button"
                            aria-disabled="true"
                        >
                            View Tour
                        </span>

                    )}

                </div>

            </div>

        </article>
    );
};


export default TourCard;