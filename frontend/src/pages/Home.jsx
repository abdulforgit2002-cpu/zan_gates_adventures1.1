import { useEffect, useState } from "react";

import { getTours } from "../services/tourService";
import TourCard from "../components/TourCard";

const Home = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTours = async () => {
            try {
                setLoading(true);
                setError("");

                const tourData = await getTours();

                /*
                 * Always make sure tours is an array.
                 *
                 * This prevents:
                 *
                 * Cannot read properties of undefined
                 * (reading 'length')
                 */
                setTours(
                    Array.isArray(tourData)
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
                    "Unable to load tours. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTours();
    }, []);

    return (
        <main>

            {/* ==================================================
                HERO SECTION
            ================================================== */}

            <section className="hero">

                <div className="hero-content">

                    <span className="hero-eyebrow">
                        DISCOVER ZANZIBAR
                    </span>

                    <h1>
                        Your Gateway to
                        <span> Zanzibar Adventures</span>
                    </h1>

                    <p>
                        Explore breathtaking beaches,
                        crystal-clear waters, rich culture
                        and unforgettable island experiences
                        with Zan Gates Adventures.
                    </p>

                    <div className="hero-actions">

                        <a
                            href="#tours"
                            className="primary-button"
                        >
                            Explore Tours
                        </a>

                        <a
                            href="#about"
                            className="secondary-button"
                        >
                            Discover Zanzibar
                        </a>

                    </div>

                </div>

            </section>


            {/* ==================================================
                FEATURED TOURS
            ================================================== */}

            <section
                id="tours"
                className="tours-section"
            >

                <div className="section-heading">

                    <span>
                        OUR EXPERIENCES
                    </span>

                    <h2>
                        Explore Our Popular Tours
                    </h2>

                    <p>
                        Discover carefully selected
                        experiences designed to make
                        your Zanzibar journey unforgettable.
                    </p>

                </div>


                {/* ==================================================
                    LOADING STATE
                ================================================== */}

                {loading && (

                    <div className="loading-state">

                        <p>
                            Discovering our best experiences...
                        </p>

                    </div>

                )}


                {/* ==================================================
                    ERROR STATE
                ================================================== */}

                {!loading && error && (

                    <div className="error-state">

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


                {/* ==================================================
                    TOURS
                ================================================== */}

                {!loading &&
                    !error &&
                    Array.isArray(tours) &&
                    tours.length > 0 && (

                    <div className="tours-grid">

                        {tours.map((tour) => (

                            <TourCard
                                key={tour.id}
                                tour={tour}
                            />

                        ))}

                    </div>

                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!loading &&
                    !error &&
                    Array.isArray(tours) &&
                    tours.length === 0 && (

                    <div className="empty-state">

                        <p>
                            No tours are currently available.
                        </p>

                    </div>

                )}

            </section>


            {/* ==================================================
                WHY ZAN GATES SECTION
            ================================================== */}

            <section
                id="about"
                className="about-section"
            >

                <div className="about-content">

                    <span>
                        WHY ZAN GATES?
                    </span>

                    <h2>
                        Experience Zanzibar
                        Beyond the Ordinary
                    </h2>

                    <p>
                        From ocean adventures and cultural
                        discoveries to wildlife experiences,
                        we help travelers explore Zanzibar
                        through authentic and memorable
                        experiences.
                    </p>

                </div>

            </section>

        </main>
    );
};

export default Home;