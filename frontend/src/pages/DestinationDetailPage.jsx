import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTours } from "../services/tourService";
import { getDestinations } from "../services/destinationService";
import Seo from "../seo/Seo";
import {
  breadcrumbSchema,
  destinationSchema,
  itemListSchema,
  webPageSchema,
} from "../seo/schema";

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
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const destinationName = useMemo(() => {
    if (!slug) return "";
    if (destination?.name) return destination.name;

    const fromTour = tours.find(
      (tour) => tour.destination_slug === slug
    )?.destination_name;
    if (fromTour) return fromTour;

    if (SLUG_TO_NAME[slug]) return SLUG_TO_NAME[slug];
    return slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }, [slug, destination, tours]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [data, destinationList] = await Promise.all([
          getTours(),
          getDestinations().catch(() => []),
        ]);

        if (!mounted) return;

        setDestination(
          (Array.isArray(destinationList) ? destinationList : []).find(
            (item) => item.slug === slug
          ) || null
        );

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
  }, [slug]);

  const filtered = useMemo(() => {
    const bySlug = tours.filter((tour) => tour.destination_slug === slug);
    if (bySlug.length > 0) return bySlug;

    const target = normalizeString(destinationName);
    return tours.filter(
      (tour) => normalizeString(getTourDestination(tour)) === target
    );
  }, [tours, slug, destinationName]);

  const firstImage = filtered.length > 0 ? getTourImage(filtered[0]) : null;
  const seoDescription = destination?.description
    ? destination.description
    : filtered.length > 0
    ? `Book ${destinationName} tours and excursions with ZAN GATES Adventures: ${filtered
        .slice(0, 3)
        .map((tour) => tour.title)
        .join(", ")}. Compare prices and send an enquiry.`
    : `Tours and excursions in ${destinationName} with ZAN GATES Adventures.`;
  const seoPath = `/destinations/${encodeURIComponent(slug || "")}`;

  return (
    <div className="destination-detail-page">
      <Seo
        title={`${destinationName} Tours & Excursions`}
        description={seoDescription}
        keywords={[
          destinationName,
          `${destinationName} tours`,
          `${destinationName} excursions`,
          "Zanzibar destinations",
        ]}
        path={seoPath}
        image={firstImage || undefined}
        imageAlt={destinationName}
        noindex={!loading && !error && filtered.length === 0}
        jsonLd={[
          webPageSchema({
            type: "CollectionPage",
            name: `${destinationName} tours`,
            description: seoDescription,
            path: seoPath,
            image: firstImage || undefined,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            { name: destinationName, path: seoPath },
          ]),
          destinationSchema({
            name: destinationName,
            description: destination?.description || undefined,
            path: seoPath,
            image: firstImage || undefined,
          }),
          ...(filtered.length > 0
            ? [
                itemListSchema(
                  `${destinationName} tours`,
                  filtered.map((tour) => ({
                    name: tour.title,
                    path: `/tours/${encodeURIComponent(tour.slug)}`,
                    image: getTourImage(tour) || undefined,
                  }))
                ),
              ]
            : []),
        ]}
      />

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
          {destination?.description && (
            <p className="destination-detail-description">
              {destination.description}
            </p>
          )}
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
                        <img
                          src={image}
                          alt={tour.title || "Tour"}
                          loading="lazy"
                          decoding="async"
                        />
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