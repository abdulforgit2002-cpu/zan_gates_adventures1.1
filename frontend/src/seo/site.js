/* =========================================================
   SITE-WIDE SEO CONSTANTS + HELPERS
   Shared by <Seo />, the JSON-LD builders and the build-time
   seo-data.json emitter. The PHP renderer (backend/src/Seo)
   mirrors ogImageUrl() / truncate() — keep them in sync.
   ========================================================= */

export const SITE_URL = (
    import.meta.env?.VITE_SITE_URL || "https://zanzibargates.co.tz"
).replace(/\/+$/, "");

export const SITE_NAME = "ZAN GATES Adventures";
export const SITE_LEGAL_NAME = "ZAN GATES ADVENTURES";
export const SITE_LOCALE = "en_US";

export const SITE_PHONE = "+255658450092";
export const SITE_EMAIL = "adventures@zanzibargates.co.tz";

export const SITE_SAME_AS = [
    "https://www.facebook.com/share/19SBfqRvNk/",
    "https://www.instagram.com/zanzibar_gates_safaris._",
    "https://www.threads.com/@zanzibar_gates_safaris._",
];

export const LOGO_URL =
    "https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg";

const DEFAULT_OG_SOURCE =
    "https://res.cloudinary.com/djczmay2i/image/upload/v1779540443/aaa_faq_ixagv2.webp";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;


/* Absolute URL for a site path ("/tours" -> https://…/tours). */
export function absoluteUrl(path = "/") {
    if (/^https?:\/\//i.test(path)) return path;

    const clean = String(path || "/").split(/[?#]/)[0];
    const normalized = clean.startsWith("/") ? clean : `/${clean}`;

    if (normalized === "/") return `${SITE_URL}/`;

    return `${SITE_URL}${normalized.replace(/\/+$/, "")}`;
}


/*
 * Social networks crop/reject arbitrary image sizes and many do not
 * render WebP. For Cloudinary images with no existing transformation,
 * request a 1200x630 JPEG crop; any other URL is returned untouched.
 */
export function ogImageUrl(url) {
    const source = url || DEFAULT_OG_SOURCE;

    const match = String(source).match(
        /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)\.(?:webp|png|jpe?g|avif|gif)$/i
    );

    if (!match) return source;

    return (
        `${match[1]}c_fill,g_auto,w_${OG_IMAGE_WIDTH},h_${OG_IMAGE_HEIGHT},q_auto,f_jpg/` +
        `${match[2]}.jpg`
    );
}

export function isTransformedOgImage(url) {
    return /\/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg\//.test(String(url || ""));
}


/* Plain-text snippet for meta descriptions (<= ~155 chars, word-safe). */
export function truncate(text, max = 155) {
    const clean = String(text || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (clean.length <= max) return clean;

    const cut = clean.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(" ");

    return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}


export function withBrand(title) {
    const clean = String(title || "").trim();

    if (!clean) return SITE_NAME;
    if (clean.toLowerCase().includes("zan gates")) return clean;

    return `${clean} | ${SITE_NAME}`;
}
