<?php

class TourController
{
    private PDO $db;

    private const SUPPORTED_LANGUAGES = [
        'en',
        'de',
        'it',
        'fr',
        'pl',
    ];

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    private function normalizeLanguage(?string $language): string
    {
        $normalized = strtolower(
            trim((string) ($language ?? 'en'))
        );

        return in_array(
            $normalized,
            self::SUPPORTED_LANGUAGES,
            true
        )
            ? $normalized
            : 'en';
    }

    private function shouldUseTourTranslations(): bool
    {
        try {
            $stmt = $this->db->prepare(
                "SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = current_schema()
                      AND table_name = 'tour_translations'
                )"
            );

            $stmt->execute();

            return filter_var(
                $stmt->fetchColumn(),
                FILTER_VALIDATE_BOOLEAN
            );
        } catch (Throwable $e) {
            error_log(
                'Unable to detect tour translation table: ' .
                $e->getMessage()
            );

            return false;
        }
    }

    /**
     * GET /api/tours
     *
     * Retrieves all active tours together with:
     * - Category
     * - Destination
     * - Lowest available tour price
     * - Currency
     * - Pricing type
     */
    public function index(): never
    {
        try {
            $language = $this->normalizeLanguage(
                $_GET['lang'] ?? 'en'
            );

            $useTranslations = $this->shouldUseTourTranslations();

            if ($useTranslations) {
                $stmt = $this->db->prepare(
                    "SELECT
                        t.id,
                        COALESCE(tt.title, t.title) AS title,
                        COALESCE(tt.slug, t.slug) AS slug,
                        COALESCE(tt.short_description, t.short_description) AS short_description,
                        COALESCE(tt.description, t.description) AS description,
                        COALESCE(tt.duration, t.duration) AS duration,
                        t.featured,
                        t.status,

                        t.category_id,
                        c.name AS category_name,

                        t.destination_id,
                        d.name AS destination_name,

                        tp.price,
                        tp.currency,
                        tp.pricing_type

                    FROM tours t

                    INNER JOIN categories c
                        ON c.id = t.category_id

                    INNER JOIN destinations d
                        ON d.id = t.destination_id

                    LEFT JOIN tour_translations tt
                        ON tt.tour_id = t.id
                       AND tt.language = :language

                    LEFT JOIN LATERAL (
                        SELECT
                            price,
                            currency,
                            pricing_type
                        FROM tour_prices
                        WHERE tour_id = t.id
                        ORDER BY price ASC
                        LIMIT 1
                    ) tp ON TRUE

                    WHERE t.status = 'ACTIVE'

                    ORDER BY
                        t.featured DESC,
                        t.id ASC"
                );

                $stmt->execute([
                    ':language' => $language,
                ]);
            } else {
                $stmt = $this->db->query(
                    "SELECT
                        t.id,
                        t.title,
                        t.slug,
                        t.short_description,
                        t.description,
                        t.duration,
                        t.featured,
                        t.status,

                        t.category_id,
                        c.name AS category_name,

                        t.destination_id,
                        d.name AS destination_name,

                        tp.price,
                        tp.currency,
                        tp.pricing_type

                    FROM tours t

                    INNER JOIN categories c
                        ON c.id = t.category_id

                    INNER JOIN destinations d
                        ON d.id = t.destination_id

                    LEFT JOIN LATERAL (
                        SELECT
                            price,
                            currency,
                            pricing_type
                        FROM tour_prices
                        WHERE tour_id = t.id
                        ORDER BY price ASC
                        LIMIT 1
                    ) tp ON TRUE

                    WHERE t.status = 'ACTIVE'

                    ORDER BY
                        t.featured DESC,
                        t.id ASC"
                );
            }

            $tours = $stmt->fetchAll();

            /*
             * Normalize API data.
             *
             * PostgreSQL numeric values are returned by PDO
             * as strings. We convert the price into a float
             * so React receives a predictable numeric value.
             */
            foreach ($tours as &$tour) {

                $tour['id'] = (int) $tour['id'];

                $tour['category_id'] =
                    (int) $tour['category_id'];

                $tour['destination_id'] =
                    (int) $tour['destination_id'];

                $tour['featured'] =
                    (bool) $tour['featured'];

                /*
                 * Convert price safely.
                 *
                 * If there is no price, return null instead
                 * of an invalid numeric value.
                 */
                if (
                    isset($tour['price']) &&
                    $tour['price'] !== null &&
                    $tour['price'] !== ''
                ) {

                    $tour['price'] =
                        (float) $tour['price'];

                } else {

                    $tour['price'] = null;
                }
            }

            unset($tour);

            Response::success(
                $tours,
                'Tours retrieved successfully.'
            );

        } catch (PDOException $e) {

            Response::error(
                'Failed to retrieve tours.',
                500,
                [
                    'error' => $e->getMessage()
                ]
            );
        }
    }

    /**
 * GET /api/tours/slug/{slug}
 *
 * Retrieves a single active tour by slug.
 */
