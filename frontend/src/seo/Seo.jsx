import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
    OG_IMAGE_HEIGHT,
    OG_IMAGE_WIDTH,
    SITE_LOCALE,
    SITE_NAME,
    absoluteUrl,
    isTransformedOgImage,
    ogImageUrl,
    truncate,
    withBrand,
} from "./site";

const JSONLD_ATTR = "data-seo-jsonld";

const ROBOTS_INDEX =
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const ROBOTS_NOINDEX = "noindex, nofollow";


function setMeta(attr, key, content) {
    let element = document.head.querySelector(`meta[${attr}="${key}"]`);

    if (!content) {
        if (element) element.remove();
        return;
    }

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

function setLink(rel, href) {
    let element = document.head.querySelector(`link[rel="${rel}"]`);

    if (!href) {
        if (element) element.remove();
        return;
    }

    if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
    }

    element.setAttribute("href", href);
}


/* =========================================================
   <Seo />
   Keeps <head> in sync with the current page. The server
   (backend/src/Seo) already ships correct tags in the first
   HTML response; this component takes over after hydration
   and on every client-side navigation.
   ========================================================= */

function Seo({
    title,
    description,
    keywords,
    path,
    image,
    imageAlt,
    type = "website",
    noindex = false,
    jsonLd = null,
}) {
    const { pathname } = useLocation();

    const canonicalPath = path ?? pathname;
    const keywordsText = Array.isArray(keywords)
        ? keywords.join(", ")
        : keywords || "";
    const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

    useEffect(() => {
        const fullTitle = withBrand(title);
        const metaDescription = truncate(description, 160);
        const canonical = absoluteUrl(canonicalPath);
        const socialImage = ogImageUrl(image);

        document.title = fullTitle;

        setMeta("name", "description", metaDescription);
        setMeta("name", "keywords", keywordsText);
        setMeta("name", "robots", noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
        setLink("canonical", noindex ? "" : canonical);

        setMeta("property", "og:type", type);
        setMeta("property", "og:site_name", SITE_NAME);
        setMeta("property", "og:locale", SITE_LOCALE);
        setMeta("property", "og:title", fullTitle);
        setMeta("property", "og:description", metaDescription);
        setMeta("property", "og:url", canonical);
        setMeta("property", "og:image", socialImage);
        setMeta("property", "og:image:alt", imageAlt || fullTitle);
        setMeta(
            "property",
            "og:image:width",
            isTransformedOgImage(socialImage) ? String(OG_IMAGE_WIDTH) : ""
        );
        setMeta(
            "property",
            "og:image:height",
            isTransformedOgImage(socialImage) ? String(OG_IMAGE_HEIGHT) : ""
        );

        setMeta("name", "twitter:card", "summary_large_image");
        setMeta("name", "twitter:title", fullTitle);
        setMeta("name", "twitter:description", metaDescription);
        setMeta("name", "twitter:image", socialImage);
        setMeta("name", "twitter:image:alt", imageAlt || fullTitle);

        document
            .querySelectorAll(`script[${JSONLD_ATTR}="page"]`)
            .forEach((node) => node.remove());

        if (jsonLdText) {
            const documents = JSON.parse(jsonLdText);

            (Array.isArray(documents) ? documents : [documents]).forEach(
                (schema) => {
                    const script = document.createElement("script");
                    script.type = "application/ld+json";
                    script.setAttribute(JSONLD_ATTR, "page");
                    script.text = JSON.stringify(schema);
                    document.head.appendChild(script);
                }
            );
        }
    }, [
        title,
        description,
        keywordsText,
        canonicalPath,
        image,
        imageAlt,
        type,
        noindex,
        jsonLdText,
    ]);

    return null;
}

export default Seo;
