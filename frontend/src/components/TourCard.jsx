import { Link } from "react-router-dom";


const TourCard = ({ tour }) => {

    /*
     * The /api/tours endpoint returns:
     *
     * price
     * currency
     * pricing_type
     *
     * directly inside the tour object.
     */

    const hasPrice =
        tour.price !== null &&
        tour.price !== undefined &&
        tour.price !== "";


    const numericPrice = hasPrice
        ? Number(tour.price)
        : null;


    const formattedPrice =
        numericPrice !== null && !Number.isNaN(numericPrice)
            ? numericPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : null;


    /*
     * Currency display
     */
    const currencySymbol =
        tour.currency === "USD"
            ? "$"
            : tour.currency
                ? `${tour.currency} `
                : "";


    return (
        <article className="tour-card">


            {/* ==================================================
                TOUR IMAGE / PLACEHOLDER
            ================================================== */}

            <div className="tour-card-image">

                <div className="tour-card-placeholder">
                    Zanzibar
                </div>


                {/* FEATURED BADGE */}

                {tour.featured && (
                    <span className="tour-card-badge">
                        Featured
                    </span>
                )}

            </div>



            {/* ==================================================
                TOUR CONTENT
            ================================================== */}

            <div className="tour-card-content">


                {/* ==================================================
                    DESTINATION + DURATION
                ================================================== */}

                <div className="tour-card-meta">

                    <span>
                        📍 {tour.destination_name}
                    </span>


                    <span>
                        ⏱ {tour.duration}
                    </span>

                </div>



                {/* ==================================================
                    TOUR TITLE
                ================================================== */}

                <h3>
                    {tour.title}
                </h3>



                {/* ==================================================
                    SHORT DESCRIPTION
                ================================================== */}

                <p>
                    {tour.short_description}
                </p>



                {/* ==================================================
                    CARD FOOTER
                ================================================== */}

                <div className="tour-card-footer">


                    {/* ==================================================
                        PRICE
                    ================================================== */}

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


                                {tour.pricing_type === "PER_PERSON" && (
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



                    {/* ==================================================
                        VIEW TOUR
                    ================================================== */}

                    <Link
                        to={`/tours/${tour.slug}`}
                        className="tour-card-button"
                    >
                        View Tour
                    </Link>

                </div>

            </div>

        </article>
    );
};


export default TourCard;