import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* =========================================================
   CONTACT
   Premium, modern contact page.
   ========================================================= */

const QUICK_ACTIONS = [
  {
    key: "whatsapp-tz",
    label: "WhatsApp Tanzania",
    sub: "+255 658 450 092",
    href: "https://wa.me/255658450092",
    icon: "whatsapp",
    tone: "whatsapp",
  },
  {
    key: "whatsapp-uk",
    label: "WhatsApp UK",
    sub: "+44 7576 096292",
    href: "https://wa.me/447576096292",
    icon: "whatsapp",
    tone: "whatsapp-uk",
  },
  {
    key: "call-tz",
    label: "Call Tanzania",
    sub: "+255 658 450 092",
    href: "tel:+255658450092",
    icon: "phone",
    tone: "phone",
  },
  {
    key: "email",
    label: "Email Us",
    sub: "adventures@zanzibargates.co.tz",
    href: "mailto:adventures@zanzibargates.co.tz",
    icon: "mail",
    tone: "email",
  },
];

const CONTACT_CARDS = [
  {
    key: "tz",
    badge: "TZ",
    title: "Tanzania",
    flag: "🇹🇿",
    accent: "tz",
    rows: [
      {
        icon: "whatsapp",
        label: "WhatsApp",
        value: "+255 658 450 092",
        href: "https://wa.me/255658450092",
      },
      {
        icon: "phone",
        label: "Call",
        value: "+255 658 450 092",
        href: "tel:+255658450092",
      },
    ],
  },
  {
    key: "uk",
    badge: "UK",
    title: "United Kingdom",
    flag: "🇬🇧",
    accent: "uk",
    rows: [
      {
        icon: "whatsapp",
        label: "WhatsApp",
        value: "+44 7576 096292",
        href: "https://wa.me/447576096292",
      },
      {
        icon: "phone",
        label: "Call",
        value: "+44 7576 096292",
        href: "tel:+447576096292",
      },
    ],
  },
  {
    key: "msg",
    badge: "MSG",
    title: "Email & Messenger",
    flag: "",
    accent: "msg",
    rows: [
      {
        icon: "messenger",
        label: "Messenger",
        value: "ZAN Gates Adventures",
        href: "https://m.me/zangatesadventures",
      },
      {
        icon: "mail",
        label: "Adventures",
        value: "adventures@zanzibargates.co.tz",
        href: "mailto:adventures@zanzibargates.co.tz",
      },
      {
        icon: "mail",
        label: "Reservations",
        value: "reservations@zanzibargates.co.tz",
        href: "mailto:reservations@zanzibargates.co.tz",
      },
    ],
  },
];

function ContactIcon({ type }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true",
    focusable: "false",
  };

  switch (type) {
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01s-.43.06-.66.31c-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.17 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.25 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17.9 17.9 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.25 1.1L6.6 10.8z" />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13zm2.4.6a.5.5 0 0 0-.4.4v.3L12 12l7-5.2v-.3a.5.5 0 0 0-.4-.4H5.4zm-.4 2.1v10.3c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V8.2l-6.8 5a1 1 0 0 1-1.2 0L5 8.2z" />
        </svg>
      );

    case "messenger":
      return (
        <svg {...common}>
          <path d="M12 2C6.5 2 2 6.2 2 11.4c0 3 1.4 5.7 3.7 7.5V22l3.4-1.9c.9.2 1.9.3 2.9.3 5.5 0 10-4.2 10-9.4S17.5 2 12 2zm1 12.6-2.5-2.7-5 2.7L11 9.4l2.6 2.7 4.9-2.7-5.5 5.2z" />
        </svg>
      );

    case "map-pin":
      return (
        <svg {...common}>
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm.75 5v5.44l3.75 2.25-.75 1.31L11.25 13.4V7z" />
        </svg>
      );

    default:
      return null;
  }
}

