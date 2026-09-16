import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHotelBySlug } from "../data/hotels";

/* =========================================================
   CONTACT CHANNELS
   Change these once and every hotel page updates.
   ========================================================= */

const WHATSAPP_NUMBER = "255759028881"; // +255 759 028 881 → no +, no spaces
const INSTAGRAM_HANDLE = "zanzibargates"; // @zanzibargates
const FACEBOOK_PAGE = "https://www.facebook.com/zanzibargates";

/* Build a WhatsApp deep link with a prefilled message */
const buildWhatsAppLink = (hotelName) => {
  const message = `Hello ZAN GATES Adventures Tours & Safaris, I'd like to enquire about staying at ${hotelName}. Could you please share availability, rates and package options?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

function HotelDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();

  const hotel = useMemo(() => getHotelBySlug(slug), [slug]);

  /* Lightbox state */
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  /* Keyboard nav while lightbox is open */
  useEffect(() => {
    if (!hotel) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") setLightboxIndex(-1);
      if (event.key === "ArrowRight" && lightboxIndex >= 0) {
        setLightboxIndex((i) => (i + 1) % hotel.images.length);
      }
      if (event.key === "ArrowLeft" && lightboxIndex >= 0) {
        setLightboxIndex(
          (i) => (i - 1 + hotel.images.length) % hotel.images.length
        );
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [hotel, lightboxIndex]);

  /* Lock body scroll while lightbox open */
  useEffect(() => {
    if (lightboxIndex >= 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  if (!hotel) {
    return (
      <div className="hotel-detail-page">
        <header className="hotel-detail-header">
          <div className="container">
            <nav className="hotel-detail-breadcrumb">
              <Link to="/">{t("navigation.home", "Home")}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/hotels">
                {t("navigation.hotels", "Hotels")}
              </Link>
            </nav>
            <h1>{t("hotelDetail.notFound", "Hotel not found")}</h1>
          </div>
        </header>

        <section className="hotel-detail-content">
          <div className="container hotel-detail-empty">
            <p>
              {t(
                "hotelDetail.notFoundBody",
                "We couldn't find that hotel. Browse our full collection instead."
              )}
            </p>
            <Link to="/hotels" className="primary-button">
              {t("hotelDetail.back", "Back to all hotels")}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const whatsappLink = buildWhatsAppLink(hotel.name);

  return (
    <div className="hotel-detail-page">
      <header className="hotel-detail-header">
        <div className="container">
          <nav className="hotel-detail-breadcrumb">
            <Link to="/">{t("navigation.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/hotels">{t("navigation.hotels", "Hotels")}</Link>
            <span aria-hidden="true">/</span>
            <strong>{hotel.name}</strong>
          </nav>
          <span className="hotel-detail-location">{hotel.location}</span>
          <h1>{hotel.name}</h1>
          <p>{hotel.tagline}</p>
        </div>
      </header>

      <section className="hotel-detail-gallery">
        <div className="container">
          <div className="hotel-gallery-grid">
            {hotel.images.map((src, index) => (
              <button
                key={src}
                type="button"
                className={`hotel-gallery-item${
                  index === 0 ? " hotel-gallery-primary" : ""
                }`}
                onClick={() => setLightboxIndex(index)}
                aria-label={`${t(
                  "hotelDetail.openImage",
                  "Open image"
                )} ${index + 1}`}
              >
                <img src={src} alt={`${hotel.name} — view ${index + 1}`} />
                <span className="hotel-gallery-overlay">
                  {t("hotelDetail.viewImage", "View image")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="hotel-detail-content">
        <div className="container">
          <div className="hotel-detail-layout">
            <div className="hotel-detail-main">
              <section className="hotel-detail-section">
                <span className="tour-section-label">
                  {t("hotelDetail.aboutLabel", "ABOUT THE HOTEL")}
                </span>
                <h2>{hotel.name}</h2>
                <p>{hotel.description}</p>
              </section>

              <section className="hotel-detail-section">
                <span className="tour-section-label">
                  {t("hotelDetail.highlightsLabel", "HIGHLIGHTS")}
                </span>
                <h2>{t("hotelDetail.highlights", "What makes it special")}</h2>
                <ul className="hotel-highlights-list">
                  {hotel.highlights.map((h) => (
                    <li key={h}>
                      <span className="hotel-highlight-check" aria-hidden="true">
                        ✓
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="hotel-detail-sidebar">
              <div className="hotel-sidebar-card">
                <span className="hotel-sidebar-label">
                  {t("hotelDetail.planLabel", "PLAN YOUR STAY")}
                </span>
                <h3>{hotel.name}</h3>
                <p>
                  {t(
                    "hotelDetail.planBody",
                    "This hotel is featured in one or more of our tours and packages. Get in touch to add it to your itinerary."
                  )}
                </p>

                {/* ============ PRIMARY CTA — WHATSAPP ============ */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hotel-sidebar-button"
                  aria-label={`Enquire about ${hotel.name} on WhatsApp`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01s-.43.06-.66.31c-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.17 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.51.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z" />
                  </svg>
                  {t("hotelDetail.enquire", "Enquire about this stay")}
                </a>

                {/* ============ SECONDARY — Instagram + Facebook ============ */}
                <div className="hotel-sidebar-socials">
                  <a
                    href={`https://www.instagram.com/${INSTAGRAM_HANDLE}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hotel-sidebar-social hotel-sidebar-social--instagram"
                    aria-label={`Message ${hotel.name} on Instagram`}
                    title="Instagram"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.17 15.58 2.16 15.2 2.16 12c0-3.2.01-3.58.07-4.85.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
                    </svg>
                    Instagram
                  </a>

                  <a
                    href={FACEBOOK_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hotel-sidebar-social hotel-sidebar-social--facebook"
                    aria-label={`Message ${hotel.name} on Facebook`}
                    title="Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.45-4.92 8.45-9.94z" />
                    </svg>
                    Facebook
                  </a>
                </div>

                <Link to="/hotels" className="hotel-sidebar-back">
                  {t("hotelDetail.back", "Back to all hotels")}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {lightboxIndex >= 0 && (
        <div
          className="hotel-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(-1)}
        >
          <button
            type="button"
            className="hotel-lightbox-close"
            onClick={() => setLightboxIndex(-1)}
            aria-label={t("accessibility.close", "Close")}
          >
            ×
          </button>

          <button
            type="button"
            className="hotel-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(
                (i) => (i - 1 + hotel.images.length) % hotel.images.length
              );
            }}
            aria-label={t("accessibility.previous", "Previous")}
          >
            ‹
          </button>

          <div
            className="hotel-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={hotel.images[lightboxIndex]}
              alt={`${hotel.name} — view ${lightboxIndex + 1}`}
            />
            <p className="hotel-lightbox-counter">
              {lightboxIndex + 1} / {hotel.images.length}
            </p>
          </div>

          <button
            type="button"
            className="hotel-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i + 1) % hotel.images.length);
            }}
            aria-label={t("accessibility.next", "Next")}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default HotelDetailPage;