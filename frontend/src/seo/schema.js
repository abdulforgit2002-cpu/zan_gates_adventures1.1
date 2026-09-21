import pages from "./pages.json";

import {
    SITE_NAME,
    SITE_URL,
    absoluteUrl,
    truncate,
} from "./site";

/* =========================================================
   JSON-LD BUILDERS (schema.org)
   Only ever describe things that are really on the page —
   no invented ratings, reviews or availability claims.
   The site-wide TravelAgency + WebSite graph lives in
   index.html / the server renderer, so pages reference it
   by @id instead of repeating it.
   ========================================================= */

const CONTEXT = "https://schema.org";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const organizationRef = { "@id": ORGANIZATION_ID };


export function breadcrumbSchema(items) {
    return {
        "@context": CONTEXT,
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
        })),
    };
}


export function webPageSchema({
    type = "WebPage",
    name,
    description,
    path,
    image,
}) {
    return {
        "@context": CONTEXT,
        "@type": type,
        "@id": `${absoluteUrl(path)}#webpage`,
        url: absoluteUrl(path),
        name,
        description: truncate(description, 300),
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        about: organizationRef,
        ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image } } : {}),
    };
}


export function itemListSchema(name, items) {
    return {
        "@context": CONTEXT,
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(item.path),
            name: item.name,
            ...(item.image ? { image: item.image } : {}),
        })),
    };
}


/* Lowest-price Offer(s) from the tour_prices rows the page already shows. */
function buildOffers(prices, url) {
    const usable = (prices || [])
        .map((row) => ({
            price: Number(row?.price),
            currency: String(row?.currency || "USD").toUpperCase(),
        }))
        .filter((row) => Number.isFinite(row.price) && row.price > 0);

    if (usable.length === 0) return null;

    const currency = usable.slice().sort((a, b) => a.price - b.price)[0]
        .currency;
    const sameCurrency = usable.filter((row) => row.currency === currency);
    const low = Math.min(...sameCurrency.map((row) => row.price));
    const high = Math.max(...sameCurrency.map((row) => row.price));

    if (low === high) {
        return {
            "@type": "Offer",
            url,
            price: low.toFixed(2),
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            seller: organizationRef,
        };
    }

    return {
        "@type": "AggregateOffer",
        url,
        lowPrice: low.toFixed(2),
        highPrice: high.toFixed(2),
        priceCurrency: currency,
        offerCount: sameCurrency.length,
        availability: "https://schema.org/InStock",
        seller: organizationRef,
    };
}


export function tourSchema({ tour, images = [], prices = [], path }) {
    const url = absoluteUrl(path);
    const offers = buildOffers(prices, url);
    const imageUrls = images.filter(Boolean).slice(0, 8);

    const properties = [];

    if (tour.duration) {
        properties.push({
            "@type": "PropertyValue",
            name: "Duration",
            value: tour.duration,
        });
    }

    if (tour.departure_location) {
        properties.push({
            "@type": "PropertyValue",
            name: "Departure location",
            value: tour.departure_location,
        });
    }

    if (tour.destination_name) {
        properties.push({
            "@type": "PropertyValue",
            name: "Destination",
            value: tour.destination_name,
        });
    }

    const included = tour.list_items?.include || [];

    if (included.length > 0) {
        properties.push({
            "@type": "PropertyValue",
            name: "Included",
            value: included.join("; "),
        });
    }

    return {
        "@context": CONTEXT,
        "@type": ["Product", "TouristTrip"],
        "@id": `${url}#tour`,
        name: tour.title,
        description: truncate(tour.description || tour.short_description, 5000),
        url,
        sku: `tour-${tour.id}`,
        ...(imageUrls.length ? { image: imageUrls } : {}),
        ...(tour.category_name ? { category: tour.category_name } : {}),
        brand: { "@type": "Brand", name: SITE_NAME },
        provider: organizationRef,
        ...(properties.length ? { additionalProperty: properties } : {}),
        ...(offers ? { offers } : {}),
    };
}


export function destinationSchema({ name, description, path, image }) {
    return {
        "@context": CONTEXT,
        "@type": "TouristDestination",
        "@id": `${absoluteUrl(path)}#destination`,
        name,
        url: absoluteUrl(path),
        ...(description ? { description: truncate(description, 500) } : {}),
        ...(image ? { image } : {}),
    };
}


