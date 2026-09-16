import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* =========================================================
   IMAGE GALLERIES
   ========================================================= */

const CLASSIC_IMAGES = [
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558099/WhatsApp_Image_2026-09-12_at_12.28.45_PM_t79tua.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558098/WhatsApp_Image_2026-09-12_at_12.28.46_PM_1_df8ex9.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558097/WhatsApp_Image_2026-09-12_at_12.28.46_PM_2_o0kqk30.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558097/WhatsApp_Image_2026-09-12_at_12.28.47_PM_q3isdr.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558096/WhatsApp_Image_2026-09-12_at_12.28.47_PM_2_xsnbah.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558094/WhatsApp_Image_2026-09-12_at_12.28.48_PM_l5pibp.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558093/WhatsApp_Image_2026-09-12_at_12.28.48_PM_3_elr1qu.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558092/WhatsApp_Image_2026-09-12_at_12.28.49_PM_1_l4xvhe.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558090/WhatsApp_Image_2026-09-12_at_12.28.50_PM_1_ajiq6j.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558089/WhatsApp_Image_2026-09-12_at_12.28.51_PM_dl3ync.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558087/WhatsApp_Image_2026-09-12_at_12.28.51_PM_1_wuhpzk.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558086/WhatsApp_Image_2026-09-12_at_12.28.52_PM_1_jvcuor.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558086/WhatsApp_Image_2026-09-12_at_12.28.53_PM_1_efkmey.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558085/WhatsApp_Image_2026-09-12_at_12.28.54_PM_lnqs3v.jpg",
];

const SIGNATURE_IMAGES = [
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558434/WhatsApp_Image_2026-09-12_at_12.28.56_PM_1_fstmsj.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558435/WhatsApp_Image_2026-09-12_at_12.28.56_PM_o7w5k4.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558433/WhatsApp_Image_2026-09-12_at_12.28.56_PM_2_eun1h5.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558430/WhatsApp_Image_2026-09-12_at_12.29.03_PM_txbp1h.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558430/WhatsApp_Image_2026-09-12_at_12.28.59_PM_m2xrnc.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558430/WhatsApp_Image_2026-09-12_at_12.29.04_PM_p3kmg1.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558429/WhatsApp_Image_2026-09-12_at_12.30.51_PM_jwelen.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558429/HERE_yod1jq.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558429/WhatsApp_Image_2026-09-12_at_12.29.05_PM_qg6enx.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558429/WhatsApp_Image_2026-09-12_at_12.30.51_PM_1_pznlse.jpg",
];

const WEDDING_IMAGES = [
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558788/WhatsApp_Image_2026-09-12_at_12.32.52_PM_drn7rq.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558788/WhatsApp_Image_2026-09-12_at_12.32.51_PM_1_st9zlh.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558787/WhatsApp_Image_2026-09-12_at_12.32.54_PM_xtwzyr.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558786/WhatsApp_Image_2026-09-12_at_12.32.54_PM_1_jkdzon.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558785/WhatsApp_Image_2026-09-12_at_12.32.54_PM_2_k3thnw.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558785/WhatsApp_Image_2026-09-12_at_12.32.54_PM_3_fmwr26.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558784/WhatsApp_Image_2026-09-12_at_12.32.55_PM_onsr47.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558783/WhatsApp_Image_2026-09-12_at_12.32.55_PM_1_rh7lap.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558783/WhatsApp_Image_2026-09-12_at_12.32.55_PM_2_truorw.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558782/WhatsApp_Image_2026-09-12_at_12.32.55_PM_3_bku7xa.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558782/WhatsApp_Image_2026-09-12_at_12.32.56_PM_bxe6um.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558780/WhatsApp_Image_2026-09-12_at_12.32.56_PM_1_vntpim.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558780/WhatsApp_Image_2026-09-12_at_12.32.56_PM_2_mxfcb4.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558780/WhatsApp_Image_2026-09-12_at_12.32.57_PM_jb7rom.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558779/WhatsApp_Image_2026-09-12_at_12.32.58_PM_zd0hzc.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558779/WhatsApp_Image_2026-09-12_at_12.32.58_PM_1_vso8k1.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558778/WhatsApp_Image_2026-09-12_at_12.32.59_PM_hzblyq.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558776/WhatsApp_Image_2026-09-12_at_12.32.59_PM_1_tggwy1.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558776/WhatsApp_Image_2026-09-12_at_12.32.59_PM_2_lymvmh.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558776/WhatsApp_Image_2026-09-12_at_12.33.02_PM_dixzxs.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558775/WhatsApp_Image_2026-09-12_at_12.33.03_PM_ytodfw.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558775/WhatsApp_Image_2026-09-12_at_12.33.04_PM_dteyql.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789558775/WhatsApp_Image_2026-09-12_at_12.33.03_PM_1_yfgan2.jpg",
];

