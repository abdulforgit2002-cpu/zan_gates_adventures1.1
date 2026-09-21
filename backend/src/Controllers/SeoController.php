<?php

class SeoController
{
    private PDO $db;
    private SeoResolver $resolver;

    private const NAV_LINKS = [
        ['/tours', 'Zanzibar excursions & tours'],
        ['/safaris', 'Tanzania safaris'],
        ['/destinations', 'Destinations'],
        ['/hotels', 'Hotels & lodges'],
        ['/transfers', 'Airport transfers'],
        ['/wedding-and-proposals', 'Weddings & proposals'],
        ['/about', 'About us'],
        ['/contact', 'Contact'],
    ];

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->resolver = new SeoResolver($db);
    }


    /*
    |--------------------------------------------------------------------------
    | robots.txt for the API host
    |--------------------------------------------------------------------------
    |
    | The public site serves its own static robots.txt (frontend/public);
    | this one only exists so the API subdomain is never indexed.
    |
    */

    public function robots(): never
    {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\nDisallow: /\n";
        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | Sitemaps
    |--------------------------------------------------------------------------
    */

    public function sitemapIndex(): never
    {
        $toursLast = $this->lastModified($this->resolver->activeTours(), 'updated_at');
        $destinationsLast = $this->lastModified(
            $this->resolver->destinationsWithTours(),
            'last_tour_update'
        );

        $children = [
            ['/sitemap-pages.xml', max($toursLast ?: 0, $destinationsLast ?: 0) ?: null],
            ['/sitemap-tours.xml', $toursLast],
            ['/sitemap-destinations.xml', $destinationsLast],
            ['/sitemap-hotels.xml', null],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($children as [$path, $lastModified]) {
            $xml .= "  <sitemap>\n    <loc>" . $this->x(SiteData::absolute($path)) . "</loc>\n";

            if ($lastModified) {
                $xml .= '    <lastmod>' . gmdate('c', $lastModified) . "</lastmod>\n";
            }

            $xml .= "  </sitemap>\n";
        }

        $this->sendXml($xml . '</sitemapindex>' . "\n");
    }

    public function sitemapPages(): never
    {
        $data = SiteData::frontendData();
        $toursLast = $this->lastModified($this->resolver->activeTours(), 'updated_at');
        $destinationsLast = $this->lastModified(
            $this->resolver->destinationsWithTours(),
            'last_tour_update'
        );

        $entries = [];

        if ($data['pages']) {
            foreach ($data['pages'] as $path => $meta) {
                $entries[] = [
                    'path' => $path,
                    'changefreq' => $meta['changefreq'] ?? 'monthly',
                    'priority' => $meta['priority'] ?? 0.5,
                ];
            }
        } else {
            foreach (SiteData::FALLBACK_PAGES as $path) {
                $entries[] = ['path' => $path, 'changefreq' => 'weekly', 'priority' => 0.5];
            }
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($entries as $entry) {
            $lastModified = match ($entry['path']) {
                '/', '/tours', '/safaris' => $toursLast,
                '/destinations' => $destinationsLast,
                default => null,
            };

            $xml .= $this->urlEntry(
                SiteData::absolute($entry['path']),
                $lastModified,
                $entry['changefreq'],
                (float) $entry['priority']
            );
        }

        $this->sendXml($xml . '</urlset>' . "\n");
    }

    public function sitemapTours(): never
    {
        $tours = $this->resolver->activeTours();

        $imageRows = $this->db->query(
            "SELECT ti.tour_id, ti.image_url, ti.alt_text
             FROM tour_images ti
             INNER JOIN tours t ON t.id = ti.tour_id AND t.status = 'ACTIVE'
             ORDER BY ti.tour_id, ti.is_primary DESC, ti.sort_order ASC, ti.id ASC"
        )->fetchAll(PDO::FETCH_ASSOC);

        $imagesByTour = [];

        foreach ($imageRows as $row) {
            $imagesByTour[$row['tour_id']][] = $row;
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' .
            'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        foreach ($tours as $tour) {
            $images = [];

            foreach (array_slice($imagesByTour[$tour['id']] ?? [], 0, 10) as $image) {
                $images[] = [
                    'loc' => $image['image_url'],
                    'title' => $tour['title'],
                    'caption' => $image['alt_text'] ?: $tour['title'],
                ];
            }

            $xml .= $this->urlEntry(
                SiteData::absolute('/tours/' . rawurlencode($tour['slug'])),
                strtotime($tour['updated_at'] . ' UTC') ?: null,
                'weekly',
                0.9,
                $images
            );
        }

        $this->sendXml($xml . '</urlset>' . "\n");
    }

    public function sitemapDestinations(): never
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($this->resolver->destinationsWithTours() as $destination) {
            $lastModified = max(
                strtotime($destination['updated_at'] . ' UTC') ?: 0,
                strtotime($destination['last_tour_update'] . ' UTC') ?: 0
            );

            $xml .= $this->urlEntry(
                SiteData::absolute('/destinations/' . rawurlencode($destination['slug'])),
                $lastModified ?: null,
                'weekly',
                0.8
            );
        }

        $this->sendXml($xml . '</urlset>' . "\n");
    }

    public function sitemapHotels(): never
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" .
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' .
            'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        foreach (SiteData::frontendData()['hotels'] as $hotel) {
            $images = [];

            foreach (array_slice($hotel['images'] ?? [], 0, 6) as $index => $url) {
                $images[] = [
                    'loc' => $url,
                    'title' => $hotel['name'],
                    'caption' => $hotel['name'] . ' — view ' . ($index + 1),
                ];
            }

            $xml .= $this->urlEntry(
                SiteData::absolute('/hotels/' . rawurlencode($hotel['slug'])),
                null,
                'monthly',
                0.6,
                $images
            );
        }

        $this->sendXml($xml . '</urlset>' . "\n");
    }

    private function urlEntry(
        string $loc,
        ?int $lastModified,
        string $changefreq,
        float $priority,
        array $images = []
    ): string {
        $xml = "  <url>\n    <loc>" . $this->x($loc) . "</loc>\n";

        if ($lastModified) {
            $xml .= '    <lastmod>' . gmdate('c', $lastModified) . "</lastmod>\n";
        }

        $xml .= '    <changefreq>' . $this->x($changefreq) . "</changefreq>\n";
        $xml .= '    <priority>' . number_format($priority, 1, '.', '') . "</priority>\n";

        foreach ($images as $image) {
            $xml .= "    <image:image>\n" .
                '      <image:loc>' . $this->x($image['loc']) . "</image:loc>\n" .
                '      <image:title>' . $this->x($image['title']) . "</image:title>\n" .
                '      <image:caption>' . $this->x($image['caption']) . "</image:caption>\n" .
                "    </image:image>\n";
        }

        return $xml . "  </url>\n";
    }

    /* Newest timestamp (unix) of a column across rows, or null. */
    private function lastModified(array $rows, string $column): ?int
    {
        $latest = 0;

        foreach ($rows as $row) {
            if (!empty($row[$column])) {
                $latest = max($latest, strtotime($row[$column] . ' UTC') ?: 0);
            }
        }

        return $latest ?: null;
    }

    private function x(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private function sendXml(string $xml): never
    {
        header('Content-Type: application/xml; charset=utf-8');
        header('Cache-Control: public, max-age=600');
        echo $xml;
        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | HTML renderer
    |--------------------------------------------------------------------------
    |
    | GET /seo/render, called by the frontend's nginx for every page URL that
    | is not a static file. Returns the built index.html with this route's
    | <head> tags, JSON-LD and crawler-visible content already in place, and
    | the right HTTP status. Any failure answers 5xx so nginx serves the plain
    | static index.html instead — the site never goes down because of SEO.
    |
    */

    public function render(): never
    {
        $uri = $_SERVER['HTTP_X_ORIGINAL_URI'] ?? ($_GET['path'] ?? '/');

        $shell = SiteData::fetchShell();

        if ($shell === null || !SiteData::frontendData()['available']) {
            $this->plain(503, 'Frontend shell unavailable.');
        }

        try {
            $page = $this->resolver->resolve((string) $uri);
        } catch (Throwable $e) {
            error_log('SEO render error: ' . $e->getMessage());
            $this->plain(503, 'SEO renderer error.');
        }

        $html = $this->inject($shell, $this->headBlock($page), $this->noscriptBlock($page));

        http_response_code($page['status']);
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-cache');
        echo $html;
        exit;
    }

    private function plain(int $status, string $message): never
    {
        http_response_code($status);
        header('Content-Type: text/plain; charset=utf-8');
        echo $message;
        exit;
    }

    private function headBlock(array $page): string
    {
        $e = fn (?string $value) => SiteData::e($value);

        $canonical = SiteData::absolute($page['path']);
        $image = SiteData::ogImage($page['image']);
        $imageAlt = $page['imageAlt'] ?: $page['title'];
        $robots = $page['noindex']
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

        $tags = [];
        $tags[] = '<title>' . $e($page['title']) . '</title>';
        $tags[] = '<meta name="description" content="' . $e($page['description']) . '" />';

        if ($page['keywords']) {
            $tags[] = '<meta name="keywords" content="' . $e(implode(', ', $page['keywords'])) . '" />';
        }

        $tags[] = '<meta name="robots" content="' . $e($robots) . '" />';

        if (!$page['noindex']) {
            $tags[] = '<link rel="canonical" href="' . $e($canonical) . '" />';
        }

        $tags[] = '<meta property="og:type" content="' . $e($page['type']) . '" />';
        $tags[] = '<meta property="og:site_name" content="' . $e(SiteData::NAME) . '" />';
        $tags[] = '<meta property="og:locale" content="en_US" />';
        $tags[] = '<meta property="og:title" content="' . $e($page['title']) . '" />';
        $tags[] = '<meta property="og:description" content="' . $e($page['description']) . '" />';
        $tags[] = '<meta property="og:url" content="' . $e($canonical) . '" />';
        $tags[] = '<meta property="og:image" content="' . $e($image) . '" />';
        $tags[] = '<meta property="og:image:alt" content="' . $e($imageAlt) . '" />';

        if (SiteData::isTransformedOgImage($image)) {
            $tags[] = '<meta property="og:image:width" content="1200" />';
            $tags[] = '<meta property="og:image:height" content="630" />';
        }

        if ($page['product']) {
            $tags[] = '<meta property="product:price:amount" content="' . $e($page['product']['amount']) . '" />';
            $tags[] = '<meta property="product:price:currency" content="' . $e($page['product']['currency']) . '" />';
        }

        $tags[] = '<meta name="twitter:card" content="summary_large_image" />';
        $tags[] = '<meta name="twitter:title" content="' . $e($page['title']) . '" />';
        $tags[] = '<meta name="twitter:description" content="' . $e($page['description']) . '" />';
        $tags[] = '<meta name="twitter:image" content="' . $e($image) . '" />';
        $tags[] = '<meta name="twitter:image:alt" content="' . $e($imageAlt) . '" />';

        if (!empty($page['preload'])) {
            $tags[] = '<link rel="preload" as="image" href="' . $e($page['preload']) . '" fetchpriority="high" />';
        }

        $tags[] = '<script type="application/ld+json" data-seo-jsonld="site">' .
            SiteData::json(SchemaBuilder::siteGraph()) . '</script>';

        foreach ($page['jsonld'] as $schema) {
            $tags[] = '<script type="application/ld+json" data-seo-jsonld="page">' .
                SiteData::json($schema) . '</script>';
        }

        return '    ' . implode("\n    ", $tags);
    }

    private function noscriptBlock(array $page): string
    {
        $e = fn (?string $value) => SiteData::e($value);

        $html = '<noscript><header><h1>' . $e($page['heading']) . '</h1>';

        if ($page['intro'] !== '') {
            $html .= '<p>' . $e($page['intro']) . '</p>';
        }

        $html .= '</header>';

        if ($page['body'] !== '') {
            $html .= '<main>' . $page['body'] . '</main>';
        }

        $html .= '<nav aria-label="Main"><ul><li><a href="/">Home</a></li>';

        foreach (self::NAV_LINKS as [$path, $label]) {
            $html .= '<li><a href="' . $e($path) . '">' . $e($label) . '</a></li>';
        }

        $html .= '</ul></nav><p>ZAN GATES Adventures · WhatsApp ' . $e(SiteData::PHONE) .
            ' · <a href="mailto:' . $e(SiteData::EMAIL) . '">' . $e(SiteData::EMAIL) . '</a></p>' .
            '<p>Please enable JavaScript to book and browse the full site.</p></noscript>';

        return $html;
    }

    /*
     * Splices the generated blocks into the built index.html using plain
     * string operations (no regex replacement strings), so page content can
     * never be misread as a back-reference.
     */
    private function inject(string $shell, string $head, string $noscript): string
    {
        $html = $this->replaceBetween($shell, '<!--seo:start-->', '<!--seo:end-->', $head);

        if ($html === null) {
            $html = (string) preg_replace('#<title>.*?</title>#is', '', $shell, 1);
            $html = (string) preg_replace('#<meta\s+name="description"[^>]*>#is', '', $html, 1);
            $html = str_replace('</head>', $head . "\n  </head>", $html);
        }

        $withNoscript = $this->replaceBetween(
            $html,
            '<!--seo:noscript:start-->',
            '<!--seo:noscript:end-->',
            $noscript
        );

        if ($withNoscript !== null) {
            return $withNoscript;
        }

        return str_replace('<div id="root">', $noscript . '<div id="root">', $html);
    }

    private function replaceBetween(string $html, string $start, string $end, string $replacement): ?string
    {
        $startAt = strpos($html, $start);

        if ($startAt === false) {
            return null;
        }

        $endAt = strpos($html, $end, $startAt);

        if ($endAt === false) {
            return null;
        }

        return substr($html, 0, $startAt) .
            $start . "\n" . $replacement . "\n    " .
            substr($html, $endAt);
    }
}
