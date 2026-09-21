import pages from "./pages.json";

/* Static-page SEO metadata (single source of truth, also consumed by the
   backend renderer + sitemap through the emitted /seo-data.json). */
export const pageSeo = (path) => ({ ...pages[path], path });

export default pages;
