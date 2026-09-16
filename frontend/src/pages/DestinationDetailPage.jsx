import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTours } from "../services/tourService";

/* Slug → display name (reverse of the map in DestinationsPage) */
const SLUG_TO_NAME = {
  "tarangire-national-park": "Tarangire National Park",
  "serengeti-national-park": "Serengeti National Park",
  "selous-game-reserve": "Selous Game Reserve",
  "safari-blue": "Safari Blue",
  "prison-island": "Prison Island",
  "nungwi": "Nungwi",
  "ngorongoro-crater": "Ngorongoro Conservation Area",
  "nakupenda-sandbank": "Nakupenda Sandbank",
  "mnemba-island": "Mnemba Island",
};

const normalizeString = (value) =>
  String(value || "").toLowerCase().trim();

const getTourDestination = (tour) =>
  tour?.destination_name ||
  tour?.destination?.name ||
  tour?.destination ||
  "";

const getTourPrice = (tour) => {
  const p =
    tour?.price ??
    tour?.base_price ??
    tour?.from_price ??
    tour?.group_prices?.[0]?.price;
  const num = Number(p);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const getTourImage = (tour) =>
  tour?.primary_image ||
  tour?.image_url ||
  tour?.images?.[0]?.image_url ||
  tour?.images?.[0]?.url ||
  null;

function DestinationDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const destinationName = useMemo(() => {
    if (!slug) return "";
    if (SLUG_TO_NAME[slug]) return SLUG_TO_NAME[slug];
    return slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }, [slug]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getTours();

        if (!mounted) return;

        let list = [];

        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.tours)) list = data.tours;
        else if (Array.isArray(data?.data?.tours)) list = data.data.tours;
        else if (Array.isArray(data?.results)) list = data.results;
        else if (data && typeof data === "object") {
          const arr = Object.values(data).find((v) => Array.isArray(v));
          if (arr) list = arr;
        }

        setTours(list);
      } catch (err) {
        console.error("[DestinationDetailPage] load error:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const target = normalizeString(destinationName);
    return tours.filter(
      (tour) => normalizeString(getTourDestination(tour)) === target
    );
  }, [tours, destinationName]);

  return (
    <div className="destination-detail-page">
      <header className="destination-detail-header">
        <div className="container">
          <nav className="destination-detail-breadcrumb">
            <Link to="/">{t("navigation.home", "Home")}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/destinations">
              {t("navigation.destinations", "Destinations")}
            </Link>
            <span aria-hidden="true">/</span>
            <strong>{destinationName}</strong>
          </nav>
          <h1>{destinationName}</h1>
        </div>
      </header>

      <section className="destination-detail-list">
        <div className="container">
          {loading && (
            <div className="destinations-state">
              <div className="destinations-spinner" />
              <p>{t("common.loading", "Loading tours…")}</p>
            </div>
          )}

          {!loading && error && (
            <div className="destinations-state destinations-state--error">
              <p>
                {t(
                  "destinationDetail.error",
                  "Could not load tours. Please refresh."
                )}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="destinations-state">
              <p>
                {t(
                  "destinationDetail.empty",
                  "No tours found for this destination yet."
                )}
              </p>
              <Link to="/destinations" className="destination-card-link">
                {t("destinationDetail.back", "Back to destinations")}
              </Link>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="tours-grid">
              {filtered.map((tour) => {
                const image = getTourImage(tour);
                const price = getTourPrice(tour);
                const slugValue =
                  tour.slug || tour.url_slug || String(tour.id);

                return (
                  <article key={tour.id || slugValue} className="tour-card">
                    <div className="tour-card-image">
                      {image ? (
                        <img src={image} alt={tour.title || "Tour"} />
                      ) : (
                        <div className="tour-card-placeholder">
                          <span>ZAN GATES</span>
                          <strong>TOUR</strong>
                        </div>
                      )}
                      <div className="tour-card-image-shade" />
                    </div>

                    <div className="tour-card-content">
                      <h3>{tour.title || tour.name}</h3>
                      <p className="tour-card-description">
                        {tour.short_description || tour.description || ""}
                      </p>

                      <div className="tour-card-footer">
                        <div className="tour-card-price">
                          <span>{t("tourCard.from", "From")}</span>
                          <div>
                            <strong>
                              {price ? `$${price.toLocaleString()}` : "—"}
                            </strong>
                          </div>
                        </div>

                        <Link
                          to={`/tours/${encodeURIComponent(slugValue)}`}
                          className="tour-card-button"
                        >
                          {t("tourCard.view", "View")}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DestinationDetailPage;