export function hotelSchema({ hotel, path }) {
    return {
        "@context": CONTEXT,
        "@type": "Hotel",
        "@id": `${absoluteUrl(path)}#hotel`,
        name: hotel.name,
        url: absoluteUrl(path),
        description: truncate(hotel.description, 500),
        ...(hotel.images?.length ? { image: hotel.images.slice(0, 6) } : {}),
        address: {
            "@type": "PostalAddress",
            addressLocality: String(hotel.location || "").split(",")[0].trim(),
            addressCountry: "TZ",
        },
        ...(hotel.highlights?.length
            ? {
                  amenityFeature: hotel.highlights.map((text) => ({
                      "@type": "LocationFeatureSpecification",
                      name: text,
                      value: true,
                  })),
              }
            : {}),
    };
}


export function serviceSchema({
    name,
    description,
    path,
    serviceType,
    lowPrice,
    highPrice,
    currency = "USD",
    areaServed = "Zanzibar, Tanzania",
}) {
    return {
        "@context": CONTEXT,
        "@type": "Service",
        "@id": `${absoluteUrl(path)}#service`,
        name,
        description: truncate(description, 500),
        url: absoluteUrl(path),
        serviceType,
        provider: organizationRef,
        areaServed: { "@type": "Place", name: areaServed },
        ...(lowPrice
            ? {
                  offers: {
                      "@type": "AggregateOffer",
                      lowPrice: Number(lowPrice).toFixed(2),
                      ...(highPrice
                          ? { highPrice: Number(highPrice).toFixed(2) }
                          : {}),
                      priceCurrency: currency,
                  },
              }
            : {}),
    };
}


/* =========================================================
   PAGE-LEVEL COMPOSITION
   ========================================================= */

/*
 * WebPage (+ Service for pages that sell one) + BreadcrumbList for a static
 * page, built from pages.json — identical to what the server renders.
 */
export function pageJsonLd(path, extra = []) {
    const meta = pages[path];
    const config = meta.schema || { type: "WebPage" };
    const documents = [];

    if (config.type === "Service") {
        documents.push(
            webPageSchema({
                type: "WebPage",
                name: meta.title,
                description: meta.description,
                path,
            })
        );

        documents.push(
            serviceSchema({
                name: config.name || meta.heading,
                description: meta.description,
                path,
                serviceType: config.serviceType,
                lowPrice: config.lowPrice,
                highPrice: config.highPrice,
                currency: config.currency,
            })
        );
    } else {
        documents.push(
            webPageSchema({
                type: config.type,
                name: meta.title,
                description: meta.description,
                path,
            })
        );
    }

    if (path !== "/") {
        documents.push(
            breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: meta.label || meta.heading, path },
            ])
        );
    }

    return [...documents, ...extra];
}


/* Same rules as SeoResolver::tourTitle() on the server. */
export function tourSeoTitle(tour) {
    const title = String(tour?.title || "").trim();
    const destination = String(tour?.destination_name || "").trim();

    if (
        destination &&
        !title.toLowerCase().includes(destination.toLowerCase()) &&
        `${title} – ${destination}`.length + 23 <= 65
    ) {
        return `${title} – ${destination}`;
    }

    return title;
}


/* Same rules as SeoResolver::tourPage() on the server. */
export function tourSeoDescription(tour, prices = []) {
    let description = truncate(
        tour?.short_description || tour?.description,
        155
    );

    if (!description) {
        description =
            `${tour?.title} in ${tour?.destination_name || "Zanzibar"} with ` +
            `${SITE_NAME}. See prices, what is included and send a booking enquiry.`;
    }

    const lowest = (prices || [])
        .filter((row) => Number(row?.price) > 0)
        .sort((a, b) => Number(a.price) - Number(b.price))[0];

    if (lowest) {
        const currency = String(lowest.currency || "USD").toUpperCase();
        const amount = Number(lowest.price).toLocaleString("en-US", {
            maximumFractionDigits: 0,
        });
        const label = currency === "USD" ? `$${amount}` : `${currency} ${amount}`;
        const suffix =
            ` From ${label}` +
            (lowest.pricing_type === "PER_PERSON" ? " per person." : ".");

        if (description.length + suffix.length <= 160) {
            description += suffix;
        }
    }

    return description;
}
