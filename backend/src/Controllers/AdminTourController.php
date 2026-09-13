<?php

class AdminTourController
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

    /*
    |--------------------------------------------------------------------------
    | TRANSLATIONS
    |--------------------------------------------------------------------------
    */

    private function upsertTourTranslations(
        int $tourId,
        string $title,
        string $slug,
        ?string $shortDescription,
        ?string $description,
        ?string $duration
    ): void {
        $statement = $this->db->prepare(
            "INSERT INTO tour_translations (
                tour_id,
                language,
                title,
                slug,
                short_description,
                description,
                duration
            )
            VALUES (
                :tour_id,
                :language,
                :title,
                :slug,
                :short_description,
                :description,
                :duration
            )
            ON CONFLICT (tour_id, language) DO UPDATE
            SET
                title = EXCLUDED.title,
                slug = EXCLUDED.slug,
                short_description = EXCLUDED.short_description,
                description = EXCLUDED.description,
                duration = EXCLUDED.duration,
                updated_at = CURRENT_TIMESTAMP"
        );

        foreach (self::SUPPORTED_LANGUAGES as $language) {
            $statement->execute([
                ':tour_id'         => $tourId,
                ':language'        => $language,
                ':title'           => $title,
                ':slug'            => $slug,
                ':short_description' => $shortDescription !== '' ? $shortDescription : null,
                ':description'     => $description !== '' ? $description : null,
                ':duration'        => $duration !== '' ? $duration : null,
            ]);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | LIST TOURS
    |--------------------------------------------------------------------------
    */

    public function index(): never
    {
        AuthMiddleware::requireAdmin();

        try {
            $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT);
            $perPage = filter_input(INPUT_GET, 'per_page', FILTER_VALIDATE_INT);

            $page = $page && $page > 0 ? $page : 1;
            $perPage = $perPage && $perPage > 0 ? min($perPage, 100) : 10;

            $search = trim((string) (filter_input(INPUT_GET, 'search', FILTER_UNSAFE_RAW) ?? ''));
            $status = strtoupper(trim((string) (filter_input(INPUT_GET, 'status', FILTER_UNSAFE_RAW) ?? '')));
            $featuredParam = filter_input(INPUT_GET, 'featured', FILTER_UNSAFE_RAW);
            $categoryId = filter_input(INPUT_GET, 'category_id', FILTER_VALIDATE_INT);
            $destinationId = filter_input(INPUT_GET, 'destination_id', FILTER_VALIDATE_INT);

            $featured = null;

            if ($featuredParam !== null && $featuredParam !== '') {
                $normalizedFeatured = strtolower(trim((string) $featuredParam));

                if (in_array($normalizedFeatured, ['true', '1', 'yes'], true)) {
                    $featured = true;
                } elseif (in_array($normalizedFeatured, ['false', '0', 'no'], true)) {
                    $featured = false;
                }
            }

            if ($status !== '' && !in_array($status, ['ACTIVE', 'INACTIVE'], true)) {
                Response::error('Invalid tour status.', 422);
            }

            if ($categoryId !== null && $categoryId !== false && $categoryId <= 0) {
                Response::error('Invalid category ID.', 422);
            }

            if ($destinationId !== null && $destinationId !== false && $destinationId <= 0) {
                Response::error('Invalid destination ID.', 422);
            }

            $where = [];
            $params = [];

            if ($search !== '') {
                $where[] = "(
                    t.title ILIKE :search
                    OR t.slug ILIKE :search
                    OR t.short_description ILIKE :search
                    OR t.description ILIKE :search
                    OR c.name ILIKE :search
                    OR d.name ILIKE :search
                )";
                $params[':search'] = '%' . $search . '%';
            }

            if ($status !== '') {
                $where[] = 't.status = :status';
                $params[':status'] = $status;
            }

            if ($featured !== null) {
                $where[] = 't.featured = :featured';
                $params[':featured'] = $featured;
            }

            if ($categoryId !== null && $categoryId !== false) {
                $where[] = 't.category_id = :category_id';
                $params[':category_id'] = $categoryId;
            }

            if ($destinationId !== null && $destinationId !== false) {
                $where[] = 't.destination_id = :destination_id';
                $params[':destination_id'] = $destinationId;
            }

            $whereSql = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

            $countSql = "
                SELECT COUNT(*)
                FROM tours t
                INNER JOIN categories c ON c.id = t.category_id
                INNER JOIN destinations d ON d.id = t.destination_id
                {$whereSql}
            ";

            $countStatement = $this->db->prepare($countSql);

            foreach ($params as $key => $value) {
                if ($key === ':featured') {
                    $countStatement->bindValue($key, $value, PDO::PARAM_BOOL);
                } elseif ($key === ':category_id' || $key === ':destination_id') {
                    $countStatement->bindValue($key, $value, PDO::PARAM_INT);
                } else {
                    $countStatement->bindValue($key, $value);
                }
            }

            $countStatement->execute();
            $total = (int) $countStatement->fetchColumn();

            $totalPages = $total > 0 ? (int) ceil($total / $perPage) : 1;
            if ($page > $totalPages) $page = $totalPages;
            $offset = ($page - 1) * $perPage;

            $sql = "
                SELECT
                    t.id, t.category_id, c.name AS category_name,
                    t.destination_id, d.name AS destination_name,
                    t.title, t.slug, t.short_description, t.description,
                    t.duration, t.featured, t.status,
                    t.duration_start, t.duration_end,
                    t.departure_location, t.return_location,
                    t.created_at, t.updated_at,
                    price_data.lowest_price, price_data.currency, price_data.pricing_type,
                    (SELECT COUNT(*) FROM tour_prices tp_count WHERE tp_count.tour_id = t.id) AS price_count,
                    (SELECT COUNT(*) FROM tour_images ti_count WHERE ti_count.tour_id = t.id) AS image_count,
                    (
                        SELECT ti_primary.image_url
                        FROM tour_images ti_primary
                        WHERE ti_primary.tour_id = t.id
                          AND ti_primary.is_primary = TRUE
                        ORDER BY ti_primary.sort_order ASC, ti_primary.id ASC
                        LIMIT 1
                    ) AS primary_image
                FROM tours t
                INNER JOIN categories c ON c.id = t.category_id
                INNER JOIN destinations d ON d.id = t.destination_id
                LEFT JOIN LATERAL (
                    SELECT tp.price AS lowest_price, tp.currency, tp.pricing_type
                    FROM tour_prices tp
                    WHERE tp.tour_id = t.id
                    ORDER BY tp.price ASC, tp.min_people ASC, tp.id ASC
                    LIMIT 1
                ) price_data ON TRUE
                {$whereSql}
                ORDER BY t.featured DESC, t.created_at DESC, t.id DESC
                LIMIT :limit
                OFFSET :offset
            ";

            $statement = $this->db->prepare($sql);

            foreach ($params as $key => $value) {
                if ($key === ':featured') {
                    $statement->bindValue($key, $value, PDO::PARAM_BOOL);
                } elseif ($key === ':category_id' || $key === ':destination_id') {
                    $statement->bindValue($key, $value, PDO::PARAM_INT);
                } else {
                    $statement->bindValue($key, $value);
                }
            }

            $statement->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
            $statement->execute();

            $tours = $statement->fetchAll(PDO::FETCH_ASSOC);

            foreach ($tours as &$tour) {
                $tour['id'] = (int) $tour['id'];
                $tour['category_id'] = (int) $tour['category_id'];
                $tour['destination_id'] = (int) $tour['destination_id'];
                $tour['featured'] = filter_var($tour['featured'], FILTER_VALIDATE_BOOLEAN);
                $tour['price_count'] = (int) $tour['price_count'];
                $tour['image_count'] = (int) $tour['image_count'];

                if ($tour['lowest_price'] !== null) {
                    $tour['lowest_price'] = (float) $tour['lowest_price'];
                }
            }
            unset($tour);

            Response::success(
                [
                    'tours' => $tours,
                    'pagination' => [
                        'page' => $page,
                        'per_page' => $perPage,
                        'total' => $total,
                        'total_pages' => $totalPages,
                        'has_next_page' => $page < $totalPages,
                        'has_previous_page' => $page > 1,
                    ],
                ],
                'Tours retrieved successfully.'
            );

        } catch (PDOException $e) {
            error_log('Admin tour index database error: ' . $e->getMessage());
            Response::error('Unable to retrieve tours at this time.', 500);
        } catch (Throwable $e) {
            error_log('Admin tour index application error: ' . $e->getMessage());
            Response::error('Unable to retrieve tours at this time.', 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE TOUR
    |--------------------------------------------------------------------------
    */

    public function store(): never
    {
        AuthMiddleware::requireAdmin();

        try {
            $body = Request::body();

            $title = trim((string) ($body['title'] ?? ''));
            $slug = trim((string) ($body['slug'] ?? ''));
            $shortDescription = trim((string) ($body['short_description'] ?? ''));
            $description = trim((string) ($body['description'] ?? ''));
            $duration = trim((string) ($body['duration'] ?? ''));

            $durationStart = trim((string) ($body['duration_start'] ?? ''));
            $durationEnd = trim((string) ($body['duration_end'] ?? ''));
            $departureLocation = trim((string) ($body['departure_location'] ?? ''));
            $returnLocation = trim((string) ($body['return_location'] ?? ''));

            $categoryId = filter_var($body['category_id'] ?? null, FILTER_VALIDATE_INT);
            $destinationId = filter_var($body['destination_id'] ?? null, FILTER_VALIDATE_INT);

            $featured = $this->parseBoolean($body['featured'] ?? false);
            $status = strtoupper(trim((string) ($body['status'] ?? 'ACTIVE')));

            $this->validateTourFields(
                $title, $slug, $categoryId, $destinationId,
                $shortDescription, $description, $duration, $status
            );

            $slugCheck = $this->db->prepare("SELECT id FROM tours WHERE slug = :slug LIMIT 1");
            $slugCheck->execute([':slug' => $slug]);

            if ($slugCheck->fetchColumn()) {
                Response::error('A tour with this slug already exists.', 409);
            }

            $categoryCheck = $this->db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
            $categoryCheck->execute([':id' => $categoryId]);

            if (!$categoryCheck->fetchColumn()) {
                Response::error('Selected category was not found.', 422);
            }

            $destinationCheck = $this->db->prepare("SELECT id FROM destinations WHERE id = :id LIMIT 1");
            $destinationCheck->execute([':id' => $destinationId]);

            if (!$destinationCheck->fetchColumn()) {
                Response::error('Selected destination was not found.', 422);
            }

            $statement = $this->db->prepare("
                INSERT INTO tours (
                    category_id, destination_id,
                    title, slug, short_description, description, duration,
                    featured, status,
                    duration_start, duration_end,
                    departure_location, return_location
                )
                VALUES (
                    :category_id, :destination_id,
                    :title, :slug, :short_description, :description, :duration,
                    :featured, :status,
                    :duration_start, :duration_end,
                    :departure_location, :return_location
                )
                RETURNING id
            ");

            $statement->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
            $statement->bindValue(':destination_id', $destinationId, PDO::PARAM_INT);
            $statement->bindValue(':title', $title);
            $statement->bindValue(':slug', $slug);
            $statement->bindValue(':short_description', $shortDescription !== '' ? $shortDescription : null,
                $shortDescription !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':description', $description !== '' ? $description : null,
                $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':duration', $duration !== '' ? $duration : null,
                $duration !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':featured', $featured, PDO::PARAM_BOOL);
            $statement->bindValue(':status', $status);
            $statement->bindValue(':duration_start', $durationStart !== '' ? $durationStart : null,
                $durationStart !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':duration_end', $durationEnd !== '' ? $durationEnd : null,
                $durationEnd !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':departure_location', $departureLocation !== '' ? $departureLocation : null,
                $departureLocation !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':return_location', $returnLocation !== '' ? $returnLocation : null,
                $returnLocation !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);

            $statement->execute();
            $id = (int) $statement->fetchColumn();

            $this->upsertTourTranslations($id, $title, $slug, $shortDescription, $description, $duration);

            /* SAVE RICH CONTENT */
            $tourModel = new Tour($this->db);
            $tourModel->saveListItems($id, $body);
            $tourModel->saveGroupPrices($id, $body['group_prices'] ?? []);
            $tourModel->saveExtraSections($id, $body['extra_sections'] ?? []);

            Response::success(['id' => $id], 'Tour created successfully.', 201);

        } catch (PDOException $e) {
            error_log('Admin tour store database error: ' . $e->getMessage());
            Response::error('Unable to create the tour at this time.', 500);
        } catch (Throwable $e) {
            error_log('Admin tour store application error: ' . $e->getMessage());
            Response::error('Unable to create the tour at this time.', 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | SHOW TOUR
    |--------------------------------------------------------------------------
    */

    public function show(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) Response::error('Invalid tour ID.', 422);

        try {
            $statement = $this->db->prepare("
                SELECT
                    t.id, t.category_id, c.name AS category_name,
                    t.destination_id, d.name AS destination_name,
                    t.title, t.slug, t.short_description, t.description,
                    t.duration, t.featured, t.status,
                    t.duration_start, t.duration_end,
                    t.departure_location, t.return_location,
                    t.created_at, t.updated_at
                FROM tours t
                INNER JOIN categories c ON c.id = t.category_id
                INNER JOIN destinations d ON d.id = t.destination_id
                WHERE t.id = :id
                LIMIT 1
            ");

            $statement->execute([':id' => $id]);
            $tour = $statement->fetch(PDO::FETCH_ASSOC);

            if (!$tour) Response::error('Tour not found.', 404);

            $priceStatement = $this->db->prepare("
                SELECT id, tour_id, pricing_type, min_people, max_people, price, currency, created_at
                FROM tour_prices
                WHERE tour_id = :tour_id
                ORDER BY price ASC, min_people ASC, id ASC
            ");
            $priceStatement->execute([':tour_id' => $id]);
            $prices = $priceStatement->fetchAll(PDO::FETCH_ASSOC);

            $imageStatement = $this->db->prepare("
                SELECT id, tour_id, image_url, alt_text, is_primary, sort_order, created_at
                FROM tour_images
                WHERE tour_id = :tour_id
                ORDER BY is_primary DESC, sort_order ASC, id ASC
            ");
            $imageStatement->execute([':tour_id' => $id]);
            $images = $imageStatement->fetchAll(PDO::FETCH_ASSOC);

            $tour['id'] = (int) $tour['id'];
            $tour['category_id'] = (int) $tour['category_id'];
            $tour['destination_id'] = (int) $tour['destination_id'];
            $tour['featured'] = filter_var($tour['featured'], FILTER_VALIDATE_BOOLEAN);

            foreach ($prices as &$price) {
                $price['id'] = (int) $price['id'];
                $price['tour_id'] = (int) $price['tour_id'];
                $price['min_people'] = (int) $price['min_people'];
                $price['max_people'] = $price['max_people'] !== null ? (int) $price['max_people'] : null;
                $price['price'] = (float) $price['price'];
            }
            unset($price);

            foreach ($images as &$image) {
                $image['id'] = (int) $image['id'];
                $image['tour_id'] = (int) $image['tour_id'];
                $image['is_primary'] = filter_var($image['is_primary'], FILTER_VALIDATE_BOOLEAN);
                $image['sort_order'] = (int) $image['sort_order'];
            }
            unset($image);

            $tour['prices'] = $prices;
            $tour['images'] = $images;

            /* RICH CONTENT */
            $tourModel = new Tour($this->db);
            $tour['list_items'] = $tourModel->getListItems($id);
            $tour['group_prices'] = $tourModel->getGroupPrices($id);
            $tour['extra_sections'] = $tourModel->getExtraSections($id);

            Response::success(['tour' => $tour], 'Tour retrieved successfully.');

        } catch (PDOException $e) {
            error_log('Admin tour show database error: ' . $e->getMessage());
            Response::error('Unable to retrieve the tour at this time.', 500);
        } catch (Throwable $e) {
            error_log('Admin tour show application error: ' . $e->getMessage());
            Response::error('Unable to retrieve the tour at this time.', 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE TOUR
    |--------------------------------------------------------------------------
    */

    public function update(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) Response::error('Invalid tour ID.', 422);

        try {
            $body = Request::body();

            $title = trim((string) ($body['title'] ?? ''));
            $slug = trim((string) ($body['slug'] ?? ''));
            $shortDescription = trim((string) ($body['short_description'] ?? ''));
            $description = trim((string) ($body['description'] ?? ''));
            $duration = trim((string) ($body['duration'] ?? ''));

            $durationStart = trim((string) ($body['duration_start'] ?? ''));
            $durationEnd = trim((string) ($body['duration_end'] ?? ''));
            $departureLocation = trim((string) ($body['departure_location'] ?? ''));
            $returnLocation = trim((string) ($body['return_location'] ?? ''));

            $categoryId = filter_var($body['category_id'] ?? null, FILTER_VALIDATE_INT);
            $destinationId = filter_var($body['destination_id'] ?? null, FILTER_VALIDATE_INT);

            $featured = $this->parseBoolean($body['featured'] ?? false);
            $status = strtoupper(trim((string) ($body['status'] ?? 'ACTIVE')));

            $this->validateTourFields(
                $title, $slug, $categoryId, $destinationId,
                $shortDescription, $description, $duration, $status
            );

            $tourCheck = $this->db->prepare("SELECT id FROM tours WHERE id = :id LIMIT 1");
            $tourCheck->execute([':id' => $id]);

            if (!$tourCheck->fetchColumn()) Response::error('Tour not found.', 404);

            $slugCheck = $this->db->prepare("SELECT id FROM tours WHERE slug = :slug AND id <> :id LIMIT 1");
            $slugCheck->execute([':slug' => $slug, ':id' => $id]);

            if ($slugCheck->fetchColumn()) Response::error('A tour with this slug already exists.', 409);

            $categoryCheck = $this->db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
            $categoryCheck->execute([':id' => $categoryId]);
            if (!$categoryCheck->fetchColumn()) Response::error('Selected category was not found.', 422);

            $destinationCheck = $this->db->prepare("SELECT id FROM destinations WHERE id = :id LIMIT 1");
            $destinationCheck->execute([':id' => $destinationId]);
            if (!$destinationCheck->fetchColumn()) Response::error('Selected destination was not found.', 422);

            $statement = $this->db->prepare("
                UPDATE tours
                SET
                    category_id = :category_id,
                    destination_id = :destination_id,
                    title = :title,
                    slug = :slug,
                    short_description = :short_description,
                    description = :description,
                    duration = :duration,
                    featured = :featured,
                    status = :status,
                    duration_start = :duration_start,
                    duration_end = :duration_end,
                    departure_location = :departure_location,
                    return_location = :return_location,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            ");

            $statement->bindValue(':category_id', $categoryId, PDO::PARAM_INT);
            $statement->bindValue(':destination_id', $destinationId, PDO::PARAM_INT);
            $statement->bindValue(':title', $title);
            $statement->bindValue(':slug', $slug);
            $statement->bindValue(':short_description', $shortDescription !== '' ? $shortDescription : null,
                $shortDescription !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':description', $description !== '' ? $description : null,
                $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':duration', $duration !== '' ? $duration : null,
                $duration !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':featured', $featured, PDO::PARAM_BOOL);
            $statement->bindValue(':status', $status);
            $statement->bindValue(':duration_start', $durationStart !== '' ? $durationStart : null,
                $durationStart !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':duration_end', $durationEnd !== '' ? $durationEnd : null,
                $durationEnd !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':departure_location', $departureLocation !== '' ? $departureLocation : null,
                $departureLocation !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':return_location', $returnLocation !== '' ? $returnLocation : null,
                $returnLocation !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':id', $id, PDO::PARAM_INT);
            $statement->execute();

            $this->upsertTourTranslations($id, $title, $slug, $shortDescription, $description, $duration);

            /* REPLACE RICH CONTENT */
            $tourModel = new Tour($this->db);
            $tourModel->clearRelatedData($id);
            $tourModel->saveListItems($id, $body);
            $tourModel->saveGroupPrices($id, $body['group_prices'] ?? []);
            $tourModel->saveExtraSections($id, $body['extra_sections'] ?? []);

            Response::success(['id' => $id], 'Tour updated successfully.');

        } catch (PDOException $e) {
            error_log('Admin tour update database error: ' . $e->getMessage());
            Response::error('Unable to update the tour at this time.', 500);
        } catch (Throwable $e) {
            error_log('Admin tour update application error: ' . $e->getMessage());
            Response::error('Unable to update the tour at this time.', 500);
        }
    }


    /*
    |--------------------------------------------------------------------------
    | (All other existing methods — updateStatus, updateFeatured, prices,
    |  storePrice, updatePrice, destroyPrice, images, storeImage,
    |  updateImage, destroyImage, destroy, and the private helpers —
    |  stay exactly as they are.)
    |--------------------------------------------------------------------------
    */


    /*
    |--------------------------------------------------------------------------
    | PRIVATE HELPERS (unchanged from your existing file)
    |--------------------------------------------------------------------------
    */

    private function validateTourId(int $id): void
    {
        if ($id <= 0) Response::error('Invalid tour ID.', 422);
    }

    private function ensureTourExists(int $id): void
    {
        $statement = $this->db->prepare("SELECT id FROM tours WHERE id = :id LIMIT 1");
        $statement->execute([':id' => $id]);

        if (!$statement->fetchColumn()) Response::error('Tour not found.', 404);
    }

    private function validateTourFields(
        string $title,
        string $slug,
        mixed $categoryId,
        mixed $destinationId,
        string $shortDescription,
        string $description,
        string $duration,
        string $status
    ): void {
        if ($title === '') Response::error('Tour title is required.', 422);
        if (mb_strlen($title) > 200) Response::error('Tour title cannot exceed 200 characters.', 422);

        if ($slug === '') Response::error('Tour slug is required.', 422);
        if (mb_strlen($slug) > 220) Response::error('Tour slug cannot exceed 220 characters.', 422);
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            Response::error('Tour slug may contain only lowercase letters, numbers, and hyphens.', 422);
        }

        if (!is_int($categoryId) || $categoryId <= 0) {
            Response::error('A valid category ID is required.', 422);
        }

        if (!is_int($destinationId) || $destinationId <= 0) {
            Response::error('A valid destination ID is required.', 422);
        }

        if (mb_strlen($shortDescription) > 500) {
            Response::error('Short description cannot exceed 500 characters.', 422);
        }

        if (mb_strlen($duration) > 100) {
            Response::error('Duration cannot exceed 100 characters.', 422);
        }

        if (!in_array($status, ['ACTIVE', 'INACTIVE'], true)) {
            Response::error('Tour status must be ACTIVE or INACTIVE.', 422);
        }
    }

    /* validatePriceFields, parseBoolean, normalizePrice(s), normalizeImage(s)
       — keep them exactly as they are in your current file. */
}