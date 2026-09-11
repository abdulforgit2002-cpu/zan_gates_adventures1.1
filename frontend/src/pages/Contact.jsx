import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


function Contact() {

    const {
        t,
    } = useTranslation();


    return (

        <main className="contact-page">


            {/* =========================================================
                CONTACT HERO
            ========================================================= */}

            <section className="contact-header">

                <div className="container">

                    <span className="tour-section-eyebrow">
                        {t("contact.eyebrow")}
                    </span>


                    <h1>
                        {t("contact.title")}
                    </h1>


                    <p>
                        {t("contact.description")}
                    </p>

                </div>

            </section>


            {/* =========================================================
                CONTACT INFORMATION
            ========================================================= */}

            <section className="contact-information">

                <div className="container">

                    <div className="contact-grid">


                        {/* -------------------------------------------------
                            EMAIL
                        ------------------------------------------------- */}

                        <article className="contact-card">

                            <span className="contact-card-label">
                                01
                            </span>


                            <h2>
                                {t("contact.email.title")}
                            </h2>


                            <p>
                                {t("contact.email.description")}
                            </p>


                            <a
                                href="mailto:info@zangatesadventures.com"
                                className="contact-card-link"
                            >
                                info@zangatesadventures.com
                            </a>

                        </article>


                        {/* -------------------------------------------------
                            PHONE
                        ------------------------------------------------- */}

                        <article className="contact-card">

                            <span className="contact-card-label">
                                02
                            </span>


                            <h2>
                                {t("contact.phone.title")}
                            </h2>


                            <p>
                                {t("contact.phone.description")}
                            </p>


                            <a
                                href="tel:+255000000000"
                                className="contact-card-link"
                            >
                                +255 ...
                            </a>

                        </article>


                        {/* -------------------------------------------------
                            LOCATION
                        ------------------------------------------------- */}

                        <article className="contact-card">

                            <span className="contact-card-label">
                                03
                            </span>


                            <h2>
                                {t("contact.location.title")}
                            </h2>


                            <p>
                                {t("contact.location.description")}
                            </p>


                            <span className="contact-card-link">
                                Zanzibar, Tanzania
                            </span>

                        </article>

                    </div>

                </div>

            </section>


            {/* =========================================================
                ENQUIRY SECTION
            ========================================================= */}

            <section className="contact-enquiry">

                <div className="container">

                    <div className="contact-enquiry-inner">

                        <div>

                            <span className="tour-section-eyebrow">
                                {t("contact.enquiry.eyebrow")}
                            </span>


                            <h2>
                                {t("contact.enquiry.title")}
                            </h2>


                            <p>
                                {t("contact.enquiry.description")}
                            </p>

                        </div>


                        <Link
                            to="/tours"
                            className="primary-button"
                        >

                            {t("actions.exploreOurTours")}

                        </Link>

                    </div>

                </div>

            </section>


            {/* =========================================================
                FINAL CTA
            ========================================================= */}

            <section className="contact-final-cta">

                <div className="container">

                    <div className="contact-final-cta-inner">

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
                            to="/tours"
                            className="primary-button"
                        >

                            {t("actions.bookAdventure")}

                        </Link>

                    </div>

                </div>

            </section>

        </main>

    );
}


export default Contact;