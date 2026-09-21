<?php

/*
|--------------------------------------------------------------------------
| SchemaBuilder
|--------------------------------------------------------------------------
|
| JSON-LD (schema.org) documents. Mirrors frontend/src/seo/schema.js — the
| server ships these in the first HTML response, the client re-emits the
| same shapes after hydration. Only real, on-page facts: no invented
| ratings, reviews or availability.
|
*/

class SchemaBuilder
{
    private const CONTEXT = 'https://schema.org';

    public static function organizationId(): string
    {
        return SiteData::siteUrl() . '/#organization';
    }

    public static function websiteId(): string
    {
        return SiteData::siteUrl() . '/#website';
    }

    private static function organizationRef(): array
    {
        return ['@id' => self::organizationId()];
    }


    /* Site-wide graph: the travel agency + the website. */
    public static function siteGraph(): array
    {
        $home = SiteData::absolute('/');

        return [
            '@context' => self::CONTEXT,
            '@graph' => [
                [
                    '@type' => 'TravelAgency',
                    '@id' => self::organizationId(),
                    'name' => SiteData::NAME,
                    'alternateName' => SiteData::LEGAL_NAME,
                    'url' => $home,
                    'logo' => SiteData::LOGO,
                    'image' => SiteData::ogImage(null),
                    'description' => 'ZAN GATES Adventures is a local Zanzibar tour company offering excursions, Tanzania safaris, airport transfers, hotels and romantic beach proposals.',
                    'email' => SiteData::EMAIL,
                    'telephone' => SiteData::PHONE,
                    'address' => [
                        '@type' => 'PostalAddress',
                        'addressLocality' => 'Zanzibar',
                        'addressCountry' => 'TZ',
                    ],
                    'areaServed' => [
                        ['@type' => 'Place', 'name' => 'Zanzibar'],
                        ['@type' => 'Country', 'name' => 'Tanzania'],
                    ],
                    'sameAs' => SiteData::SAME_AS,
                    'contactPoint' => [
                        '@type' => 'ContactPoint',
                        'contactType' => 'customer service',
                        'telephone' => SiteData::PHONE,
                        'email' => SiteData::EMAIL,
                    ],
                ],
                [
                    '@type' => 'WebSite',
                    '@id' => self::websiteId(),
                    'url' => $home,
                    'name' => SiteData::NAME,
                    'inLanguage' => 'en',
                    'publisher' => self::organizationRef(),
                ],
            ],
        ];
    }

    public static function breadcrumb(array $items): array
    {
        $list = [];

        foreach (array_values($items) as $index => $item) {
            $list[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['name'],
                'item' => SiteData::absolute($item['path']),
            ];
        }

        return [
            '@context' => self::CONTEXT,
            '@type' => 'BreadcrumbList',
            'itemListElement' => $list,
        ];
    }

    public static function webPage(
        string $type,
        string $name,
        string $description,
        string $path,
        ?string $image = null
    ): array {
        $schema = [
            '@context' => self::CONTEXT,
            '@type' => $type,
            '@id' => SiteData::absolute($path) . '#webpage',
            'url' => SiteData::absolute($path),
            'name' => $name,
            'description' => SiteData::truncate($description, 300),
            'inLanguage' => 'en',
            'isPartOf' => ['@id' => self::websiteId()],
            'about' => self::organizationRef(),
        ];

        if ($image) {
            $schema['primaryImageOfPage'] = ['@type' => 'ImageObject', 'url' => $image];
        }

        return $schema;
    }

    public static function itemList(string $name, array $items): array
    {
        $elements = [];

        foreach (array_values($items) as $index => $item) {
            $element = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'url' => SiteData::absolute($item['path']),
                'name' => $item['name'],
            ];

            if (!empty($item['image'])) {
                $element['image'] = $item['image'];
            }

            $elements[] = $element;
        }

