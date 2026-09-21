<?php

/*
|--------------------------------------------------------------------------
| SeoResolver
|--------------------------------------------------------------------------
|
| Maps a public URL path to everything a search engine or link-preview bot
| needs for that page: title, description, canonical URL, Open Graph data,
| JSON-LD, crawler-visible body text and the correct HTTP status (a real
| 404 for unknown tours/pages instead of the SPA's "200 for everything").
|
| Static-page copy comes from the frontend build (seo-data.json); tours and
| destinations come from the live database, hotels from the frontend's
| hotel catalog.
|
*/

class SeoResolver
{
    private const SLUG_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    private const PRIMARY_IMAGE_SQL = "(SELECT ti.image_url FROM tour_images ti
        WHERE ti.tour_id = t.id
        ORDER BY ti.is_primary DESC, ti.sort_order ASC, ti.id ASC
        LIMIT 1)";

    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    public function resolve(string $rawPath): array
    {
        $path = $this->normalize($rawPath);

        if ($path === '/admin' || str_starts_with($path, '/admin/')) {
            return $this->noindexPage(
                'Administration',
                'ZAN GATES Adventures administration.',
                $path
            );
        }

        $pages = SiteData::frontendData()['pages'];

        if (isset($pages[$path])) {
            return $this->staticPage($path, $pages[$path]);
        }

        if (preg_match('#^/tours/([^/]+)$#', $path, $m)) {
            return $this->tourPage(rawurldecode($m[1]));
        }

        if (preg_match('#^/destinations/([^/]+)$#', $path, $m)) {
            return $this->destinationPage(rawurldecode($m[1]));
        }

        if (preg_match('#^/hotels/([^/]+)$#', $path, $m)) {
            return $this->hotelPage(rawurldecode($m[1]));
        }

        if (preg_match('#^/book/([^/]+)$#', $path, $m)) {
            return $this->bookingPage(rawurldecode($m[1]));
        }

        return $this->notFound($path);
    }

    private function normalize(string $rawPath): string
    {
        // "//tours//x" would otherwise be parsed as a network-path reference
        // (host "tours"), so collapse leading slashes before parse_url().
        $rawPath = '/' . ltrim($rawPath, '/');

        $path = parse_url($rawPath, PHP_URL_PATH);
        $path = is_string($path) && $path !== '' ? $path : '/';
        $path = '/' . trim((string) preg_replace('#/+#', '/', $path), '/');

        return $path === '' ? '/' : $path;
    }


    /*
    |--------------------------------------------------------------------------
    | Static pages
    |--------------------------------------------------------------------------
    */

    private function staticPage(string $path, array $meta): array
    {
        $schemaConfig = $meta['schema'] ?? ['type' => 'WebPage'];
        $type = $schemaConfig['type'] ?? 'WebPage';
        $title = (string) $meta['title'];
        $description = (string) $meta['description'];

        $jsonld = [];

        if ($type === 'Service') {
            $jsonld[] = SchemaBuilder::webPage('WebPage', $title, $description, $path);
            $jsonld[] = SchemaBuilder::service(
                (string) ($schemaConfig['name'] ?? $meta['heading']),
                $description,
                $path,
                (string) ($schemaConfig['serviceType'] ?? 'Service'),
                isset($schemaConfig['lowPrice']) ? (float) $schemaConfig['lowPrice'] : null,
                isset($schemaConfig['highPrice']) ? (float) $schemaConfig['highPrice'] : null,
                (string) ($schemaConfig['currency'] ?? 'USD')
            );
        } else {
            $jsonld[] = SchemaBuilder::webPage($type, $title, $description, $path);
        }

        if ($path !== '/') {
            $jsonld[] = SchemaBuilder::breadcrumb([
                ['name' => 'Home', 'path' => '/'],
                ['name' => (string) ($meta['label'] ?? $meta['heading']), 'path' => $path],
            ]);
        }

        $body = '';

        if ($path === '/' || $path === '/tours') {
            $tours = $this->activeTours($path === '/' ? 12 : null);

            if ($tours) {
                $items = array_map(fn ($tour) => $this->tourListItem($tour), $tours);
                $jsonld[] = SchemaBuilder::itemList(
                    $path === '/' ? 'Featured Zanzibar tours' : 'Zanzibar excursions and tours',
                    $items
                );
                $body .= '<h2>Our tours</h2>' . $this->listHtml($items);
            }
        }

        if ($path === '/destinations') {
            $items = array_map(
                fn ($destination) => [
                    'name' => $destination['name'],
                    'path' => '/destinations/' . rawurlencode($destination['slug']),
                    'description' => $destination['tour_count'] . ' ' .
                        ($destination['tour_count'] === 1 ? 'tour' : 'tours'),
                ],
                $this->destinationsWithTours()
            );

            if ($items) {
                $jsonld[] = SchemaBuilder::itemList('Zanzibar and Tanzania destinations', $items);
                $body .= '<h2>Destinations</h2>' . $this->listHtml($items);
            }
        }

        if ($path === '/hotels') {
            $items = array_map(
                fn ($hotel) => [
                    'name' => $hotel['name'],
                    'path' => '/hotels/' . rawurlencode($hotel['slug']),
                    'image' => $hotel['images'][0] ?? null,
                    'description' => ($hotel['location'] ?? '') . ' — ' . ($hotel['tagline'] ?? ''),
                ],
                SiteData::frontendData()['hotels']
            );

            if ($items) {
                $jsonld[] = SchemaBuilder::itemList('Hotels and safari lodges', $items);
                $body .= '<h2>Hotels and lodges</h2>' . $this->listHtml($items);
            }
        }

        if ($path === '/contact') {
            $body .= '<p>WhatsApp / phone: ' . SiteData::e(SiteData::PHONE) .
                '<br>Email: <a href="mailto:' . SiteData::e(SiteData::EMAIL) . '">' .
                SiteData::e(SiteData::EMAIL) . '</a></p>';
        }

        return [
            'status' => 200,
            'title' => $title,
            'description' => $description,
            'keywords' => $meta['keywords'] ?? [],
            'path' => $path,
            'image' => null,
            'imageAlt' => null,
            'type' => 'website',
            'noindex' => false,
            'jsonld' => $jsonld,
            'heading' => (string) ($meta['heading'] ?? $title),
            'intro' => (string) ($meta['intro'] ?? $description),
            'body' => $body,
            'preload' => $meta['preload'] ?? null,
            'product' => null,
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Tours
    |--------------------------------------------------------------------------
    */

    private function tourPage(string $slug): array
    {
        if (!preg_match(self::SLUG_PATTERN, $slug)) {
            return $this->notFound('/tours/' . $slug);
        }

        $statement = $this->db->prepare(
            "SELECT t.id, t.title, t.slug, t.short_description, t.description,
                    t.duration, t.departure_location,
                    c.name AS category_name, d.name AS destination_name,
                    d.slug AS destination_slug
             FROM tours t
             INNER JOIN categories c ON c.id = t.category_id
             INNER JOIN destinations d ON d.id = t.destination_id
             WHERE t.slug = :slug AND t.status = 'ACTIVE'
             LIMIT 1"
        );
        $statement->execute([':slug' => $slug]);
        $tour = $statement->fetch(PDO::FETCH_ASSOC);

        if (!$tour) {
            return $this->notFound('/tours/' . $slug);
        }

        $path = '/tours/' . rawurlencode($tour['slug']);

        $imageStatement = $this->db->prepare(
            "SELECT image_url, alt_text FROM tour_images
             WHERE tour_id = :id
             ORDER BY is_primary DESC, sort_order ASC, id ASC"
        );
        $imageStatement->execute([':id' => $tour['id']]);
        $images = $imageStatement->fetchAll(PDO::FETCH_ASSOC);
        $imageUrls = array_column($images, 'image_url');

        $priceStatement = $this->db->prepare(
            "SELECT pricing_type, price, currency FROM tour_prices
             WHERE tour_id = :id ORDER BY price ASC"
        );
        $priceStatement->execute([':id' => $tour['id']]);
        $prices = $priceStatement->fetchAll(PDO::FETCH_ASSOC);

        $listItems = (new Tour($this->db))->getListItems((int) $tour['id']);

        $description = SiteData::truncate(
            $tour['short_description'] ?: $tour['description'],
            155
        );

        if ($description === '') {
            $description = $tour['title'] . ' in ' . $tour['destination_name'] .
                ' with ZAN GATES Adventures. See prices, what is included and send a booking enquiry.';
        }

        $product = null;
        $lowest = $prices[0] ?? null;

        if ($lowest && (float) $lowest['price'] > 0) {
            $currency = strtoupper((string) ($lowest['currency'] ?: 'USD'));
            $amount = (float) $lowest['price'];
            $label = ($currency === 'USD' ? '$' : $currency . ' ') . number_format($amount, 0);
            $suffix = ' From ' . $label .
                ($lowest['pricing_type'] === 'PER_PERSON' ? ' per person.' : '.');

            if (mb_strlen($description) + mb_strlen($suffix) <= 160) {
                $description .= $suffix;
            }

            $product = [
                'amount' => number_format($amount, 2, '.', ''),
                'currency' => $currency,
            ];
        }

        $keywords = array_values(array_unique(array_filter([
            $tour['title'],
            $tour['title'] . ' Zanzibar',
            $tour['destination_name'],
            $tour['category_name'],
            'Zanzibar excursions',
            'book ' . $tour['title'],
        ])));

        $jsonld = [
            SchemaBuilder::webPage('ItemPage', $tour['title'], $description, $path, $imageUrls[0] ?? null),
            SchemaBuilder::breadcrumb([
                ['name' => 'Home', 'path' => '/'],
                ['name' => 'Tours', 'path' => '/tours'],
                ['name' => $tour['title'], 'path' => $path],
            ]),
            SchemaBuilder::tour($tour, $imageUrls, $prices, $listItems, $path),
        ];

        $body = '';

        if ($tour['description']) {
            $body .= '<p>' . SiteData::e(SiteData::truncate($tour['description'], 1500)) . '</p>';
        }

        $facts = array_filter([
            'Destination' => $tour['destination_name'],
            'Category' => $tour['category_name'],
            'Duration' => $tour['duration'],
            'Departure' => $tour['departure_location'],
            'From' => $product ? ($product['currency'] . ' ' . $product['amount']) : null,
        ]);

        if ($facts) {
            $body .= '<ul>';
            foreach ($facts as $label => $value) {
                $body .= '<li><strong>' . SiteData::e($label) . ':</strong> ' . SiteData::e($value) . '</li>';
            }
            $body .= '</ul>';
        }

        foreach ([
            'highlight' => 'Highlights',
            'include' => 'Included',
            'exclude' => 'Not included',
            'activity' => 'Activities',
            'what_to_see' => 'What you will see',
        ] as $key => $heading) {
            if (!empty($listItems[$key])) {
                $body .= '<h2>' . SiteData::e($heading) . '</h2><ul>';
                foreach ($listItems[$key] as $text) {
                    $body .= '<li>' . SiteData::e($text) . '</li>';
                }
                $body .= '</ul>';
            }
        }

        $body .= '<p><a href="/book/' . SiteData::e(rawurlencode($tour['slug'])) . '">Book ' .
            SiteData::e($tour['title']) . '</a> · <a href="/tours">All tours</a> · <a href="/destinations/' .
            SiteData::e(rawurlencode($tour['destination_slug'])) . '">More in ' .
            SiteData::e($tour['destination_name']) . '</a></p>';

        return [
            'status' => 200,
            'title' => $this->tourTitle($tour),
            'description' => $description,
            'keywords' => $keywords,
            'path' => $path,
            'image' => $imageUrls[0] ?? null,
            'imageAlt' => $images[0]['alt_text'] ?? $tour['title'],
            'type' => $product ? 'product' : 'website',
            'noindex' => false,
            'jsonld' => $jsonld,
            'heading' => $tour['title'],
            'intro' => (string) ($tour['short_description'] ?: ''),
            'body' => $body,
            'preload' => $imageUrls[0] ?? null,
            'product' => $product,
        ];
    }

    private function tourTitle(array $tour): string
    {
        $title = $tour['title'];
        $destination = (string) ($tour['destination_name'] ?? '');

        if (
            $destination !== '' &&
            stripos($title, $destination) === false &&
            mb_strlen($title . ' – ' . $destination) + 23 <= 65
        ) {
            $title .= ' – ' . $destination;
        }

        return SiteData::withBrand($title);
    }

    private function bookingPage(string $slug): array
    {
        if (!preg_match(self::SLUG_PATTERN, $slug)) {
            return $this->notFound('/book/' . $slug);
        }

        $statement = $this->db->prepare(
            "SELECT title FROM tours WHERE slug = :slug AND status = 'ACTIVE' LIMIT 1"
        );
        $statement->execute([':slug' => $slug]);
        $tour = $statement->fetch(PDO::FETCH_ASSOC);

        if (!$tour) {
            return $this->notFound('/book/' . $slug);
        }

        return $this->noindexPage(
            'Book ' . $tour['title'],
            'Send a booking enquiry for ' . $tour['title'] . ' with ZAN GATES Adventures.',
            '/book/' . rawurlencode($slug)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Destinations
    |--------------------------------------------------------------------------
    */

    private function destinationPage(string $slug): array
    {
        if (!preg_match(self::SLUG_PATTERN, $slug)) {
            return $this->notFound('/destinations/' . $slug);
        }

        $statement = $this->db->prepare(
            "SELECT id, name, slug, description FROM destinations WHERE slug = :slug LIMIT 1"
        );
        $statement->execute([':slug' => $slug]);
        $destination = $statement->fetch(PDO::FETCH_ASSOC);

        if (!$destination) {
            return $this->notFound('/destinations/' . $slug);
        }

        $path = '/destinations/' . rawurlencode($destination['slug']);

        $tourStatement = $this->db->prepare(
            "SELECT t.id, t.title, t.slug, t.short_description, t.updated_at,
                    d.name AS destination_name,
                    " . self::PRIMARY_IMAGE_SQL . " AS primary_image
             FROM tours t
             INNER JOIN destinations d ON d.id = t.destination_id
             WHERE t.destination_id = :id AND t.status = 'ACTIVE'
             ORDER BY t.featured DESC, t.id ASC"
        );
        $tourStatement->execute([':id' => $destination['id']]);
        $tours = $tourStatement->fetchAll(PDO::FETCH_ASSOC);

        $items = array_map(fn ($tour) => $this->tourListItem($tour), $tours);
        $name = $destination['name'];

        if ($destination['description']) {
            $description = SiteData::truncate($destination['description'], 155);
        } elseif ($tours) {
            $titles = implode(', ', array_slice(array_column($tours, 'title'), 0, 3));
            $description = SiteData::truncate(
                'Book ' . $name . ' tours and excursions with ZAN GATES Adventures: ' . $titles .
                '. Compare prices and send an enquiry.',
                155
            );
        } else {
            $description = 'Tours and excursions in ' . $name . ' with ZAN GATES Adventures.';
        }

        $firstImage = $tours[0]['primary_image'] ?? null;

        $jsonld = [
            SchemaBuilder::webPage('CollectionPage', $name . ' tours', $description, $path, $firstImage),
            SchemaBuilder::breadcrumb([
                ['name' => 'Home', 'path' => '/'],
                ['name' => 'Destinations', 'path' => '/destinations'],
                ['name' => $name, 'path' => $path],
            ]),
            SchemaBuilder::destination($name, $destination['description'], $path, $firstImage),
        ];

        if ($items) {
            $jsonld[] = SchemaBuilder::itemList($name . ' tours', $items);
        }

        $body = '';

        if ($destination['description']) {
            $body .= '<p>' . SiteData::e($destination['description']) . '</p>';
        }

        if ($items) {
            $body .= '<h2>Tours in ' . SiteData::e($name) . '</h2>' . $this->listHtml($items);
        }

        return [
            'status' => 200,
            'title' => SiteData::withBrand($name . ' Tours & Excursions'),
            'description' => $description,
            'keywords' => [$name, $name . ' tours', $name . ' excursions', 'Zanzibar destinations'],
            'path' => $path,
            'image' => $firstImage,
            'imageAlt' => $name,
            'type' => 'website',
            'noindex' => !$tours,
            'jsonld' => $jsonld,
            'heading' => $name . ' tours & excursions',
            'intro' => (string) ($destination['description'] ?: ''),
            'body' => $body,
            'preload' => null,
            'product' => null,
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Hotels
    |--------------------------------------------------------------------------
    */

    private function hotelPage(string $slug): array
    {
        $hotel = SiteData::hotelBySlug($slug);

        if (!$hotel) {
            return $this->notFound('/hotels/' . $slug);
        }

        $path = '/hotels/' . rawurlencode($hotel['slug']);
        $description = SiteData::truncate($hotel['description'] ?? '', 155);

        $jsonld = [
            SchemaBuilder::webPage('ItemPage', $hotel['name'], $description, $path, $hotel['images'][0] ?? null),
            SchemaBuilder::breadcrumb([
                ['name' => 'Home', 'path' => '/'],
                ['name' => 'Hotels', 'path' => '/hotels'],
                ['name' => $hotel['name'], 'path' => $path],
            ]),
            SchemaBuilder::hotel($hotel, $path),
        ];

        $body = '<p>' . SiteData::e($hotel['description'] ?? '') . '</p>';

        if (!empty($hotel['highlights'])) {
            $body .= '<h2>Highlights</h2><ul>';
            foreach ($hotel['highlights'] as $highlight) {
                $body .= '<li>' . SiteData::e($highlight) . '</li>';
            }
            $body .= '</ul>';
        }

        return [
            'status' => 200,
            'title' => SiteData::withBrand($hotel['name'] . ', ' . $hotel['location']),
            'description' => $description,
            'keywords' => [$hotel['name'], $hotel['location'], 'hotel ' . ($hotel['location'] ?? ''), 'where to stay'],
            'path' => $path,
            'image' => $hotel['images'][0] ?? null,
            'imageAlt' => $hotel['name'],
            'type' => 'website',
            'noindex' => false,
            'jsonld' => $jsonld,
            'heading' => $hotel['name'],
            'intro' => (string) ($hotel['tagline'] ?? ''),
            'body' => $body,
            'preload' => null,
            'product' => null,
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | Special cases
    |--------------------------------------------------------------------------
    */

    private function noindexPage(string $title, string $description, string $path): array
    {
        return [
            'status' => 200,
            'title' => SiteData::withBrand($title),
            'description' => $description,
            'keywords' => [],
            'path' => $path,
            'image' => null,
            'imageAlt' => null,
            'type' => 'website',
            'noindex' => true,
            'jsonld' => [],
            'heading' => $title,
            'intro' => $description,
            'body' => '',
            'preload' => null,
            'product' => null,
        ];
    }

    private function notFound(string $path): array
    {
        $page = $this->noindexPage(
            'Page not found',
            'The page you are looking for could not be found. Explore Zanzibar tours, safaris and transfers with ZAN GATES Adventures.',
            $path
        );

        $page['status'] = 404;
        $page['body'] = '<p><a href="/">Back to the ZAN GATES Adventures home page</a></p>';

        return $page;
    }


    /*
    |--------------------------------------------------------------------------
    | Data helpers (shared with the sitemap)
    |--------------------------------------------------------------------------
    */

    public function activeTours(?int $limit = null): array
    {
        $sql = "SELECT t.id, t.title, t.slug, t.short_description, t.updated_at,
                       d.name AS destination_name,
                       " . self::PRIMARY_IMAGE_SQL . " AS primary_image
                FROM tours t
                INNER JOIN destinations d ON d.id = t.destination_id
                WHERE t.status = 'ACTIVE'
                ORDER BY t.featured DESC, t.id ASC";

        if ($limit !== null) {
            $sql .= ' LIMIT ' . (int) $limit;
        }

        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /* Destinations that have at least one active tour (empty ones are thin pages). */
    public function destinationsWithTours(): array
    {
        $rows = $this->db->query(
            "SELECT d.id, d.name, d.slug, d.description, d.updated_at,
                    COUNT(t.id) AS tour_count,
                    MAX(t.updated_at) AS last_tour_update
             FROM destinations d
             INNER JOIN tours t ON t.destination_id = d.id AND t.status = 'ACTIVE'
             GROUP BY d.id
             ORDER BY d.name"
        )->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['tour_count'] = (int) $row['tour_count'];
        }
        unset($row);

        return $rows;
    }

    private function tourListItem(array $tour): array
    {
        return [
            'name' => $tour['title'],
            'path' => '/tours/' . rawurlencode($tour['slug']),
            'image' => $tour['primary_image'] ?? null,
            'description' => $tour['short_description'] ?? '',
        ];
    }

    private function listHtml(array $items): string
    {
        $html = '<ul>';

        foreach ($items as $item) {
            $html .= '<li><a href="' . SiteData::e($item['path']) . '">' . SiteData::e($item['name']) . '</a>';

            if (!empty($item['description'])) {
                $html .= ' — ' . SiteData::e(SiteData::truncate($item['description'], 160));
            }

            $html .= '</li>';
        }

        return $html . '</ul>';
    }
}
