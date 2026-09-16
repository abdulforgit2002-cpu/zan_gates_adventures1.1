import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTours } from "../services/tourService";

/* =========================================================
   DESTINATION SLUG MAP
   The `tours.destination_id` in the DB points to rows in the
   `destinations` table. We map the friendly display name to a
   URL-safe slug for /destinations/:slug routing.
   ========================================================= */

const DESTINATION_SLUGS = {
  "Tarangire National Park": "tarangire-national-park",
  "Serengeti National Park": "serengeti-national-park",
  "Selous Game Reserve": "selous-game-reserve",
  "Safari Blue": "safari-blue",
  "Prison Island": "prison-island",
  "Nungwi": "nungwi",
  "Ngorongoro Conservation Area": "ngorongoro-crater",
  "Nakupenda Sandbank": "nakupenda-sandbank",
  "Mnemba Island": "mnemba-island",
};

/* Order in which destinations display on the listing page */
const DESTINATION_ORDER = [
  "Tarangire National Park",
  "Serengeti National Park",
  "Selous Game Reserve",
  "Safari Blue",
  "Prison Island",
  "Nungwi",
  "Ngorongoro Conservation Area",
  "Nakupenda Sandbank",
  "Mnemba Island",
];

const normalizeString = (value) =>
  String(value || "").toLowerCase().trim();

const getTourDestination = (tour) =>
  tour?.destination_name ||
  tour?.destination?.name ||
  tour?.destination ||
  "";

const getDestinationSlug = (name) => {
  if (!name) return "";
  if (DESTINATION_SLUGS[name]) return DESTINATION_SLUGS[name];
  return normalizeString(name).replace(/\s+/g, "-");
};

function DestinationsPage() {
  const { t } = useTranslation();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error("[DestinationsPage] load error:", err);
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

  /* Build the aggregated destination list with counts */
  const destinations = useMemo(() => {
    const counts = new Map();

    tours.forEach((tour) => {
      const name = getTourDestination(tour);
      if (!name) return;
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    /* Preserve DESTINATION_ORDER, then append any extra */
    const ordered = DESTINATION_ORDER.filter((n) => counts.has(n));
    const extras = [...counts.keys()].filter(
      (n) => !DESTINATION_ORDER.includes(n)
    );

    return [...ordered, ...extras].map((name) => ({
      name,
      slug: getDestinationSlug(name),
      count: counts.get(name),
    }));
  }, [tours]);

  return (
    <div className="destinations-page">
      <header className="destinations-header">
        <div className="container">
          <span className="tour-section-eyebrow">
            {t("destinations.eyebrow", "Destinations")}
          </span>
          <h1>{t("destinations.title", "Explore Tours By Destinations")}</h1>
          <p>
            {t(
              "destinations.subtitle",
              "Discover Zanzibar and Tanzania by destination — from the Serengeti plains to the beaches of Nungwi and the reefs of Mnemba."
            )}
          </p>
        </div>
      </header>

      <section className="destinations-list">
        <div className="container">
          {loading && (
            <div className="destinations-state">
              <div className="destinations-spinner" />
              <p>{t("common.loading", "Loading destinations…")}</p>
            </div>
          )}

          {!loading && error && (
            <div className="destinations-state destinations-state--error">
              <p>
                {t(
                  "destinations.error",
                  "Could not load destinations. Please refresh."
                )}
              </p>
            </div>
          )}

          {!loading && !error && destinations.length === 0 && (
            <div className="destinations-state">
              <p>{t("destinations.empty", "No destinations available yet.")}</p>
            </div>
          )}

          {!loading && !error && destinations.length > 0 && (
            <div className="destinations-grid">
              {destinations.map((d) => (
                <article key={d.slug} className="destination-card">
                  <div className="destination-card-body">
                    <span className="destination-card-count">
                      {d.count}{" "}
                      {d.count === 1
                        ? t("destinations.tour", "tour")
                        : t("destinations.tours", "tours")}
                    </span>
                    <h2 className="destination-card-title">{d.name}</h2>
                    <Link
                      to={`/destinations/${encodeURIComponent(d.slug)}`}
                      className="destination-card-link"
                    >
                      {t("destinations.viewAll", "View all tours")}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DestinationsPage;