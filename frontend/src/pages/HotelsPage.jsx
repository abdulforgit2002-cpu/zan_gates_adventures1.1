import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HOTELS from "../data/hotels";

function HotelsPage() {
  const { t } = useTranslation();

  return (
    <div className="hotels-page">
      <header className="hotels-header">
        <div className="container">
          <span className="tour-section-eyebrow">
            {t("hotels.eyebrow", "Hotels")}
          </span>
          <h1>
            {t("hotels.title", "Handpicked Stays, Perfectly Placed")}
          </h1>
          <p>
            {t(
              "hotels.subtitle",
              "From Karatu lodges on the Northern Safari Circuit to boutique beachfront properties in Nungwi and Jambiani — every stay is chosen for comfort, location, and character."
            )}
          </p>
        </div>
      </header>

      <section className="hotels-list">
        <div className="container">
          <div className="hotels-grid">
            {HOTELS.map((hotel) => (
              <article key={hotel.slug} className="hotel-card">
                <div className="hotel-card-image">
                  {hotel.images[0] ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="hotel-card-placeholder">
                      <span>{hotel.location}</span>
                    </div>
                  )}
                  <div className="hotel-card-image-shade" />
                </div>

                <div className="hotel-card-content">
                  <span className="hotel-card-location">
                    {hotel.location}
                  </span>
                  <h2 className="hotel-card-title">{hotel.name}</h2>
                  <p className="hotel-card-tagline">{hotel.tagline}</p>

                  <Link
                    to={`/hotels/${encodeURIComponent(hotel.slug)}`}
                    className="hotel-card-link"
                  >
                    {t("hotels.viewHotel", "View hotel")}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HotelsPage;