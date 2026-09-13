import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTours } from "../services/tourService";
import TourCard from "../components/TourCard";

/* =========================================================
   SAFARI CLASSIFIER (mirrors the one in Navbar.jsx)
   ========================================================= */

const SAFARI_KEYWORDS = [
  "safari",
  "wildlife",
  "serengeti",
  "ngorongoro",
  "tarangire",
  "manyara",
  "mikumi",
  "selous",
  "nyerere",
  "ruaha",
  "arusha",
  "kilimanjaro",
  "mainland",
];

const normalizeString = (value) =>
  String(value || "").toLowerCase().trim();

const isSafariTour = (tour) => {
  const haystack = [
    tour?.category_name,
    tour?.category?.name,
    tour?.category,
    tour?.type,
    tour?.tour_type,
    tour?.destination_name,
    tour?.destination?.name,
    tour?.destination,
  ]
    .filter(Boolean)
    .map((value) => normalizeString(value))
    .join(" ");

  return SAFARI_KEYWORDS.some((keyword) =>
    haystack.includes(keyword)
  );
};

function Safaris() {
  const { t } = useTranslation();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSafaris = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTours();
        if (!mounted) return;

        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.tours)) list = data.tours;
        else if (Array.isArray(data?.data?.tours)) list = data.data.tours;
        else if (Array.isArray(data?.results)) list = data.results;

        setTours(list.filter(isSafariTour));
      } catch (err) {
        console.error("Failed to load safaris:", err);
        if (mounted) {
          setError(err?.message || "Unable to load safari experiences.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSafaris();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="safaris-page">

      <header className="safaris-header">
        <div className="container">
          <span className="tour-section-eyebrow">
            {t("safaris.eyebrow", "WILDLIFE SAFARIS")}
          </span>

          <h1>
            {t("safaris.title", "Tanzania Safari Adventures")}
          </h1>

          <p>
            {t(
              "safaris.description",
              "From the Serengeti plains to the Ngorongoro Crater — discover the very best parks and game reserves of Tanzania, with flights departing from Zanzibar."
            )}
          </p>
        </div>
      </header>

      <section className="safaris-list">
        <div className="container">

          <div className="tours-section-heading">
            <span className="tour-section-eyebrow">
              {t("safaris.listEyebrow", "OUR SAFARIS")}
            </span>

            <h2>
              {t("safaris.listTitle", "Wildlife journeys worth remembering")}
            </h2>

            <p>
              {t(
                "safaris.listDescription",
                "Handpicked safari experiences across Tanzania mainland — from day trips to multi-day adventures."
              )}
            </p>
          </div>

          {loading && (
            <div className="tours-state">
              <div className="tours-loading-spinner" />
              <p>{t("safaris.loading", "Loading safaris…")}</p>
            </div>
          )}

          {!loading && error && (
            <div className="tours-state tours-state-error">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                {t("common.tryAgain", "Try Again")}
              </button>
            </div>
          )}

          {!loading && !error && tours.length === 0 && (
            <div className="tours-state">
              <h3>{t("safaris.emptyTitle", "New safaris coming soon")}</h3>
              <p>
                {t(
                  "safaris.emptyDescription",
                  "We are preparing new wildlife adventures for you."
                )}
              </p>
            </div>
          )}

          {!loading && !error && tours.length > 0 && (
            <div className="tours-grid">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

export default Safaris;