const PICNIC_IMAGES = [
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559505/NOW_ic81so.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559504/WhatsApp_Image_2026-09-12_at_12.34.15_PM_hzb52q.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559504/WhatsApp_Image_2026-09-12_at_12.34.15_PM_2_wwkmio.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559503/WhatsApp_Image_2026-09-12_at_12.34.15_PM_1_fnkd0z.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559502/WhatsApp_Image_2026-09-12_at_12.34.15_PM_3_paocoe.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559501/WhatsApp_Image_2026-09-12_at_12.34.15_PM_4_dsca5z.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559500/WhatsApp_Image_2026-09-12_at_12.34.16_PM_1_tgnrrn.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559500/WhatsApp_Image_2026-09-12_at_12.34.16_PM_bigir3.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559499/WhatsApp_Image_2026-09-12_at_12.34.16_PM_2_vfadmx.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559499/WhatsApp_Image_2026-09-12_at_12.34.16_PM_3_l3eb6x.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559498/WhatsApp_Image_2026-09-12_at_12.34.17_PM_ga6cvl.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559496/WhatsApp_Image_2026-09-12_at_12.34.17_PM_1_dynyep.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559496/WhatsApp_Image_2026-09-12_at_12.34.17_PM_2_vwyqru.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559495/WhatsApp_Image_2026-09-12_at_12.34.17_PM_3_bpq37l.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559493/WhatsApp_Image_2026-09-12_at_12.34.18_PM_2_npurcx.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559493/WhatsApp_Image_2026-09-12_at_12.34.18_PM_1_k2ycl9.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559493/WhatsApp_Image_2026-09-12_at_12.34.18_PM_3_n8iuj7.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559492/WhatsApp_Image_2026-09-12_at_12.34.18_PM_4_bv1etc.jpg",
  "https://res.cloudinary.com/djczmay2i/image/upload/v1789559492/WhatsApp_Image_2026-09-12_at_12.34.19_PM_ssfbud.jpg",
];

/* =========================================================
   PACKAGE DATA
   ========================================================= */

const CLASSIC_PACKAGE = {
  slug: "classic-proposal",
  eyebrow: "Classic Proposal Experience",
  title: "A Beautiful & Romantic Way to Ask the Most Important Question",
  price: 350,
  images: CLASSIC_IMAGES,
  setups: [
    {
      name: "Elegant Proposal Arch",
      items: [
        "Beautifully styled proposal arch",
        "Illuminated “Marry Me” neon sign",
        "Scattered rose petals",
        "Soft candle decoration",
        "Fresh romantic flower bouquet",
      ],
    },
    {
      name: "“MARRY ME” Display",
      items: [
        "Stylish “MARRY ME” stand",
        "Fresh flower bouquet",
      ],
    },
  ],
  capture: {
    price: 150,
    items: [
      "Up to 1 hour of professional photography",
      "20 professionally edited photographs",
      "20–30 second Instagram Reel",
    ],
    note: "Drone photography is not included in this option.",
  },
  extras: [
    { label: "Romantic Fireworks Display", price: 50 },
    { label: "Aerial Drone Video", price: 50 },
    { label: "Champagne or Wine", price: 50 },
    { label: "Private Romantic Dinner Arrangement", price: 100 },
    { label: "Live Musician (Violin / Saxophone / Guitar)", price: 180 },
    { label: "Private Sandbank Proposal + Boat Transfer", price: 150 },
    { label: "Private Taxi Transfer", price: "30–80" },
    { label: "Maasai Cultural Experience – Dance & Photos", price: 100 },
  ],
};