function Contact() {
  const { t } = useTranslation();

  return (
    <main className="contact-page contact-page--premium">
      {/* ---------------------------------------------------
          HERO
         --------------------------------------------------- */}
      <section className="contact-hero">
        <div className="contact-hero-bg" aria-hidden="true" />
        <div className="contact-hero-overlay" aria-hidden="true" />

        <div className="container contact-hero-inner">
          <span className="contact-hero-eyebrow">
            {t("contact.eyebrow", "Contact Us")}
          </span>
          <h1 className="contact-hero-title">
            {t(
              "contact.title",
              "Let's Plan Your Zanzibar Adventure"
            )}
          </h1>
          <p className="contact-hero-subtitle">
            {t(
              "contact.description",
              "Have a question, need help choosing a tour, or ready to plan your Zanzibar experience? Contact our team and we will be happy to assist you."
            )}
          </p>
        </div>

        {/* Quick actions directly under hero */}
        <div className="container contact-hero-actions">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.key}
              href={action.href}
              target={action.href.startsWith("http") ? "_blank" : undefined}
              rel={action.href.startsWith("http") ? "noreferrer" : undefined}
              className={`contact-quick contact-quick--${action.tone}`}
            >
              <span className="contact-quick-icon">
                <ContactIcon type={action.icon} />
              </span>
              <span className="contact-quick-text">
                <span className="contact-quick-label">{action.label}</span>
                <span className="contact-quick-sub">{action.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------
          CONTACT CARDS
         --------------------------------------------------- */}
      <section className="contact-channels">
        <div className="container">
          <div className="contact-channels-heading">
            <span className="contact-section-eyebrow">Reach Out</span>
            <h2 className="contact-section-title">
              Three ways to get in touch
            </h2>
            <p className="contact-section-sub">
              Choose whichever suits you best — we reply on WhatsApp
              within minutes during office hours.
            </p>
          </div>

          <div className="contact-channels-grid">
            {CONTACT_CARDS.map((card) => (
              <article
                key={card.key}
                className={`contact-card contact-card--${card.accent}`}
              >
                <header className="contact-card-head">
                  <span className="contact-card-badge">{card.badge}</span>
                  <h3 className="contact-card-title">
                    {card.title}
                    {card.flag ? (
                      <span className="contact-card-flag">{card.flag}</span>
                    ) : null}
                  </h3>
                </header>

                <ul className="contact-card-rows">
                  {card.rows.map((row) => (
                    <li key={row.value}>
                      <a
                        href={row.href}
                        target={
                          row.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          row.href.startsWith("http")
                            ? "noreferrer"
                            : undefined
                        }
                        className="contact-row"
                      >
                        <span className="contact-row-icon">
                          <ContactIcon type={row.icon} />
                        </span>
                        <span className="contact-row-text">
                          <span className="contact-row-label">
                            {row.label}
                          </span>
                          <span className="contact-row-value">
                            {row.value}
                          </span>
                        </span>
                        <span className="contact-row-arrow" aria-hidden="true">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          TRUST STRIP — hours + response time
         --------------------------------------------------- */}
      <section className="contact-trust">
        <div className="container contact-trust-inner">
          <div className="contact-trust-item">
            <span className="contact-trust-icon">
              <ContactIcon type="clock" />
            </span>
            <div>
              <strong>Office Hours</strong>
              <span>Mon – Sat · 08:00 – 20:00 (EAT)</span>
            </div>
          </div>

          <div className="contact-trust-item">
            <span className="contact-trust-icon">
              <ContactIcon type="map-pin" />
            </span>
            <div>
              <strong>Based in</strong>
              <span>Zanzibar · Tanzania</span>
            </div>
          </div>

          <div className="contact-trust-item">
            <span className="contact-trust-icon">
              <ContactIcon type="whatsapp" />
            </span>
            <div>
              <strong>Response Time</strong>
              <span>Usually within 15 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          CTA 1 — Explore Tours
         --------------------------------------------------- */}
      <section className="contact-cta contact-cta--light">
        <div className="container">
          <div className="contact-cta-inner">
            <div className="contact-cta-text">
              <span className="contact-section-eyebrow">
                {t("contact.enquiry.eyebrow", "Need inspiration?")}
              </span>
              <h2>{t("contact.enquiry.title", "Browse Our Tour Packages")}</h2>
              <p>
                {t(
                  "contact.enquiry.description",
                  "Explore our curated selection of tours across Zanzibar."
                )}
              </p>
            </div>
            <Link to="/tours" className="contact-cta-button contact-cta-button--primary">
              {t("actions.exploreOurTours", "Explore Our Tours")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          CTA 2 — Book Now (dark, brand)
         --------------------------------------------------- */}
      <section className="contact-cta contact-cta--dark">
        <div className="container">
          <div className="contact-cta-inner">
            <div className="contact-cta-text">
              <span className="contact-section-eyebrow">
                {t(
                  "home.finalCta.eyebrow",
                  "Your Zanzibar story starts here"
                )}
              </span>
              <h2>
                {t("home.finalCta.title", "Ready to discover Zanzibar?")}
              </h2>
              <p>
                {t(
                  "home.finalCta.description",
                  "Choose your experience and let the island do the rest."
                )}
              </p>
            </div>
            <Link to="/tours" className="contact-cta-button contact-cta-button--light">
              {t("actions.bookAdventure", "Book Your Adventure")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;