public function showBySlug(string $slug): never
{
    try {
        $language = $this->normalizeLanguage(
            $_GET['lang'] ?? 'en'
        );

        $useTranslations = $this->shouldUseTourTranslations();

        if ($useTranslations) {
            $stmt = $this->db->prepare(
                "SELECT
                    t.id,
                    COALESCE(tt.title, t.title) AS title,
                    COALESCE(tt.slug, t.slug) AS slug,
                    COALESCE(tt.short_description, t.short_description) AS short_description,
                    COALESCE(tt.description, t.description) AS description,
                    COALESCE(tt.duration, t.duration) AS duration,
                    t.featured,
                    t.status,

                    c.id AS category_id,
                    c.name AS category_name,

                    d.id AS destination_id,
                    d.name AS destination_name

                 FROM tours t

                 INNER JOIN categories c
                    ON c.id = t.category_id

                 INNER JOIN destinations d
                    ON d.id = t.destination_id

                 LEFT JOIN tour_translations tt
                    ON tt.tour_id = t.id
                   AND tt.language = :language

                 WHERE (COALESCE(tt.slug, t.slug) = :slug OR t.slug = :slug)
                 AND t.status = 'ACTIVE'

                 LIMIT 1"
            );

            $stmt->execute([
                ':language' => $language,
                ':slug' => $slug,
            ]);
        } else {
            $stmt = $this->db->prepare(
                "SELECT
                    t.id,
                    t.title,
                    t.slug,
                    t.short_description,
                    t.description,
                    t.duration,
                    t.featured,
                    t.status,

                    c.id AS category_id,
                    c.name AS category_name,

                    d.id AS destination_id,
                    d.name AS destination_name

                 FROM tours t

                 INNER JOIN categories c
                    ON c.id = t.category_id

                 INNER JOIN destinations d
                    ON d.id = t.destination_id

                 WHERE t.slug = :slug
                 AND t.status = 'ACTIVE'

                 LIMIT 1"
            );

            $stmt->execute([
                ':slug' => $slug,
            ]);
        }

        $tour = $stmt->fetch();

        if ($tour === false) {

            Response::error(
                'Tour not found.',
                404
            );
        }

        /*
         * Normalize IDs and boolean values.
         */
        $tour['id'] =
            (int) $tour['id'];

        $tour['category_id'] =
            (int) $tour['category_id'];

        $tour['destination_id'] =
            (int) $tour['destination_id'];

        $tour['featured'] =
            (bool) $tour['featured'];

        Response::success(
            $tour,
            'Tour retrieved successfully.'
        );

    } catch (PDOException $e) {

        Response::error(
            'Failed to retrieve tour.',
            500,
            [
                'error' => $e->getMessage()
            ]
        );
    }
}    


    /**
     * GET /api/tours/{id}
     *
     * Retrieves a single active tour.
     */
    public function show(int $id): never
    {
        try {
            $language = $this->normalizeLanguage(
                $_GET['lang'] ?? 'en'
            );

            $useTranslations = $this->shouldUseTourTranslations();

            if ($useTranslations) {
                $stmt = $this->db->prepare(
                    "SELECT
                        t.id,
                        COALESCE(tt.title, t.title) AS title,
                        COALESCE(tt.slug, t.slug) AS slug,
                        COALESCE(tt.short_description, t.short_description) AS short_description,
                        COALESCE(tt.description, t.description) AS description,
                        COALESCE(tt.duration, t.duration) AS duration,
                        t.featured,
                        t.status,

                        c.id AS category_id,
                        c.name AS category_name,

                        d.id AS destination_id,
                        d.name AS destination_name

                     FROM tours t

                     INNER JOIN categories c
                        ON c.id = t.category_id

                     INNER JOIN destinations d
                        ON d.id = t.destination_id

                     LEFT JOIN tour_translations tt
                        ON tt.tour_id = t.id
                       AND tt.language = :language

                     WHERE t.id = :id
                     AND t.status = 'ACTIVE'"
                );

                $stmt->execute([
                    ':language' => $language,
                    ':id' => $id,
                ]);
            } else {
                $stmt = $this->db->prepare(
                    "SELECT
                        t.id,
                        t.title,
                        t.slug,
                        t.short_description,
                        t.description,
                        t.duration,
                        t.featured,
                        t.status,

                        c.id AS category_id,
                        c.name AS category_name,

                        d.id AS destination_id,
                        d.name AS destination_name

                     FROM tours t

                     INNER JOIN categories c
                        ON c.id = t.category_id

                     INNER JOIN destinations d
                        ON d.id = t.destination_id

                     WHERE t.id = :id
                     AND t.status = 'ACTIVE'"
                );

                $stmt->execute([
                    ':id' => $id,
                ]);
            }

            $tour = $stmt->fetch();

            if ($tour === false) {

                Response::error(
                    'Tour not found.',
                    404
                );
            }

            /*
             * Normalize IDs and boolean values.
             */
            $tour['id'] = (int) $tour['id'];

            $tour['category_id'] =
                (int) $tour['category_id'];

            $tour['destination_id'] =
                (int) $tour['destination_id'];

            $tour['featured'] =
                (bool) $tour['featured'];

            Response::success(
                $tour,
                'Tour retrieved successfully.'
            );

        } catch (PDOException $e) {

            Response::error(
                'Failed to retrieve tour.',
                500,
                [
                    'error' => $e->getMessage()
                ]
            );
        }
    }


    /**
     * GET /api/tours/{id}/prices
     *
     * Retrieves all pricing options for a tour.
     */
    public function prices(int $id): never
    {
        try {

            /*
             * First verify that the tour exists.
             */
            $tourStmt = $this->db->prepare(
                "SELECT id
                 FROM tours
                 WHERE id = :tour_id
                 AND status = 'ACTIVE'"
            );

            $tourStmt->execute([
                'tour_id' => $id
            ]);

            if ($tourStmt->fetch() === false) {

                Response::error(
                    'Tour not found.',
                    404
                );
            }

            /*
             * Retrieve pricing options.
             */
            $stmt = $this->db->prepare(
                'SELECT
                    id,
                    pricing_type,
                    min_people,
                    max_people,
                    price,
                    currency
                 FROM tour_prices
                 WHERE tour_id = :tour_id
                 ORDER BY
                    price ASC,
                    min_people ASC'
            );

            $stmt->execute([
                'tour_id' => $id
            ]);

            $prices = $stmt->fetchAll();

            /*
             * Normalize price data.
             */
            foreach ($prices as &$price) {

                $price['id'] =
                    (int) $price['id'];

                $price['min_people'] =
                    (int) $price['min_people'];

                if (
                    $price['max_people'] !== null &&
                    $price['max_people'] !== ''
                ) {

                    $price['max_people'] =
                        (int) $price['max_people'];

                } else {

                    $price['max_people'] = null;
                }

                $price['price'] =
                    (float) $price['price'];
            }

            unset($price);

            Response::success(
                $prices,
                'Tour prices retrieved successfully.'
            );

        } catch (PDOException $e) {

            Response::error(
                'Failed to retrieve tour prices.',
                500,
                [
                    'error' => $e->getMessage()
                ]
            );
        }
    }
}