const SIGNATURE_PACKAGE = {
  slug: "signature-proposal",
  eyebrow: "Signature Proposal Experience",
  title:
    "A Luxurious & Romantic Celebration Designed to Make the Moment Unforgettable",
  price: 450,
  images: SIGNATURE_IMAGES,
  setups: [
    {
      name: "Your Proposal Setup Includes",
      items: [
        "Beautifully styled proposal backdrop",
        "Glowing “Marry Me” illuminated sign",
        "Sophisticated floral decorations",
        "Fireworks display to celebrate the moment",
        "Romantic rose-petal styling",
        "Decorative candle arrangement",
        "Beautiful fresh flower bouquet",
      ],
    },
  ],
  capture: {
    price: 300,
    items: [
      "Up to 1 hour of photography coverage",
      "20–30 professionally retouched photographs",
      "30-second to 1-minute social media highlight video",
      "Drone aerial footage included",
    ],
    note: null,
  },
  extras: [
    { label: "Decorated Pathway to the Proposal Area", price: 50 },
    { label: "Champagne or Wine Service", price: 50 },
    { label: "Private Romantic Dining Setup", price: 100 },
    { label: "Live Musical Performance (Violin / Saxophone / Guitar)", price: 180 },
    { label: "Freestanding “MARRY ME” Display", price: 100 },
    { label: "Sandbank Proposal Experience + Boat Transfer", price: 150 },
    { label: "Private Transportation", price: "30–80" },
    { label: "Maasai Cultural Performance + Photos", price: 100 },
  ],
};

const WEDDING_PACKAGE = {
  slug: "destination-wedding",
  eyebrow: "Destination Wedding Experience",
  title: "Celebrate Your Love in a Beautiful Tropical Paradise",
  price: 4500,
  images: WEDDING_IMAGES,
  setups: [
    {
      name: "Wedding Decor & Ceremony",
      items: [
        "Beautifully styled wedding ceremony area",
        "Elegant wedding arch with decorative styling",
        "Fresh and artificial floral arrangements",
        "Aisle decoration with petals",
        "Romantic candle and table styling",
        "Bridal bouquet",
        "Groom's boutonnière",
        "Guest seating arrangement",
        "Decorative details for the ceremony space",
      ],
    },
    {
      name: "Reception Experience",
      items: [
        "Beautifully decorated reception tables",
        "Floral table centrepieces",
        "Romantic table lighting",
        "Elegant table settings",
        "Wedding cake table decoration",
        "Ambient lighting and decorative elements",
      ],
    },
    {
      name: "Capture Your Special Day",
      items: [
        "Professional wedding photography",
        "Highlight video of your celebration",
        "Drone coverage available",
        "Couple photography session",
        "Professionally edited wedding photographs",
      ],
    },
    {
      name: "Entertainment & Celebration",
      items: [
        "Live musician options available",
        "Saxophone / Violin / Guitar performances",
        "Music and entertainment arrangements",
        "Traditional Tanzanian entertainment available upon request",
        "Fireworks available as an additional option",
      ],
    },
  ],
  capture: null,
  extras: [
    { label: "Private beach & sandbank experiences", price: "Custom" },
    { label: "Sunset or private boat cruise", price: "Custom" },
    { label: "Romantic couple photoshoot", price: "Custom" },
    { label: "Champagne celebration", price: "Custom" },
    { label: "Romantic private dinner", price: "Custom" },
    { label: "Maasai cultural experience", price: "Custom" },
    { label: "Private airport & hotel transfers", price: "Custom" },
    { label: "Post-wedding island excursions", price: "Custom" },
  ],
  customNote:
    "Every destination wedding is unique. We can customise the colour scheme, flowers, décor, ceremony style, entertainment and overall atmosphere according to your vision. The starting price is based on our standard destination wedding arrangement. Final pricing depends on the number of guests, venue, décor requirements, photography, entertainment, accommodation and additional services selected.",
  paymentNote:
    "A 50% deposit is required to secure your wedding date and begin the planning process. The remaining balance must be completed before the wedding day.",
  tagline: "Your Love Story. Your Destination. Your Perfect Day.",
};

