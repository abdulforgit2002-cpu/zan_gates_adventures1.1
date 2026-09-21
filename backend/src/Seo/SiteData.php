<?php

/*
|--------------------------------------------------------------------------
| SiteData
|--------------------------------------------------------------------------
|
| Site-wide SEO constants and small helpers. Mirrors
| frontend/src/seo/site.js (ogImageUrl / truncate / absoluteUrl) — keep the
| two in sync.
|
*/

class SiteData
{
    public const NAME = 'ZAN GATES Adventures';
    public const LEGAL_NAME = 'ZAN GATES ADVENTURES';
    public const PHONE = '+255658450092';
    public const EMAIL = 'adventures@zanzibargates.co.tz';

    public const LOGO =
        'https://res.cloudinary.com/djczmay2i/image/upload/v1788254388/ZAN_GATES_ADVENTURES_k59crf.jpg';

    public const DEFAULT_OG_SOURCE =
        'https://res.cloudinary.com/djczmay2i/image/upload/v1779540443/aaa_faq_ixagv2.webp';

    public const SAME_AS = [
        'https://www.facebook.com/share/19SBfqRvNk/',
        'https://www.instagram.com/zanzibar_gates_safaris._',
        'https://www.threads.com/@zanzibar_gates_safaris._',
    ];

    /* Used for the sitemap only when the frontend's seo-data.json is unreachable. */
    public const FALLBACK_PAGES = [
        '/',
        '/tours',
        '/safaris',
        '/destinations',
        '/hotels',
        '/transfers',
        '/about',
        '/about-zanzibar',
        '/contact',
        '/wedding-and-proposals',
    ];

    private static ?array $frontendData = null;


    public static function siteUrl(): string
    {
        $configured = getenv('SITE_URL');

        return rtrim(
            $configured !== false && trim($configured) !== ''
                ? trim($configured)
                : 'https://zanzibargates.co.tz',
            '/'
        );
    }

    public static function absolute(string $path = '/'): string
    {
        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        $clean = preg_split('/[?#]/', $path)[0] ?? '/';
        $normalized = str_starts_with($clean, '/') ? $clean : '/' . $clean;

        if ($normalized === '/') {
            return self::siteUrl() . '/';
        }

        return self::siteUrl() . rtrim($normalized, '/');
    }

    public static function ogImage(?string $url): string
    {
        $source = $url ?: self::DEFAULT_OG_SOURCE;

        if (preg_match(
            '#^(https://res\.cloudinary\.com/[^/]+/image/upload/)(v\d+/.+)\.(?:webp|png|jpe?g|avif|gif)$#i',
            $source,
            $m
        )) {
            return $m[1] . 'c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/' . $m[2] . '.jpg';
        }

        return $source;
    }

    public static function isTransformedOgImage(string $url): bool
    {
        return str_contains($url, '/c_fill,g_auto,w_1200,h_630,q_auto,f_jpg/');
    }

    public static function truncate(?string $text, int $max = 155): string
    {
        $clean = trim((string) preg_replace('/\s+/', ' ', strip_tags((string) $text)));

        if (mb_strlen($clean) <= $max) {
            return $clean;
        }

        $cut = mb_substr($clean, 0, $max - 1);
        $lastSpace = mb_strrpos($cut, ' ');

        if ($lastSpace !== false && $lastSpace > 60) {
            $cut = mb_substr($cut, 0, $lastSpace);
        }

        return rtrim($cut, " \t\n\r,.;:–—-") . '…';
    }

    public static function withBrand(string $title): string
    {
        $clean = trim($title);

        if ($clean === '') {
            return self::NAME;
        }

        if (stripos($clean, 'zan gates') !== false) {
            return $clean;
        }

        return $clean . ' | ' . self::NAME;
    }

    public static function e(?string $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function json(mixed $data): string
    {
        return (string) json_encode(
            $data,
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Frontend (internal network) access
    |--------------------------------------------------------------------------
    */

    public static function frontendUrl(): string
    {
        $configured = getenv('FRONTEND_INTERNAL_URL');

        return rtrim(
            $configured !== false && trim($configured) !== ''
                ? trim($configured)
                : 'http://frontend',
            '/'
        );
    }

    public static function httpGet(string $url, int $timeoutSeconds = 2): ?string
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => $timeoutSeconds,
                'ignore_errors' => false,
                'header' => "Accept: */*\r\nUser-Agent: zan-gates-seo-renderer\r\n",
            ],
        ]);

        $body = @file_get_contents($url, false, $context);

        return $body === false ? null : $body;
    }

    /*
     * The built index.html is fetched fresh on every render on purpose: its
     * asset filenames change on every frontend deploy, so caching it here
     * could point pages at JavaScript that no longer exists.
     */
    public static function fetchShell(): ?string
    {
        $html = self::httpGet(self::frontendUrl() . '/index.html');

        if ($html === null || !str_contains($html, '<div id="root">')) {
            return null;
        }

        return $html;
    }

    /* Static-page metadata + hotel catalog emitted by the frontend build. */
    public static function frontendData(): array
    {
        if (self::$frontendData !== null) {
            return self::$frontendData;
        }

        $decoded = null;
        $raw = self::httpGet(self::frontendUrl() . '/seo-data.json');

        if ($raw !== null) {
            $decoded = json_decode($raw, true);
        }

        self::$frontendData = [
            'pages' => is_array($decoded['pages'] ?? null) ? $decoded['pages'] : [],
            'hotels' => is_array($decoded['hotels'] ?? null) ? $decoded['hotels'] : [],
            'available' => is_array($decoded),
        ];

        return self::$frontendData;
    }

    public static function hotelBySlug(string $slug): ?array
    {
        foreach (self::frontendData()['hotels'] as $hotel) {
            if (($hotel['slug'] ?? null) === $slug) {
                return $hotel;
            }
        }

        return null;
    }
}
