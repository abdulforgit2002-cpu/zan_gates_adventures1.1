import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHotelBySlug } from "../data/hotels";

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
                <Link to="/contact" className="hotel-sidebar-button">
                  {t("hotelDetail.enquire", "Enquire about this stay")}
                </Link>
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