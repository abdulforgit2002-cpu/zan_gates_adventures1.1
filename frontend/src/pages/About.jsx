import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


function About() {

    const {
        t,
    } = useTranslation();


    return (

        <main className="about-page">


            {/* =========================================================
                ABOUT HERO
            ========================================================= */}

            <section className="about-header">

                <div className="container">

                    <span className="tour-section-eyebrow">
                        {t("about.eyebrow")}
                    </span>


                    <h1>
                        {t("about.title")}
                    </h1>


                    <p>
                        {t("about.description")}
                    </p>

                </div>

            </section>


            {/* =========================================================
                OUR STORY
            ========================================================= */}

            <section className="about-story">

                <div className="container">

                    <div className="about-content-grid">


                        <div className="about-content">

                            <span className="tour-section-eyebrow">
                                {t("about.story.eyebrow")}
                            </span>


                            <h2>
                                {t("about.story.title")}
                            </h2>


                            <p>
                                {t("about.story.description")}
                            </p>


                            <p>
                                {t("about.story.descriptionTwo")}
                            </p>

                        </div>


                        <div className="about-highlight-card">

                            <span>
                                ZG
                            </span>


                            <strong>
                                {t("brand.name")}
                            </strong>


                            <small>
                                {t("brand.location")}
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                WHY US
            ========================================================= */}

            <section className="about-values">

                <div className="container">

                    <div className="about-section-heading">

                        <span className="tour-section-eyebrow">
                            {t("about.values.eyebrow")}
                        </span>


                        <h2>
                            {t("about.values.title")}
                        </h2>


                        <p>
                            {t("about.values.description")}
                        </p>

                    </div>


                    <div className="about-values-grid">


                        <article className="about-value-card">

                            <span className="about-value-number">
                                01
                            </span>


                            <h3>
                                {t("about.values.local.title")}
                            </h3>


                            <p>
                                {t("about.values.local.description")}
                            </p>

                        </article>


                        <article className="about-value-card">

                            <span className="about-value-number">
                                02
                            </span>


                            <h3>
                                {t("about.values.personal.title")}
                            </h3>


                            <p>
                                {t("about.values.personal.description")}
                            </p>

                        </article>


                        <article className="about-value-card">

                            <span className="about-value-number">
                                03
                            </span>


                            <h3>
                                {t("about.values.flexible.title")}
                            </h3>


                            <p>
                                {t("about.values.flexible.description")}
                            </p>

                        </article>


                    </div>

                </div>

            </section>


            {/* =========================================================
                EXPERIENCE
            ========================================================= */}

            <section className="about-experience">

                <div className="container">

                    <div className="about-experience-inner">

                        <span className="tour-section-eyebrow">
                            {t("about.experience.eyebrow")}
                        </span>


                        <h2>
                            {t("about.experience.title")}
                        </h2>


                        <p>
                            {t("about.experience.description")}
                        </p>

                    </div>

                </div>

            </section>


            {/* =========================================================
                CTA
            ========================================================= */}

            <section className="about-final-cta">

                <div className="container">

                    <div className="about-final-cta-inner">

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

                            {t("actions.exploreOurTours")}

                        </Link>

                    </div>

                </div>

            </section>

        </main>

    );
}


export default About;