const PICNIC_PACKAGE = {
  slug: "luxury-picnic",
  eyebrow: "Luxury Picnic Experience",
  title:
    "A Beautiful Private Escape Designed for Relaxation, Romance & Unforgettable Memories",
  price: 350,
  images: PICNIC_IMAGES,
  setups: [
    {
      name: "Your Picnic Setup Includes",
      items: [
        "Beautifully styled private picnic area",
        "Elegant picnic table and comfortable floor seating",
        "Decorative floral arrangements",
        "Romantic candles and decorative lighting",
        "Rose-petal styling",
        "Fresh flower arrangement",
        "Beautiful tableware and picnic décor",
        "Cushions and decorative accessories",
        "Picture-perfect setup for memorable photos",
      ],
    },
    {
      name: "Food & Refreshments",
      items: [
        "Selection of fresh fruits",
        "Light picnic snacks",
        "Refreshments",
        "Champagne or wine available as an optional extra",
      ],
    },
  ],
  capture: {
    price: 150,
    items: [
      "Couple & lifestyle photoshoot",
      "Short social-media highlight video",
      "Drone photography available as an extra",
    ],
    note: null,
  },
  perfectFor: [
    "Romantic Couples' Picnic",
    "Marriage Proposal",
    "Birthday Celebration",
    "Anniversary",
    "Honeymoon Experience",
    "Friends' Celebration",
    "Sunset Picnic",
    "Beach Picnic",
  ],
  extras: [
    { label: "Fireworks Display", price: 50 },
    { label: "Drone Footage", price: 50 },
    { label: "Champagne or Wine", price: 50 },
    { label: "Private Dinner Upgrade", price: 100 },
    { label: "Live Violinist / Saxophonist / Guitarist", price: 180 },
    { label: "Professional Photography", price: "From $150" },
    { label: "Private Taxi Service", price: "30–80" },
    { label: "Maasai Cultural Performance", price: 100 },
    { label: "Sandbank Experience + Boat Transfer", price: 150 },
  ],
  note: "Food and menu options can be customised according to your preferences.",
  tagline: "Relax. Celebrate. Connect. Create Beautiful Memories.",
  paymentNote:
    "A 50% deposit is required to secure your preferred date and picnic setup. The remaining balance is payable before the experience.",
};

/* =========================================================
   WHATSAPP BUILDER
   ========================================================= */

const WHATSAPP_NUMBER = "255658450092";

const buildWhatsAppLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/* =========================================================
   PACKAGE SECTION COMPONENT
   ========================================================= */

