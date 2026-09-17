import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* =========================================================
   WHAT WE DO — Content Data
   ========================================================= */

const SERVICES = [
    {
        number: "01",
        titleKey: "about.values.excursions.title",
        descriptionKey: "about.values.excursions.description",
        defaultTitle: "Zanzibar Excursions",
        defaultDescription:
            "We organize all activities in Zanzibar and we make sure that your stay in Zanzibar is unforgettable.",
    },
    {
        number: "02",
        titleKey: "about.values.wildlife.title",
        descriptionKey: "about.values.wildlife.description",
        defaultTitle: "Wildlife Tours & Safaris",
        defaultDescription:
            "We organize all wildlife safari trips in Tanzania mainland from Zanzibar, with flights departing from Zanzibar airport (Abeid Amani Karume International Airport) to the very best parks and game reserves which are every African adventurer's desire to witness.",
    },
    {
        number: "03",
        titleKey: "about.values.transfers.title",
        descriptionKey: "about.values.transfers.description",
        defaultTitle: "Transfer Services",
        defaultDescription:
            "We offer trusted transfer services in Zanzibar.",
    },
];


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
                                {t("about.story.eyebrow", "WHO WE ARE")}
                            </span>


                            <h2>
                                {t("about.story.title", "A travel & tour company based in Zanzibar.")}
                            </h2>


                            <p>
                                {t(
                                    "about.story.description",
                                    "Zanzibar Gates Tours & Safaris operates all activities in Zanzibar, transfer services, and wildlife safaris in Tanzania mainland."
                                )}
                            </p>


                            <p>
                                {t(
                                    "about.story.descriptionTwo",
                                    "The company is managed by an experienced local guide whose aim is to ensure mutual benefit between the locals and the visitors."
                                )}
                            </p>


                            <p>
                                {t(
                                    "about.story.descriptionThree",
                                    "We are dedicated to providing a better and unforgettable experience for our clients as well as ensuring the environment is protected and safe. As a company, we believe environment conservation is a duty to all — both the tourism stakeholders and the visitors."
                                )}
                            </p>


                            <p>
                                {t(
                                    "about.story.descriptionFour",
                                    "As a company we are always ready to share new knowledge and experience concerning tourism issues and the environment at large. We are always ready to explore the beauty of our country together with our clients."
                                )}
                            </p>

                        </div>


                        <div className="about-highlight-card">

                            <img
                                src="https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg"
                                alt="ZAN GATES Adventures logo"
                                className="about-highlight-logo"
                                loading="lazy"
                                decoding="async"
                            />


                            <strong>
                                {t("about.motto", "Environment conservation is for all.")}
                            </strong>


                            <small>
                                {t("about.mottoLabel", "Our Motto")}
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                WHAT WE DO
            ========================================================= */}

            <section className="about-values">

                <div className="container">

                    <div className="about-section-heading">

                        <span className="tour-section-eyebrow">
                            {t("about.values.eyebrow", "WHAT WE DO")}
                        </span>


                        <h2>
                            {t("about.values.title", "Experiences crafted for you.")}
                        </h2>


                        <p>
                            {t(
                                "about.values.description",
                                "From island excursions to mainland safaris and reliable airport transfers — we handle every detail of your Tanzanian journey."
                            )}
                        </p>

                    </div>


                    <div className="about-values-grid">

                        {SERVICES.map((service) => (

                            <article
                                key={service.number}
                                className="about-value-card"
                            >

                                <span className="about-value-number">
                                    {service.number}
                                </span>


                                <h3>
                                    {t(service.titleKey, service.defaultTitle)}
                                </h3>


                                <p>
                                    {t(
                                        service.descriptionKey,
                                        service.defaultDescription
                                    )}
                                </p>

                            </article>

                        ))}

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