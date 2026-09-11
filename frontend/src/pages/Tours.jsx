import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getTours } from "../services/tourService";
import TourCard from "../components/TourCard";


function Tours() {

    const {
        t,
        i18n,
    } = useTranslation();


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
    | LOAD TOURS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let mounted = true;


        const loadTours = async () => {

            try {

                setLoading(true);
                setError("");


                const data =
                    await getTours();


                if (!mounted) {
                    return;
                }


                setTours(
                    Array.isArray(data)
                        ? data
                        : []
                );


            } catch (err) {

                console.error(
                    "Failed to load tours:",
                    err
                );


                if (!mounted) {
                    return;
                }


                setError(
                    err?.message ||
                    t("tours.error")
                );


            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        };


        loadTours();


        return () => {
            mounted = false;
        };

    }, [t, i18n.language]);


    return (

        <main className="tours-page">


            {/* =========================================================
                PAGE HERO
            ========================================================= */}

            <section className="tours-header">

                <div className="container">

                    <span className="tour-section-eyebrow">
                        {t("tours.eyebrow")}
                    </span>


                    <h1>
                        {t("tours.title")}
                    </h1>


                    <p>
                        {t("tours.description")}
                    </p>

                </div>

            </section>


            {/* =========================================================
                TOURS GRID
            ========================================================= */}

            <section
                className="tours-list"
                aria-labelledby="tours-list-title"
            >

                <div className="container">


                    <div className="tours-section-heading">

                        <span className="tour-section-eyebrow">
                            {t("home.experiences.eyebrow")}
                        </span>


                        <h2 id="tours-list-title">
                            {t("home.experiences.title")}
                        </h2>


                        <p>
                            {t("home.experiences.description")}
                        </p>

                    </div>


                    {/* -------------------------------------------------
                        LOADING
                    ------------------------------------------------- */}

                    {loading && (

                        <div
                            className="tours-state"
                            role="status"
                            aria-live="polite"
                        >

                            <div
                                className="tours-loading-spinner"
                                aria-hidden="true"
                            />

                            <p>
                                {t("tours.loading")}
                            </p>

                        </div>

                    )}


                    {/* -------------------------------------------------
                        ERROR
                    ------------------------------------------------- */}

                    {!loading && error && (

                        <div
                            className="tours-state tours-state-error"
                            role="alert"
                        >

                            <p>
                                {error}
                            </p>

                        </div>

                    )}


                    {/* -------------------------------------------------
                        EMPTY
                    ------------------------------------------------- */}

                    {!loading &&
                        !error &&
                        tours.length === 0 && (

                            <div
                                className="tours-state"
                                role="status"
                            >

                                <p>
                                    {t("tours.empty")}
                                </p>

                            </div>

                        )}


                    {/* -------------------------------------------------
                        TOUR CARDS
                    ------------------------------------------------- */}

                    {!loading &&
                        !error &&
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

                </div>

            </section>


            {/* =========================================================
                CALL TO ACTION
            ========================================================= */}

            <section className="tours-final-cta">

                <div className="container">

                    <div className="tours-final-cta-inner">

                        <span className="tour-section-eyebrow">
                            {t("home.finalCta.eyebrow")}
                        </span>


                        <h2>
                            {t("home.finalCta.title")}
                        </h2>


                        <p>
                            {t("home.finalCta.description")}
                        </p>


                        <Link
                            to="/#tours"
                            className="primary-button"
                        >

                            <span>
                                {t("home.finalCta.button")}
                            </span>

                        </Link>

                    </div>

                </div>

            </section>

        </main>

    );
}


export default Tours;