function PackageSection({ pkg, variant }) {
  const [heroImage, ...otherImages] = pkg.images;

  const whatsappLink = buildWhatsAppLink(
    `Hello ZAN GATES, I'd like to enquire about the ${pkg.eyebrow} (from $${pkg.price.toLocaleString()}). Could you please share availability?`
  );

  /* Sidebar copy — differs per variant */
  const sidebarCopy = (() => {
    if (variant === "wedding") {
      return {
        label: "RESERVATION & PAYMENT",
        title: "Reserve your wedding date",
        paragraphs: [
          <>
            A <strong>50% deposit</strong> is required to secure your wedding
            date and begin the planning process.
          </>,
          <>
            The remaining balance must be completed{" "}
            <strong>before the wedding day</strong>.
          </>,
        ],
        cta: "Plan on WhatsApp",
      };
    }
    if (variant === "picnic") {
      return {
        label: "RESERVATION POLICY",
        title: "Secure your picnic date",
        paragraphs: [
          <>
            A <strong>50% deposit</strong> is required to secure your preferred
            date and picnic setup.
          </>,
          <>
            The remaining balance is payable{" "}
            <strong>before the experience</strong>.
          </>,
        ],
        cta: "Reserve on WhatsApp",
      };
    }
    return {
      label: "BOOKING & PAYMENT",
      title: "Secure your date",
      paragraphs: [
        <>
          To secure your preferred date and setup, a{" "}
          <strong>50% advance payment</strong> is required at the time of
          reservation.
        </>,
        <>
          The remaining 50% must be settled{" "}
          <strong>before the proposal takes place</strong>.
        </>,
      ],
      cta: "Reserve on WhatsApp",
    };
  })();

  return (
    <section id={pkg.slug} className={`wp-package wp-package--${variant}`}>
      <div className="container">
        {/* Gallery */}
        <div className="wp-gallery">
          <div className="wp-gallery-primary">
            <img src={heroImage} alt={`${pkg.eyebrow} — main setup`} />
          </div>

          <div className="wp-gallery-thumbs">
            {otherImages.slice(0, 6).map((src, i) => (
              <div key={src + i} className="wp-gallery-thumb">
                <img
                  src={src}
                  alt={`${pkg.eyebrow} — view ${i + 2}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="wp-package-grid">
          <div className="wp-package-main">
            <span className="wp-eyebrow">
              {variant === "picnic" ? "🌸" : "💍"} {pkg.eyebrow}
            </span>
            <h2 className="wp-package-title">{pkg.title}</h2>

            <div className="wp-package-price">
              <span>Starting from</span>
              <strong>${pkg.price.toLocaleString()}</strong>
            </div>

            {/* Setup blocks */}
            <div className="wp-setups">
              {pkg.setups.map((setup, idx) => (
                <article key={idx} className="wp-setup-card">
                  <h3 className="wp-setup-title">
                    {variant === "proposal" && pkg.setups.length > 1 && (
                      <span className="wp-setup-or">
                        {idx === 0 ? "Option A" : "Option B"}
                      </span>
                    )}
                    {setup.name}
                  </h3>
                  <ul className="wp-list">
                    {setup.items.map((item) => (
                      <li key={item}>
                        <span className="wp-list-check" aria-hidden="true">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Food & menu customisation note (picnic only) */}
                  {variant === "picnic" && idx === 1 && pkg.note && (
                    <p className="wp-note" style={{ marginTop: 18 }}>
                      📌 <strong>Please note:</strong> {pkg.note}
                    </p>
                  )}
                </article>
              ))}

              {variant === "proposal" && pkg.setups.length > 1 && (
                <p className="wp-note">
                  📌 <strong>Please note:</strong> Setup designs are selected
                  from our existing collection.
                </p>
              )}

              {variant === "wedding" && (
                <div className="wp-custom-box">
                  <span className="wp-custom-icon" aria-hidden="true">
                    💎
                  </span>
                  <div>
                    <strong>Custom Wedding Design</strong>
                    <p>{pkg.customNote}</p>
                  </div>
                </div>
              )}

              {variant === "picnic" && pkg.perfectFor && (
                <div className="wp-perfectfor">
                  <h3 className="wp-perfectfor-title">✨ Perfect For</h3>
                  <ul className="wp-perfectfor-grid">
                    {pkg.perfectFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Photography add-on */}
            {pkg.capture && (
              <div className="wp-addon">
                <div className="wp-addon-head">
                  <span className="wp-addon-icon" aria-hidden="true">
                    📸
                  </span>
                  <div>
                    <h3>Capture the Moment</h3>
                    <span className="wp-addon-price">
                      Photography from ${pkg.capture.price}
                    </span>
                  </div>
                </div>
                <ul className="wp-list">
                  {pkg.capture.items.map((item) => (
                    <li key={item}>
                      <span className="wp-list-check" aria-hidden="true">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                {pkg.capture.note && (
                  <p className="wp-note wp-note--warn">
                    ❌ {pkg.capture.note}
                  </p>
                )}
              </div>
            )}

            {/* Extras */}
            <div className="wp-extras">
              <h3 className="wp-extras-title">
                {variant === "wedding"
                  ? "🌴 Optional Destination Experiences"
                  : variant === "picnic"
                  ? "🌴 Optional Extras"
                  : "✨ Enhance Your Experience"}
              </h3>
              <p className="wp-extras-sub">
                {variant === "wedding"
                  ? "Make your wedding trip even more memorable with:"
                  : variant === "picnic"
                  ? "Personalise your picnic with any of these:"
                  : "Make your proposal even more memorable with our additional services:"}
              </p>
              <ul className="wp-extras-grid">
                {pkg.extras.map((extra) => (
                  <li key={extra.label} className="wp-extra-item">
                    <span className="wp-extra-label">{extra.label}</span>
                    <span className="wp-extra-price">
                      {typeof extra.price === "number"
                        ? `$${extra.price}`
                        : extra.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tagline */}
            {(variant === "wedding" || variant === "picnic") && pkg.tagline && (
              <p className="wp-tagline">✨ {pkg.tagline} ✨</p>
            )}

            {/* CTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="wp-cta-button"
            >
              💬 Enquire on WhatsApp
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Sidebar */}
          <aside className="wp-package-sidebar">
            <div className="wp-sidebar-card">
              <span className="wp-sidebar-label">{sidebarCopy.label}</span>
              <h3>{sidebarCopy.title}</h3>
              {sidebarCopy.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="wp-sidebar-button"
              >
                💬 {sidebarCopy.cta}
              </a>
              <Link to="/contact" className="wp-sidebar-back">
                Or contact us →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

function WeddingProposals() {
  const { t } = useTranslation();

  return (
    <main className="wp-page">
      {/* HERO */}
      <header className="wp-hero">
        <div className="wp-hero-bg" aria-hidden="true" />
        <div className="wp-hero-overlay" aria-hidden="true" />

        <div className="container wp-hero-inner">
          <span className="wp-hero-eyebrow">
            💍 {t("weddings.eyebrow", "Weddings & Proposals")}
          </span>
          <h1>{t("weddings.title", "Say Yes in Zanzibar.")}</h1>
          <p>
            {t(
              "weddings.subtitle",
              "Romantic beachside proposals, elegant arches, glowing signs, and unforgettable moments — designed by our team, styled for you."
            )}
          </p>

          <div className="wp-hero-actions">
            <a
              href="#classic-proposal"
              className="wp-hero-button wp-hero-button--primary"
            >
              Classic Proposal
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#signature-proposal"
              className="wp-hero-button wp-hero-button--ghost"
            >
              Signature Proposal
            </a>
            <a
              href="#luxury-picnic"
              className="wp-hero-button wp-hero-button--picnic"
            >
              🌸 Luxury Picnic
            </a>
            <a
              href="#destination-wedding"
              className="wp-hero-button wp-hero-button--wedding"
            >
              💍 Destination Wedding
            </a>
          </div>
        </div>
      </header>

      {/* PROPOSALS */}
      <PackageSection pkg={CLASSIC_PACKAGE} variant="proposal" />
      <PackageSection pkg={SIGNATURE_PACKAGE} variant="proposal" />

      {/* PICNIC */}
      <PackageSection pkg={PICNIC_PACKAGE} variant="picnic" />

      {/* WEDDINGS */}
      <PackageSection pkg={WEDDING_PACKAGE} variant="wedding" />

      {/* FINAL CTA */}
      <section className="wp-final-cta">
        <div className="container">
          <div className="wp-final-cta-inner">
            <span className="wp-eyebrow wp-eyebrow--light">
              YOUR MOMENT, OUR CRAFT
            </span>
            <h2>Let's create your unforgettable moment.</h2>
            <p>
              Tell us your date and vision — we'll design the rest. Every
              proposal, picnic, and wedding is fully customisable.
            </p>

            <div className="wp-final-cta-actions">
              <a
                href={buildWhatsAppLink(
                  "Hello ZAN GATES, I'd like to plan a proposal, picnic, or wedding in Zanzibar."
                )}
                target="_blank"
                rel="noreferrer"
                className="wp-cta-button wp-cta-button--light"
              >
                💬 Plan on WhatsApp
                <span aria-hidden="true">→</span>
              </a>
              <Link
                to="/contact"
                className="wp-cta-button wp-cta-button--ghost"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default WeddingProposals;