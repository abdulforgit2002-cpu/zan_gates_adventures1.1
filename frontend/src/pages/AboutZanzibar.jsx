import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AboutZanzibar.css";

/* =========================================================
   ABOUT ZANZIBAR — Content Data
   ========================================================= */

const BEST_PLACES = [
  "Prison Island",
  "Nakupenda Sandbank",
  "Safari Blue",
  "Mnemba Island",
  "Turtles Aquarium",
  "Stone Town",
  "Jozani Forest",
  "Kizimkazi",
  "Spice Farm",
  "Kendwa – Sunset & Water Sports",
  "Tumbatu Island",
  "The Rock Restaurant",
  "Kuza Cave",
  "Paje – Kitesurfing",
  "Nungwi – Horse Beach Riding",
];

const BEST_BEACHES = [
  "Nungwi Beach",
  "Kendwa Beach",
  "Paje Beach",
  "Jambiani Beach",
  "Matemwe Muyuni Beach",
  "Kiwengwa Beach",
  "Michamvi Beach",
  "Uroa Beach",
];

/* =========================================================
   COMPONENT
   ========================================================= */

function AboutZanzibar() {
  const { t } = useTranslation();

  return (
    <main className="about-zanzibar-page">

      {/* =========================================================
          HERO
      ========================================================= */}

      <header className="about-zanzibar-hero">
        <div className="container">
          <span className="tour-section-eyebrow">
            {t("aboutZanzibar.eyebrow", "ABOUT ZANZIBAR")}
          </span>

          <h1>
            {t("aboutZanzibar.heroTitle", "The Spice Island")}
          </h1>

          <p>
            {t(
              "aboutZanzibar.heroSubtitle",
              "A Tanzanian archipelago off the coast of East Africa — where Swahili, Arab, Indian and European cultures meet."
            )}
          </p>
        </div>
      </header>

      {/* =========================================================
          INTRO
      ========================================================= */}

      <section className="about-zanzibar-intro">
        <div className="container">
          <div className="about-zanzibar-intro-grid">

            <div className="about-zanzibar-intro-content">
              <h2>
                {t("aboutZanzibar.introTitle", "Where history meets the ocean.")}
              </h2>

              <p>
                Zanzibar is a Tanzanian archipelago off the coast of East Africa.
                On its main island, Unguja, familiarly called Zanzibar, is Stone Town,
                a historic trade center with Swahili and Islamic influences.
              </p>

              <p>
                Its winding lanes present minarets, carved doorways, and 19th-century
                landmarks such as the House of Wonders, a former sultan's palace.
                The northern villages Nungwi and Kendwa have wide beaches lined with hotels.
              </p>
            </div>

            <aside className="about-zanzibar-intro-card">
              <strong>Stone Town</strong>
              <span>UNESCO World Heritage Site</span>
            </aside>

          </div>
        </div>
      </section>

      {/* =========================================================
          CHOOSE YOUR OWN ADVENTURE
      ========================================================= */}

      <section className="about-zanzibar-adventure">
        <div className="container">
          <div className="about-zanzibar-adventure-inner">

            <span className="tour-section-eyebrow">
              {t("aboutZanzibar.adventureEyebrow", "CHOOSE YOUR OWN ADVENTURE")}
            </span>

            <h2>
              {t(
                "aboutZanzibar.adventureTitle",
                "A contrast of worlds."
              )}
            </h2>

            <p>
              Zanzibar has become host to a handful of East Africa's most posh luxury
              resorts, which can be a jarring contrast to what is an otherwise quiet,
              economically challenged island.
            </p>

            <p>
              If you're looking for a beach escape with other Westerners, head north
              to Nungwi and Kendwa, where you'll find the same all-inclusive packages
              and beach discos you'll find in most other warm parts of the world.
            </p>

          </div>
        </div>
      </section>

      {/* =========================================================
          BEST PLACES
      ========================================================= */}

      <section className="about-zanzibar-list-section">
        <div className="container">

          <div className="about-zanzibar-heading">
            <span className="tour-section-eyebrow">
              {t("aboutZanzibar.placesEyebrow", "EXPLORE THE ISLAND")}
            </span>

            <h2>
              {t("aboutZanzibar.placesTitle", "Best places to visit in Zanzibar")}
            </h2>
          </div>

          <ul className="about-zanzibar-grid">
            {BEST_PLACES.map((place, index) => (
              <li key={place} className="about-zanzibar-item">
                <span className="about-zanzibar-item-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{place}</strong>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* =========================================================
          BEST BEACHES
      ========================================================= */}

      <section className="about-zanzibar-list-section about-zanzibar-list-section--alt">
        <div className="container">

          <div className="about-zanzibar-heading">
            <span className="tour-section-eyebrow">
              {t("aboutZanzibar.beachesEyebrow", "SUN, SAND & SEA")}
            </span>

            <h2>
              {t("aboutZanzibar.beachesTitle", "Best beaches in Zanzibar")}
            </h2>
          </div>

          <ul className="about-zanzibar-grid">
            {BEST_BEACHES.map((beach, index) => (
              <li key={beach} className="about-zanzibar-item">
                <span className="about-zanzibar-item-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{beach}</strong>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="about-zanzibar-cta">
        <div className="container">
          <div className="about-zanzibar-cta-inner">

            <h2>
              {t("aboutZanzibar.ctaTitle", "Ready to experience Zanzibar?")}
            </h2>

            <p>
              {t(
                "aboutZanzibar.ctaSubtitle",
                "Browse our curated experiences and let us plan your perfect island escape."
              )}
            </p>

            <Link to="/tours" className="primary-button">
              {t("aboutZanzibar.ctaButton", "Explore Our Tours")}
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}

export default AboutZanzibar;