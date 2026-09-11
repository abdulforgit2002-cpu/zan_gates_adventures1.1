import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


const SOCIAL_LINKS = [
    {
        type: "whatsapp",
        label: "WhatsApp",
        href: "https://wa.me/255658450092",
    },
    {
        type: "facebook",
        label: "Facebook",
        href: "https://www.facebook.com/share/19SBfqRvNk/?mibextid=wwXIfr",
    },
    {
        type: "instagram",
        label: "Instagram",
        href: "https://www.instagram.com/zanzibar_gates_safaris._?stkn=MWppNW9rYzU4ZGx3dg%3D%3D&utm_source=qr",
    },
    {
        type: "threads",
        label: "Threads",
        href: "https://www.threads.com/@zanzibar_gates_safaris._?igshid=NTc4MTIwNjQ2YQ==",
    },
];


function SocialIcon({ type }) {
    const commonProps = {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
    };

    switch (type) {
        case "whatsapp":
            return (
                <svg {...commonProps}>
                    <path d="M20.25 12.77A8.24 8.24 0 0 1 11.93 21c-1.38 0-2.72-.35-3.93-.99L3.75 20.25l1.26-4.21a8.2 8.2 0 0 1-1.3-4.28A8.25 8.25 0 0 1 20.25 12.77Z" />
                    <path d="M15.83 14.8c-.2-.1-1.2-.59-1.38-.66-.18-.07-.32-.1-.45.1-.14.2-.54.66-.66.8-.12.14-.24.16-.44.05-.2-.1-.85-.31-1.62-.99-.6-.53-1-1.19-1.12-1.38-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.34.07-.14.04-.26-.02-.36-.06-.1-.45-1.09-.62-1.49-.17-.4-.34-.34-.45-.34h-.39c-.13 0-.34.05-.52.25-.18.2-.7.68-.7 1.67s.72 1.93.82 2.06c.1.14 1.41 2.16 3.42 3.03 2.01.87 2.01.58 2.38.54.37-.04 1.2-.49 1.36-96.17-.16-.46-.3-.4-.51-.5Z" />
                </svg>
            );
        case "facebook":
            return (
                <svg {...commonProps}>
                    <path d="M14.5 8.5h2.25V4.75H14.5A4.75 4.75 0 0 0 9.75 9.5v2.25H7.5V14.5h2.25V20h3.5v-5.5h2.52l.48-2.75H13.25V9.5c0-.55.25-.99.1-1.5Z" />
                </svg>
            );
        case "instagram":
            return (
                <svg {...commonProps}>
                    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.25" cy="6.75" r="1" fill="currentColor" stroke="none" />
                </svg>
            );
        case "threads":
            return (
                <svg {...commonProps}>
                    <path d="M9.5 7.5c1.9-.9 4.2-.9 6.1 0 .7.4 1.3 1 1.7 1.7.7 1.1.8 2.5.3 3.7-.7 1.7-2.3 3.2-4.3 3.8-1.8.6-3.9.4-5.5-.7-1.4-1-2.2-2.7-2.1-4.5.1-1.6.9-3.2 2.4-4.1 1.4-.9 3.2-1.2 4.8-.9" />
                    <path d="M12.4 9.6c.9-.4 1.8-.2 2.5.5.4.4.6 1 .6 1.6 0 1.2-.9 2.1-2.1 2.5-1.2.3-2.4.1-3.4-.7" />
                </svg>
            );
        default:
            return null;
    }
}


function Contact() {
    const { t } = useTranslation();

    return (
        <main className="contact-page">

            <aside className="contact-social-rail" aria-label="Social media links">
                {SOCIAL_LINKS.map((link) => (
                    <a
                        key={link.type}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`contact-social-link contact-social-link--${link.type}`}
                        aria-label={link.label}
                        title={link.label}
                    >
                        <SocialIcon type={link.type} />
                    </a>
                ))}
            </aside>

            <section className="contact-header">
                <div className="container">
                    <span className="tour-section-eyebrow">{t("contact.eyebrow")}</span>
                    <h1>{t("contact.title")}</h1>
                    <p>{t("contact.description")}</p>
                </div>
            </section>

            <section className="contact-information">
                <div className="container">
                    <div className="contact-grid">

                        <article className="contact-card">
                            <span className="contact-card-label">TZ</span>
                            <h2>TANZANIA 🇹🇿</h2>
                            <div className="contact-card-list">
                                <a href="https://wa.me/255658450092" className="contact-card-link" target="_blank" rel="noreferrer">
                                    📲 WhatsApp: https://wa.me/255658450092
                                </a>
                                <a href="tel:+255658450092" className="contact-card-link">
                                    📞 Call: +255 658 450 092
                                </a>
                            </div>
                        </article>

                        <article className="contact-card">
                            <span className="contact-card-label">UK</span>
                            <h2>UNITED KINGDOM 🇬🇧</h2>
                            <div className="contact-card-list">
                                <a href="https://wa.me/447576096292" className="contact-card-link" target="_blank" rel="noreferrer">
                                    📲 WhatsApp: https://wa.me/447576096292
                                </a>
                                <a href="tel:+447576096292" className="contact-card-link">
                                    📞 Call: +44 7576 096292
                                </a>
                            </div>
                        </article>

                        <article className="contact-card">
                            <span className="contact-card-label">MSG</span>
                            <h2>{t("contact.email.title")}</h2>
                            <div className="contact-card-list">
                                <a href="https://m.me/zangatesadventures" className="contact-card-link" target="_blank" rel="noreferrer">
                                    💬 Messenger
                                </a>
                                <a href="mailto:adventures@zanzibargates.co.tz" className="contact-card-link">
                                    adventures@zanzibargates.co.tz
                                </a>
                                <a href="mailto:reservations@zanzibargates.co.tz" className="contact-card-link">
                                    reservations@zanzibargates.co.tz
                                </a>
                            </div>
                        </article>

                    </div>
                </div>
            </section>

            <section className="contact-enquiry">
                <div className="container">
                    <div className="contact-enquiry-inner">
                        <div>
                            <span className="tour-section-eyebrow">{t("contact.enquiry.eyebrow")}</span>
                            <h2>{t("contact.enquiry.title")}</h2>
                            <p>{t("contact.enquiry.description")}</p>
                        </div>

                        <Link to="/tours" className="primary-button">
                            {t("actions.exploreOurTours")}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="contact-final-cta">
                <div className="container">
                    <div className="contact-final-cta-inner">
                        <span className="tour-section-eyebrow">{t("home.finalCta.eyebrow")}</span>
                        <h2>{t("home.finalCta.title")}</h2>
                        <p>{t("home.finalCta.description")}</p>
                        <Link to="/tours" className="primary-button">
                            {t("actions.bookAdventure")}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}


export default Contact;