        return [
            '@context' => self::CONTEXT,
            '@type' => 'ItemList',
            'name' => $name,
            'numberOfItems' => count($elements),
            'itemListElement' => $elements,
        ];
    }

    private static function offers(array $prices, string $url): ?array
    {
        $usable = [];

        foreach ($prices as $row) {
            $price = (float) ($row['price'] ?? 0);

            if ($price > 0) {
                $usable[] = [
                    'price' => $price,
                    'currency' => strtoupper((string) ($row['currency'] ?: 'USD')),
                ];
            }
        }

        if (!$usable) {
            return null;
        }

        usort($usable, fn ($a, $b) => $a['price'] <=> $b['price']);

        $currency = $usable[0]['currency'];
        $same = array_values(array_filter(
            $usable,
            fn ($row) => $row['currency'] === $currency
        ));

        $low = min(array_column($same, 'price'));
        $high = max(array_column($same, 'price'));

        if ($low === $high) {
            return [
                '@type' => 'Offer',
                'url' => $url,
                'price' => number_format($low, 2, '.', ''),
                'priceCurrency' => $currency,
                'availability' => 'https://schema.org/InStock',
                'seller' => self::organizationRef(),
            ];
        }

        return [
            '@type' => 'AggregateOffer',
            'url' => $url,
            'lowPrice' => number_format($low, 2, '.', ''),
            'highPrice' => number_format($high, 2, '.', ''),
            'priceCurrency' => $currency,
            'offerCount' => count($same),
            'availability' => 'https://schema.org/InStock',
            'seller' => self::organizationRef(),
        ];
    }

    public static function tour(array $tour, array $imageUrls, array $prices, array $listItems, string $path): array
    {
        $url = SiteData::absolute($path);
        $properties = [];

        foreach ([
            'Duration' => $tour['duration'] ?? null,
            'Departure location' => $tour['departure_location'] ?? null,
            'Destination' => $tour['destination_name'] ?? null,
        ] as $label => $value) {
            if ($value) {
                $properties[] = ['@type' => 'PropertyValue', 'name' => $label, 'value' => $value];
            }
        }

        if (!empty($listItems['include'])) {
            $properties[] = [
                '@type' => 'PropertyValue',
                'name' => 'Included',
                'value' => implode('; ', $listItems['include']),
            ];
        }

        $schema = [
            '@context' => self::CONTEXT,
            '@type' => ['Product', 'TouristTrip'],
            '@id' => $url . '#tour',
            'name' => $tour['title'],
            'description' => SiteData::truncate($tour['description'] ?: ($tour['short_description'] ?? ''), 5000),
            'url' => $url,
            'sku' => 'tour-' . $tour['id'],
            'brand' => ['@type' => 'Brand', 'name' => SiteData::NAME],
            'provider' => self::organizationRef(),
        ];

        if ($imageUrls) {
            $schema['image'] = array_slice($imageUrls, 0, 8);
        }

        if (!empty($tour['category_name'])) {
            $schema['category'] = $tour['category_name'];
        }

        if ($properties) {
            $schema['additionalProperty'] = $properties;
        }

        $offers = self::offers($prices, $url);

        if ($offers) {
            $schema['offers'] = $offers;
        }

        return $schema;
    }

    public static function destination(string $name, ?string $description, string $path, ?string $image): array
    {
        $schema = [
            '@context' => self::CONTEXT,
            '@type' => 'TouristDestination',
            '@id' => SiteData::absolute($path) . '#destination',
            'name' => $name,
            'url' => SiteData::absolute($path),
        ];

        if ($description) {
            $schema['description'] = SiteData::truncate($description, 500);
        }

        if ($image) {
            $schema['image'] = $image;
        }

        return $schema;
    }

    public static function hotel(array $hotel, string $path): array
    {
        $schema = [
            '@context' => self::CONTEXT,
            '@type' => 'Hotel',
            '@id' => SiteData::absolute($path) . '#hotel',
            'name' => $hotel['name'],
            'url' => SiteData::absolute($path),
            'description' => SiteData::truncate($hotel['description'] ?? '', 500),
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => trim(explode(',', (string) ($hotel['location'] ?? ''))[0]),
                'addressCountry' => 'TZ',
            ],
        ];

        if (!empty($hotel['images'])) {
            $schema['image'] = array_slice($hotel['images'], 0, 6);
        }

        if (!empty($hotel['highlights'])) {
            $schema['amenityFeature'] = array_map(
                fn ($text) => [
                    '@type' => 'LocationFeatureSpecification',
                    'name' => $text,
                    'value' => true,
                ],
                $hotel['highlights']
            );
        }

        return $schema;
    }

    public static function service(
        string $name,
        string $description,
        string $path,
        string $serviceType,
        ?float $lowPrice,
        ?float $highPrice,
        string $currency = 'USD'
    ): array {
        $schema = [
            '@context' => self::CONTEXT,
            '@type' => 'Service',
            '@id' => SiteData::absolute($path) . '#service',
            'name' => $name,
            'description' => SiteData::truncate($description, 500),
            'url' => SiteData::absolute($path),
            'serviceType' => $serviceType,
            'provider' => self::organizationRef(),
            'areaServed' => ['@type' => 'Place', 'name' => 'Zanzibar, Tanzania'],
        ];

        if ($lowPrice) {
            $offer = [
                '@type' => 'AggregateOffer',
                'lowPrice' => number_format($lowPrice, 2, '.', ''),
                'priceCurrency' => $currency,
            ];

            if ($highPrice) {
                $offer['highPrice'] = number_format($highPrice, 2, '.', '');
            }

            $schema['offers'] = $offer;
        }

        return $schema;
    }
}
