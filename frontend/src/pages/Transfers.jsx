import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Transfers.css";

/* =========================================================
   TRANSFER PRICING DATA
   ========================================================= */

const AIRPORT_TRANSFERS = [
  { destination: "Nungwi", price: 40 },
  { destination: "Kendwa", price: 40 },
  { destination: "Kiwengwa", price: 40 },
  { destination: "Uroa", price: 40 },
  { destination: "Kizimkazi", price: 40 },
  { destination: "Jambiani", price: 40 },
  { destination: "Paje", price: 40 },
  { destination: "Pongwe", price: 40 },
  { destination: "Michamvi", price: 40 },
  { destination: "Matemwe", price: 40 },
  { destination: "Stone Town", price: 20 },
];

const ROUTES = [
  {
    from: "Nungwi to Stone Town",
    options: [
      { label: "Pick up & drop off", price: 40 },
      { label: "Round trip (go / return)", price: 70 },
    ],
  },
  {
    from: "Nungwi / Kendwa to Jambiani, Paje",
    options: [
      { label: "Paje (one way)", price: 80 },
      { label: "Round trip (go / return)", price: 90 },
    ],
  },
  {
    from: "Nungwi / Kendwa to Kizimkazi",
    options: [
      { label: "Pick up & drop off", price: 80 },
      { label: "Round trip (go / return)", price: 95 },
    ],
  },
  {
    from: "Nungwi / Kendwa to Michamvi",
    options: [
      { label: "Pick up & drop off", price: 90 },
      { label: "Round trip (go / return)", price: 100 },
    ],
  },
  {
    from: "Stone Town to Jambiani, Paje",
    options: [
      { label: "Pick up & drop off", price: 40 },
      { label: "Round trip (go / return)", price: 70 },
    ],
  },
  {
    from: "Matemwe to Michamvi",
    options: [{ label: "Pick up & drop off", price: 70 }],
  },
  {
    from: "Matemwe to Jambiani, Paje",
    options: [{ label: "Pick up & drop off", price: 40 }],
  },
  {
    from: "Kiwengwa to Jambiani, Paje",
    options: [{ label: "Pick up & drop off", price: 65 }],
  },
  {
    from: "Michamvi to Jambiani",
    options: [{ label: "Pick up & drop off", price: 35 }],
  },
  {
    from: "Jambiani to Paje",
    options: [{ label: "Pick up & drop off", price: 30 }],
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

function Transfers() {
  const { t } = useTranslation();

  return (
    <main className="transfers-page">

      {/* =========================================================
          HERO
      ========================================================= */}

      <header className="transfers-header">
        <div className="container">
          <span className="tour-section-eyebrow">
            {t("transfers.eyebrow", "TRANSFERS")}
          </span>

          <h1>
            {t("transfers.title", "Transfers Services")}
          </h1>

          <p>
            {t(
              "transfers.description",
              "Trusted, comfortable and reliable transfer services across Zanzibar — from the airport to every beach and resort on the island."
            )}
          </p>
        </div>
      </header>

      {/* =========================================================
          AIRPORT TRANSFERS
      ========================================================= */}

      <section className="transfers-section">
        <div className="container">

          <div className="transfers-section-heading">
            <span className="tour-section-eyebrow">
              {t("transfers.airportEyebrow", "AIRPORT PICKUP")}
            </span>

            <h2>
              {t(
                "transfers.airportTitle",
                "Transfer Service From Airport to:"
              )}
            </h2>
          </div>

          <ul className="transfers-grid">
            {AIRPORT_TRANSFERS.map((item) => (
              <li key={item.destination} className="transfers-card">
                <strong className="transfers-card-destination">
                  {item.destination}
                </strong>

                <span className="transfers-card-price">
                  ${item.price}
                </span>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* =========================================================
          INTER-CITY ROUTES
      ========================================================= */}

      <section className="transfers-section transfers-section--alt">
        <div className="container">

          <div className="transfers-section-heading">
            <span className="tour-section-eyebrow">
              {t("transfers.routesEyebrow", "INTER-CITY TRANSFERS")}
            </span>

            <h2>
              {t(
                "transfers.routesTitle",
                "Point-to-point transfers across Zanzibar"
              )}
            </h2>
          </div>

          <div className="transfers-routes">
            {ROUTES.map((route) => (
              <article key={route.from} className="transfers-route">
                <h3 className="transfers-route-title">
                  {t("transfers.from", "From")} {route.from}
                </h3>

                <ul className="transfers-route-options">
                  {route.options.map((option) => (
                    <li
                      key={`${route.from}-${option.label}`}
                      className="transfers-route-option"
                    >
                      <span className="transfers-route-option-label">
                        {option.label}
                      </span>

                      <span className="transfers-route-option-price">
                        ${option.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="transfers-cta">
        <div className="container">
          <div className="transfers-cta-inner">

            <h2>
              {t("transfers.ctaTitle", "Need a transfer?")}
            </h2>

            <p>
              {t(
                "transfers.ctaDescription",
                "Let us know your pickup point, destination and travel date — we'll arrange a comfortable, punctual transfer for you."
              )}
            </p>

            <Link to="/contact" className="primary-button">
              {t("transfers.ctaButton", "Contact Us")}
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}

export default Transfers;