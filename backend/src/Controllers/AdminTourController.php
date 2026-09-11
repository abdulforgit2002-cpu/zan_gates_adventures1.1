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
                ':tour_id' => $tourId,
                ':language' => $language,
                ':title' => $title,
                ':slug' => $slug,
                ':short_description' => $shortDescription !== '' ? $shortDescription : null,
                ':description' => $description !== '' ? $description : null,
                ':duration' => $duration !== '' ? $duration : null,
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
            $page = filter_input(
                INPUT_GET,
                'page',
                FILTER_VALIDATE_INT
            );

            $perPage = filter_input(
                INPUT_GET,
                'per_page',
                FILTER_VALIDATE_INT
            );

            $page = $page && $page > 0
                ? $page
                : 1;

            $perPage = $perPage && $perPage > 0
                ? min($perPage, 100)
                : 10;

            $search = trim(
                (string) (
                    filter_input(
                        INPUT_GET,
                        'search',
                        FILTER_UNSAFE_RAW
                    ) ?? ''
                )
            );

            $status = strtoupper(
                trim(
                    (string) (
                        filter_input(
                            INPUT_GET,
                            'status',
                            FILTER_UNSAFE_RAW
                        ) ?? ''
                    )
                )
            );

            $featuredParam = filter_input(
                INPUT_GET,
                'featured',
                FILTER_UNSAFE_RAW
            );

            $categoryId = filter_input(
                INPUT_GET,
                'category_id',
                FILTER_VALIDATE_INT
            );

            $destinationId = filter_input(
                INPUT_GET,
                'destination_id',
                FILTER_VALIDATE_INT
            );

            $featured = null;

            if (
                $featuredParam !== null &&
                $featuredParam !== ''
            ) {
                $normalizedFeatured = strtolower(
                    trim((string) $featuredParam)
                );

                if (
                    in_array(
                        $normalizedFeatured,
                        ['true', '1', 'yes'],
                        true
                    )
                ) {
                    $featured = true;
                } elseif (
                    in_array(
                        $normalizedFeatured,
                        ['false', '0', 'no'],
                        true
                    )
                ) {
                    $featured = false;
                }
            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE FILTERS
            |--------------------------------------------------------------------------
            */

            if (
                $status !== '' &&
                !in_array(
                    $status,
                    ['ACTIVE', 'INACTIVE'],
                    true
                )
            ) {
                Response::error(
                    'Invalid tour status.',
                    422
                );
            }

            if (
                $categoryId !== null &&
                $categoryId !== false &&
                $categoryId <= 0
            ) {
                Response::error(
                    'Invalid category ID.',
                    422
                );
            }

            if (
                $destinationId !== null &&
                $destinationId !== false &&
                $destinationId <= 0
            ) {
                Response::error(
                    'Invalid destination ID.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | BUILD FILTERS
            |--------------------------------------------------------------------------
            */

            $where = [];
            $params = [];

            if ($search !== '') {
                $where[] = "
                    (
                        t.title ILIKE :search
                        OR t.slug ILIKE :search
                        OR t.short_description ILIKE :search
                        OR t.description ILIKE :search
                        OR c.name ILIKE :search
                        OR d.name ILIKE :search
                    )
                ";

                $params[':search'] =
                    '%' . $search . '%';
            }

            if ($status !== '') {
                $where[] =
                    't.status = :status';

                $params[':status'] =
                    $status;
            }

            if ($featured !== null) {
                $where[] =
                    't.featured = :featured';

                $params[':featured'] =
                    $featured;
            }

            if (
                $categoryId !== null &&
                $categoryId !== false
            ) {
                $where[] =
                    't.category_id = :category_id';

                $params[':category_id'] =
                    $categoryId;
            }

            if (
                $destinationId !== null &&
                $destinationId !== false
            ) {
                $where[] =
                    't.destination_id = :destination_id';

                $params[':destination_id'] =
                    $destinationId;
            }

            $whereSql =
                count($where) > 0
                    ? 'WHERE ' . implode(
                        ' AND ',
                        $where
                    )
                    : '';


            /*
            |--------------------------------------------------------------------------
            | TOTAL
            |--------------------------------------------------------------------------
            */

            $countSql = "
                SELECT COUNT(*)
                FROM tours t
                INNER JOIN categories c
                    ON c.id = t.category_id
                INNER JOIN destinations d
                    ON d.id = t.destination_id
                {$whereSql}
            ";

            $countStatement =
                $this->db->prepare($countSql);

            foreach (
                $params as $key => $value
            ) {
                if ($key === ':featured') {
                    $countStatement->bindValue(
                        $key,
                        $value,
                        PDO::PARAM_BOOL
                    );
                } elseif (
                    $key === ':category_id' ||
                    $key === ':destination_id'
                ) {
                    $countStatement->bindValue(
                        $key,
                        $value,
                        PDO::PARAM_INT
                    );
                } else {
                    $countStatement->bindValue(
                        $key,
                        $value
                    );
                }
            }

            $countStatement->execute();

            $total =
                (int) $countStatement->fetchColumn();


            /*
            |--------------------------------------------------------------------------
            | PAGINATION
            |--------------------------------------------------------------------------
            */

            $totalPages =
                $total > 0
                    ? (int) ceil(
                        $total / $perPage
                    )
                    : 1;

            if ($page > $totalPages) {
                $page = $totalPages;
            }

            $offset =
                ($page - 1) * $perPage;


            /*
            |--------------------------------------------------------------------------
            | TOUR LIST
            |--------------------------------------------------------------------------
            */

            $sql = "
                SELECT
                    t.id,
                    t.category_id,
                    c.name AS category_name,
                    t.destination_id,
                    d.name AS destination_name,
                    t.title,
                    t.slug,
                    t.short_description,
                    t.description,
                    t.duration,
                    t.featured,
                    t.status,
                    t.created_at,
                    t.updated_at,

                    price_data.lowest_price,
                    price_data.currency,
                    price_data.pricing_type,

                    (
                        SELECT COUNT(*)
                        FROM tour_prices tp_count
                        WHERE tp_count.tour_id = t.id
                    ) AS price_count,

                    (
                        SELECT COUNT(*)
                        FROM tour_images ti_count
                        WHERE ti_count.tour_id = t.id
                    ) AS image_count,

                    (
                        SELECT ti_primary.image_url
                        FROM tour_images ti_primary
                        WHERE ti_primary.tour_id = t.id
                          AND ti_primary.is_primary = TRUE
                        ORDER BY
                            ti_primary.sort_order ASC,
                            ti_primary.id ASC
                        LIMIT 1
                    ) AS primary_image

                FROM tours t

                INNER JOIN categories c
                    ON c.id = t.category_id

                INNER JOIN destinations d
                    ON d.id = t.destination_id

                LEFT JOIN LATERAL (
                    SELECT
                        tp.price AS lowest_price,
                        tp.currency,
                        tp.pricing_type
                    FROM tour_prices tp
                    WHERE tp.tour_id = t.id
                    ORDER BY
                        tp.price ASC,
                        tp.min_people ASC,
                        tp.id ASC
                    LIMIT 1
                ) price_data
                    ON TRUE

                {$whereSql}

                ORDER BY
                    t.featured DESC,
                    t.created_at DESC,
                    t.id DESC

                LIMIT :limit
                OFFSET :offset
            ";

            $statement =
                $this->db->prepare($sql);

            foreach (
                $params as $key => $value
            ) {
                if ($key === ':featured') {
                    $statement->bindValue(
                        $key,
                        $value,
                        PDO::PARAM_BOOL
                    );
                } elseif (
                    $key === ':category_id' ||
                    $key === ':destination_id'
                ) {
                    $statement->bindValue(
                        $key,
                        $value,
                        PDO::PARAM_INT
                    );
                } else {
                    $statement->bindValue(
                        $key,
                        $value
                    );
                }
            }

            $statement->bindValue(
                ':limit',
                $perPage,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':offset',
                $offset,
                PDO::PARAM_INT
            );

            $statement->execute();

            $tours =
                $statement->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE
            |--------------------------------------------------------------------------
            */

            foreach (
                $tours as &$tour
            ) {
                $tour['id'] =
                    (int) $tour['id'];

                $tour['category_id'] =
                    (int) $tour['category_id'];

                $tour['destination_id'] =
                    (int) $tour['destination_id'];

                $tour['featured'] =
                    filter_var(
                        $tour['featured'],
                        FILTER_VALIDATE_BOOLEAN
                    );

                $tour['price_count'] =
                    (int) $tour['price_count'];

                $tour['image_count'] =
                    (int) $tour['image_count'];

                if (
                    $tour['lowest_price'] !== null
                ) {
                    $tour['lowest_price'] =
                        (float) $tour['lowest_price'];
                }
            }

            unset($tour);


            Response::success(
                [
                    'tours' => $tours,
                    'pagination' => [
                        'page' =>
                            $page,
                        'per_page' =>
                            $perPage,
                        'total' =>
                            $total,
                        'total_pages' =>
                            $totalPages,
                        'has_next_page' =>
                            $page < $totalPages,
                        'has_previous_page' =>
                            $page > 1,
                    ],
                ],
                'Tours retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour index database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve tours at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour index application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve tours at this time.',
                500
            );
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

            $title =
                trim((string) ($body['title'] ?? ''));

            $slug =
                trim((string) ($body['slug'] ?? ''));

            $shortDescription =
                trim(
                    (string) (
                        $body['short_description'] ?? ''
                    )
                );

            $description =
                trim(
                    (string) (
                        $body['description'] ?? ''
                    )
                );

            $duration =
                trim(
                    (string) (
                        $body['duration'] ?? ''
                    )
                );

            $categoryId =
                filter_var(
                    $body['category_id'] ?? null,
                    FILTER_VALIDATE_INT
                );

            $destinationId =
                filter_var(
                    $body['destination_id'] ?? null,
                    FILTER_VALIDATE_INT
                );

            $featured =
                $this->parseBoolean(
                    $body['featured'] ?? false
                );

            $status =
                strtoupper(
                    trim(
                        (string) (
                            $body['status'] ?? 'ACTIVE'
                        )
                    )
                );


            /*
            |--------------------------------------------------------------------------
            | VALIDATION
            |--------------------------------------------------------------------------
            */

            $this->validateTourFields(
                $title,
                $slug,
                $categoryId,
                $destinationId,
                $shortDescription,
                $description,
                $duration,
                $status
            );


            /*
            |--------------------------------------------------------------------------
            | CHECK SLUG
            |--------------------------------------------------------------------------
            */

            $slugCheck =
                $this->db->prepare("
                    SELECT id
                    FROM tours
                    WHERE slug = :slug
                    LIMIT 1
                ");

            $slugCheck->execute([
                ':slug' => $slug,
            ]);

            if ($slugCheck->fetchColumn()) {
                Response::error(
                    'A tour with this slug already exists.',
                    409
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK CATEGORY
            |--------------------------------------------------------------------------
            */

            $categoryCheck =
                $this->db->prepare("
                    SELECT id
                    FROM categories
                    WHERE id = :id
                    LIMIT 1
                ");

            $categoryCheck->execute([
                ':id' => $categoryId,
            ]);

            if (!$categoryCheck->fetchColumn()) {
                Response::error(
                    'Selected category was not found.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK DESTINATION
            |--------------------------------------------------------------------------
            */

            $destinationCheck =
                $this->db->prepare("
                    SELECT id
                    FROM destinations
                    WHERE id = :id
                    LIMIT 1
                ");

            $destinationCheck->execute([
                ':id' => $destinationId,
            ]);

            if (!$destinationCheck->fetchColumn()) {
                Response::error(
                    'Selected destination was not found.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | INSERT
            |--------------------------------------------------------------------------
            */

            $statement =
                $this->db->prepare("
                    INSERT INTO tours (
                        category_id,
                        destination_id,
                        title,
                        slug,
                        short_description,
                        description,
                        duration,
                        featured,
                        status
                    )
                    VALUES (
                        :category_id,
                        :destination_id,
                        :title,
                        :slug,
                        :short_description,
                        :description,
                        :duration,
                        :featured,
                        :status
                    )
                    RETURNING id
                ");

            $statement->bindValue(
                ':category_id',
                $categoryId,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':destination_id',
                $destinationId,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':title',
                $title
            );

            $statement->bindValue(
                ':slug',
                $slug
            );

            $statement->bindValue(
                ':short_description',
                $shortDescription !== ''
                    ? $shortDescription
                    : null,
                $shortDescription !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':description',
                $description !== ''
                    ? $description
                    : null,
                $description !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':duration',
                $duration !== ''
                    ? $duration
                    : null,
                $duration !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':featured',
                $featured,
                PDO::PARAM_BOOL
            );

            $statement->bindValue(
                ':status',
                $status
            );

            $statement->execute();

            $id =
                (int) $statement->fetchColumn();

            $this->upsertTourTranslations(
                $id,
                $title,
                $slug,
                $shortDescription,
                $description,
                $duration
            );

            Response::success(
                [
                    'id' => $id,
                ],
                'Tour created successfully.',
                201
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour store database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to create the tour at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour store application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to create the tour at this time.',
                500
            );
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

        if ($id <= 0) {
            Response::error(
                'Invalid tour ID.',
                422
            );
        }

        try {
            $statement =
                $this->db->prepare("
                    SELECT
                        t.id,
                        t.category_id,
                        c.name AS category_name,
                        t.destination_id,
                        d.name AS destination_name,
                        t.title,
                        t.slug,
                        t.short_description,
                        t.description,
                        t.duration,
                        t.featured,
                        t.status,
                        t.created_at,
                        t.updated_at
                    FROM tours t
                    INNER JOIN categories c
                        ON c.id = t.category_id
                    INNER JOIN destinations d
                        ON d.id = t.destination_id
                    WHERE t.id = :id
                    LIMIT 1
                ");

            $statement->execute([
                ':id' => $id,
            ]);

            $tour =
                $statement->fetch(
                    PDO::FETCH_ASSOC
                );

            if (!$tour) {
                Response::error(
                    'Tour not found.',
                    404
                );
            }


            /*
            |--------------------------------------------------------------------------
            | PRICES
            |--------------------------------------------------------------------------
            */

            $priceStatement =
                $this->db->prepare("
                    SELECT
                        id,
                        tour_id,
                        pricing_type,
                        min_people,
                        max_people,
                        price,
                        currency,
                        created_at
                    FROM tour_prices
                    WHERE tour_id = :tour_id
                    ORDER BY
                        price ASC,
                        min_people ASC,
                        id ASC
                ");

            $priceStatement->execute([
                ':tour_id' => $id,
            ]);

            $prices =
                $priceStatement->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | IMAGES
            |--------------------------------------------------------------------------
            */

            $imageStatement =
                $this->db->prepare("
                    SELECT
                        id,
                        tour_id,
                        image_url,
                        alt_text,
                        is_primary,
                        sort_order,
                        created_at
                    FROM tour_images
                    WHERE tour_id = :tour_id
                    ORDER BY
                        is_primary DESC,
                        sort_order ASC,
                        id ASC
                ");

            $imageStatement->execute([
                ':tour_id' => $id,
            ]);

            $images =
                $imageStatement->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE
            |--------------------------------------------------------------------------
            */

            $tour['id'] =
                (int) $tour['id'];

            $tour['category_id'] =
                (int) $tour['category_id'];

            $tour['destination_id'] =
                (int) $tour['destination_id'];

            $tour['featured'] =
                filter_var(
                    $tour['featured'],
                    FILTER_VALIDATE_BOOLEAN
                );

            foreach (
                $prices as &$price
            ) {
                $price['id'] =
                    (int) $price['id'];

                $price['tour_id'] =
                    (int) $price['tour_id'];

                $price['min_people'] =
                    (int) $price['min_people'];

                $price['max_people'] =
                    $price['max_people'] !== null
                        ? (int) $price['max_people']
                        : null;

                $price['price'] =
                    (float) $price['price'];
            }

            unset($price);

            foreach (
                $images as &$image
            ) {
                $image['id'] =
                    (int) $image['id'];

                $image['tour_id'] =
                    (int) $image['tour_id'];

                $image['is_primary'] =
                    filter_var(
                        $image['is_primary'],
                        FILTER_VALIDATE_BOOLEAN
                    );

                $image['sort_order'] =
                    (int) $image['sort_order'];
            }

            unset($image);

            $tour['prices'] =
                $prices;

            $tour['images'] =
                $images;


            Response::success(
                [
                    'tour' => $tour,
                ],
                'Tour retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour show database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve the tour at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour show application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve the tour at this time.',
                500
            );
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

        if ($id <= 0) {
            Response::error(
                'Invalid tour ID.',
                422
            );
        }

        try {
            $body = Request::body();

            $title =
                trim((string) ($body['title'] ?? ''));

            $slug =
                trim((string) ($body['slug'] ?? ''));

            $shortDescription =
                trim(
                    (string) (
                        $body['short_description'] ?? ''
                    )
                );

            $description =
                trim(
                    (string) (
                        $body['description'] ?? ''
                    )
                );

            $duration =
                trim(
                    (string) (
                        $body['duration'] ?? ''
                    )
                );

            $categoryId =
                filter_var(
                    $body['category_id'] ?? null,
                    FILTER_VALIDATE_INT
                );

            $destinationId =
                filter_var(
                    $body['destination_id'] ?? null,
                    FILTER_VALIDATE_INT
                );

            $featured =
                $this->parseBoolean(
                    $body['featured'] ?? false
                );

            $status =
                strtoupper(
                    trim(
                        (string) (
                            $body['status'] ?? 'ACTIVE'
                        )
                    )
                );


            $this->validateTourFields(
                $title,
                $slug,
                $categoryId,
                $destinationId,
                $shortDescription,
                $description,
                $duration,
                $status
            );


            /*
            |--------------------------------------------------------------------------
            | CHECK TOUR
            |--------------------------------------------------------------------------
            */

            $tourCheck =
                $this->db->prepare("
                    SELECT id
                    FROM tours
                    WHERE id = :id
                    LIMIT 1
                ");

            $tourCheck->execute([
                ':id' => $id,
            ]);

            if (!$tourCheck->fetchColumn()) {
                Response::error(
                    'Tour not found.',
                    404
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK SLUG
            |--------------------------------------------------------------------------
            */

            $slugCheck =
                $this->db->prepare("
                    SELECT id
                    FROM tours
                    WHERE slug = :slug
                      AND id <> :id
                    LIMIT 1
                ");

            $slugCheck->execute([
                ':slug' => $slug,
                ':id' => $id,
            ]);

            if ($slugCheck->fetchColumn()) {
                Response::error(
                    'A tour with this slug already exists.',
                    409
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK CATEGORY
            |--------------------------------------------------------------------------
            */

            $categoryCheck =
                $this->db->prepare("
                    SELECT id
                    FROM categories
                    WHERE id = :id
                    LIMIT 1
                ");

            $categoryCheck->execute([
                ':id' => $categoryId,
            ]);

            if (!$categoryCheck->fetchColumn()) {
                Response::error(
                    'Selected category was not found.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK DESTINATION
            |--------------------------------------------------------------------------
            */

            $destinationCheck =
                $this->db->prepare("
                    SELECT id
                    FROM destinations
                    WHERE id = :id
                    LIMIT 1
                ");

            $destinationCheck->execute([
                ':id' => $destinationId,
            ]);

            if (!$destinationCheck->fetchColumn()) {
                Response::error(
                    'Selected destination was not found.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | UPDATE
            |--------------------------------------------------------------------------
            */

            $statement =
                $this->db->prepare("
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
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                ");

            $statement->bindValue(
                ':category_id',
                $categoryId,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':destination_id',
                $destinationId,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':title',
                $title
            );

            $statement->bindValue(
                ':slug',
                $slug
            );

            $statement->bindValue(
                ':short_description',
                $shortDescription !== ''
                    ? $shortDescription
                    : null,
                $shortDescription !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':description',
                $description !== ''
                    ? $description
                    : null,
                $description !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':duration',
                $duration !== ''
                    ? $duration
                    : null,
                $duration !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':featured',
                $featured,
                PDO::PARAM_BOOL
            );

            $statement->bindValue(
                ':status',
                $status
            );

            $statement->bindValue(
                ':id',
                $id,
                PDO::PARAM_INT
            );

            $statement->execute();

            $this->upsertTourTranslations(
                $id,
                $title,
                $slug,
                $shortDescription,
                $description,
                $duration
            );

            Response::success(
                [
                    'id' => $id,
                ],
                'Tour updated successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour update database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update the tour at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour update application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update the tour at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) {
            Response::error(
                'Invalid tour ID.',
                422
            );
        }

        try {
            $body =
                Request::body();

            $status =
                strtoupper(
                    trim(
                        (string) (
                            $body['status'] ?? ''
                        )
                    )
                );

            if (
                !in_array(
                    $status,
                    ['ACTIVE', 'INACTIVE'],
                    true
                )
            ) {
                Response::error(
                    'Tour status must be ACTIVE or INACTIVE.',
                    422
                );
            }

            $this->db->beginTransaction();

            $check =
                $this->db->prepare("
                    SELECT id
                    FROM tours
                    WHERE id = :id
                    FOR UPDATE
                ");

            $check->execute([
                ':id' => $id,
            ]);

            if (!$check->fetchColumn()) {
                $this->db->rollBack();

                Response::error(
                    'Tour not found.',
                    404
                );
            }

            $statement =
                $this->db->prepare("
                    UPDATE tours
                    SET
                        status = :status,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                ");

            $statement->execute([
                ':status' => $status,
                ':id' => $id,
            ]);

            $this->db->commit();

            Response::success(
                [
                    'id' => $id,
                    'status' => $status,
                ],
                'Tour status updated successfully.'
            );

        } catch (PDOException $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour status database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update tour status at this time.',
                500
            );

        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour status application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update tour status at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE FEATURED
    |--------------------------------------------------------------------------
    */

    public function updateFeatured(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) {
            Response::error(
                'Invalid tour ID.',
                422
            );
        }

        try {
            $body =
                Request::body();

            if (
                !array_key_exists(
                    'featured',
                    $body
                )
            ) {
                Response::error(
                    'Featured value is required.',
                    422
                );
            }

            $featured =
                $this->parseBoolean(
                    $body['featured']
                );

            $statement =
                $this->db->prepare("
                    UPDATE tours
                    SET
                        featured = :featured,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    RETURNING id, featured
                ");

            $statement->bindValue(
                ':featured',
                $featured,
                PDO::PARAM_BOOL
            );

            $statement->bindValue(
                ':id',
                $id,
                PDO::PARAM_INT
            );

            $statement->execute();

            $tour =
                $statement->fetch(
                    PDO::FETCH_ASSOC
                );

            if (!$tour) {
                Response::error(
                    'Tour not found.',
                    404
                );
            }

            $tour['id'] =
                (int) $tour['id'];

            $tour['featured'] =
                filter_var(
                    $tour['featured'],
                    FILTER_VALIDATE_BOOLEAN
                );

            Response::success(
                [
                    'tour' => $tour,
                ],
                'Tour featured status updated successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour featured database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update featured status at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour featured application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update featured status at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | LIST PRICES
    |--------------------------------------------------------------------------
    */

    public function prices(int $id): never
    {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        try {
            $this->ensureTourExists($id);

            $statement =
                $this->db->prepare("
                    SELECT
                        id,
                        tour_id,
                        pricing_type,
                        min_people,
                        max_people,
                        price,
                        currency,
                        created_at
                    FROM tour_prices
                    WHERE tour_id = :tour_id
                    ORDER BY
                        price ASC,
                        min_people ASC,
                        id ASC
                ");

            $statement->execute([
                ':tour_id' => $id,
            ]);

            $prices =
                $statement->fetchAll(
                    PDO::FETCH_ASSOC
                );

            $this->normalizePrices($prices);

            Response::success(
                [
                    'prices' => $prices,
                ],
                'Tour prices retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour prices database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve tour prices at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour prices application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve tour prices at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE PRICE
    |--------------------------------------------------------------------------
    */

    public function storePrice(int $id): never
    {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        try {
            $this->ensureTourExists($id);

            $body =
                Request::body();

            $pricingType =
                strtoupper(
                    trim(
                        (string) (
                            $body['pricing_type'] ?? ''
                        )
                    )
                );

            $minPeople =
                filter_var(
                    $body['min_people'] ?? null,
                    FILTER_VALIDATE_INT
                );

            $maxPeople =
                $body['max_people'] ?? null;

            $price =
                $body['price'] ?? null;

            $currency =
                strtoupper(
                    trim(
                        (string) (
                            $body['currency'] ?? 'USD'
                        )
                    )
                );

            $this->validatePriceFields(
                $pricingType,
                $minPeople,
                $maxPeople,
                $price,
                $currency
            );

            $statement =
                $this->db->prepare("
                    INSERT INTO tour_prices (
                        tour_id,
                        pricing_type,
                        min_people,
                        max_people,
                        price,
                        currency
                    )
                    VALUES (
                        :tour_id,
                        :pricing_type,
                        :min_people,
                        :max_people,
                        :price,
                        :currency
                    )
                    RETURNING
                        id,
                        tour_id,
                        pricing_type,
                        min_people,
                        max_people,
                        price,
                        currency,
                        created_at
                ");

            $statement->bindValue(
                ':tour_id',
                $id,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':pricing_type',
                $pricingType
            );

            $statement->bindValue(
                ':min_people',
                $minPeople,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':max_people',
                $maxPeople,
                $maxPeople === null
                    ? PDO::PARAM_NULL
                    : PDO::PARAM_INT
            );

            $statement->bindValue(
                ':price',
                number_format(
                    (float) $price,
                    2,
                    '.',
                    ''
                )
            );

            $statement->bindValue(
                ':currency',
                $currency
            );

            $statement->execute();

            $createdPrice =
                $statement->fetch(
                    PDO::FETCH_ASSOC
                );

            $this->normalizePrice(
                $createdPrice
            );

            Response::success(
                [
                    'price' => $createdPrice,
                ],
                'Tour price created successfully.',
                201
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour store price database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to create tour price at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour store price application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to create tour price at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE PRICE
    |--------------------------------------------------------------------------
    */

    public function updatePrice(
        int $id,
        int $priceId
    ): never {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        if ($priceId <= 0) {
            Response::error(
                'Invalid price ID.',
                422
            );
        }

        try {
            $this->ensureTourExists($id);

            $body =
                Request::body();

            $pricingType =
                strtoupper(
                    trim(
                        (string) (
                            $body['pricing_type'] ?? ''
                        )
                    )
                );

            $minPeople =
                filter_var(
                    $body['min_people'] ?? null,
                    FILTER_VALIDATE_INT
                );

            $maxPeople =
                $body['max_people'] ?? null;

            $price =
                $body['price'] ?? null;

            $currency =
                strtoupper(
                    trim(
                        (string) (
                            $body['currency'] ?? 'USD'
                        )
                    )
                );

            $this->validatePriceFields(
                $pricingType,
                $minPeople,
                $maxPeople,
                $price,
                $currency
            );


            /*
            |--------------------------------------------------------------------------
            | CHECK PRICE BELONGS TO TOUR
            |--------------------------------------------------------------------------
            */

            $check =
                $this->db->prepare("
                    SELECT id
                    FROM tour_prices
                    WHERE id = :id
                      AND tour_id = :tour_id
                    LIMIT 1
                ");

            $check->execute([
                ':id' => $priceId,
                ':tour_id' => $id,
            ]);

            if (!$check->fetchColumn()) {
                Response::error(
                    'Tour price not found.',
                    404
                );
            }


            $statement =
                $this->db->prepare("
                    UPDATE tour_prices
                    SET
                        pricing_type = :pricing_type,
                        min_people = :min_people,
                        max_people = :max_people,
                        price = :price,
                        currency = :currency
                    WHERE id = :id
                      AND tour_id = :tour_id
                    RETURNING
                        id,
                        tour_id,
                        pricing_type,
                        min_people,
                        max_people,
                        price,
                        currency,
                        created_at
                ");

            $statement->bindValue(
                ':pricing_type',
                $pricingType
            );

            $statement->bindValue(
                ':min_people',
                $minPeople,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':max_people',
                $maxPeople,
                $maxPeople === null
                    ? PDO::PARAM_NULL
                    : PDO::PARAM_INT
            );

            $statement->bindValue(
                ':price',
                number_format(
                    (float) $price,
                    2,
                    '.',
                    ''
                )
            );

            $statement->bindValue(
                ':currency',
                $currency
            );

            $statement->bindValue(
                ':id',
                $priceId,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':tour_id',
                $id,
                PDO::PARAM_INT
            );

            $statement->execute();

            $updatedPrice =
                $statement->fetch(
                    PDO::FETCH_ASSOC
                );

            $this->normalizePrice(
                $updatedPrice
            );

            Response::success(
                [
                    'price' => $updatedPrice,
                ],
                'Tour price updated successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour update price database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update tour price at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour update price application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update tour price at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE PRICE
    |--------------------------------------------------------------------------
    */

    public function destroyPrice(
        int $id,
        int $priceId
    ): never {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        if ($priceId <= 0) {
            Response::error(
                'Invalid price ID.',
                422
            );
        }

        try {
            $this->ensureTourExists($id);

            $statement =
                $this->db->prepare("
                    DELETE FROM tour_prices
                    WHERE id = :id
                      AND tour_id = :tour_id
                ");

            $statement->execute([
                ':id' => $priceId,
                ':tour_id' => $id,
            ]);

            if ($statement->rowCount() === 0) {
                Response::error(
                    'Tour price not found.',
                    404
                );
            }

            Response::success(
                [
                    'id' => $priceId,
                    'tour_id' => $id,
                ],
                'Tour price deleted successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour delete price database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to delete tour price at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour delete price application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to delete tour price at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | LIST IMAGES
    |--------------------------------------------------------------------------
    */

    public function images(int $id): never
    {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        try {
            $this->ensureTourExists($id);

            $statement =
                $this->db->prepare("
                    SELECT
                        id,
                        tour_id,
                        image_url,
                        alt_text,
                        is_primary,
                        sort_order,
                        created_at
                    FROM tour_images
                    WHERE tour_id = :tour_id
                    ORDER BY
                        is_primary DESC,
                        sort_order ASC,
                        id ASC
                ");

            $statement->execute([
                ':tour_id' => $id,
            ]);

            $images =
                $statement->fetchAll(
                    PDO::FETCH_ASSOC
                );

            $this->normalizeImages(
                $images
            );

            Response::success(
                [
                    'images' => $images,
                ],
                'Tour images retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour images database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve tour images at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour images application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve tour images at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE IMAGE
    |--------------------------------------------------------------------------
    */

    public function storeImage(int $id): never
    {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        try {
            $this->ensureTourExists($id);

            $body =
                Request::body();

            $imageUrl =
                trim(
                    (string) (
                        $body['image_url'] ?? ''
                    )
                );

            $altText =
                trim(
                    (string) (
                        $body['alt_text'] ?? ''
                    )
                );

            $sortOrder =
                filter_var(
                    $body['sort_order'] ?? 0,
                    FILTER_VALIDATE_INT
                );

            $sortOrder =
                $sortOrder !== false &&
                $sortOrder >= 0
                    ? $sortOrder
                    : 0;

            $isPrimary =
                $this->parseBoolean(
                    $body['is_primary'] ?? false
                );


            if ($imageUrl === '') {
                Response::error(
                    'Image URL is required.',
                    422
                );
            }

            if (mb_strlen($imageUrl) > 500) {
                Response::error(
                    'Image URL cannot exceed 500 characters.',
                    422
                );
            }

            if (
                $altText !== '' &&
                mb_strlen($altText) > 255
            ) {
                Response::error(
                    'Alt text cannot exceed 255 characters.',
                    422
                );
            }


            $this->db->beginTransaction();

            /*
            |--------------------------------------------------------------------------
            | ENSURE ONLY ONE PRIMARY IMAGE
            |--------------------------------------------------------------------------
            */

            if ($isPrimary) {
                $resetPrimary =
                    $this->db->prepare("
                        UPDATE tour_images
                        SET is_primary = FALSE
                        WHERE tour_id = :tour_id
                    ");

                $resetPrimary->execute([
                    ':tour_id' => $id,
                ]);
            }


            $statement =
                $this->db->prepare("
                    INSERT INTO tour_images (
                        tour_id,
                        image_url,
                        alt_text,
                        is_primary,
                        sort_order
                    )
                    VALUES (
                        :tour_id,
                        :image_url,
                        :alt_text,
                        :is_primary,
                        :sort_order
                    )
                    RETURNING
                        id,
                        tour_id,
                        image_url,
                        alt_text,
                        is_primary,
                        sort_order,
                        created_at
                ");

            $statement->bindValue(
                ':tour_id',
                $id,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':image_url',
                $imageUrl
            );

            $statement->bindValue(
                ':alt_text',
                $altText !== ''
                    ? $altText
                    : null,
                $altText !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':is_primary',
                $isPrimary,
                PDO::PARAM_BOOL
            );

            $statement->bindValue(
                ':sort_order',
                $sortOrder,
                PDO::PARAM_INT
            );

            $statement->execute();

            $createdImage =
                $statement->fetch(
                    PDO::FETCH_ASSOC
                );

            $this->db->commit();

            $this->normalizeImage(
                $createdImage
            );

            Response::success(
                [
                    'image' => $createdImage,
                ],
                'Tour image created successfully.',
                201
            );

        } catch (PDOException $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour store image database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to create tour image at this time.',
                500
            );

        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour store image application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to create tour image at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE IMAGE
    |--------------------------------------------------------------------------
    */

    public function updateImage(
        int $id,
        int $imageId
    ): never {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        if ($imageId <= 0) {
            Response::error(
                'Invalid image ID.',
                422
            );
        }

        try {
            $this->ensureTourExists($id);

            $body =
                Request::body();

            $imageUrl =
                trim(
                    (string) (
                        $body['image_url'] ?? ''
                    )
                );

            $altText =
                trim(
                    (string) (
                        $body['alt_text'] ?? ''
                    )
                );

            $sortOrder =
                filter_var(
                    $body['sort_order'] ?? 0,
                    FILTER_VALIDATE_INT
                );

            $sortOrder =
                $sortOrder !== false &&
                $sortOrder >= 0
                    ? $sortOrder
                    : 0;

            $isPrimary =
                $this->parseBoolean(
                    $body['is_primary'] ?? false
                );


            if ($imageUrl === '') {
                Response::error(
                    'Image URL is required.',
                    422
                );
            }

            if (mb_strlen($imageUrl) > 500) {
                Response::error(
                    'Image URL cannot exceed 500 characters.',
                    422
                );
            }

            if (
                $altText !== '' &&
                mb_strlen($altText) > 255
            ) {
                Response::error(
                    'Alt text cannot exceed 255 characters.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CHECK IMAGE
            |--------------------------------------------------------------------------
            */

            $check =
                $this->db->prepare("
                    SELECT id
                    FROM tour_images
                    WHERE id = :id
                      AND tour_id = :tour_id
                    LIMIT 1
                ");

            $check->execute([
                ':id' => $imageId,
                ':tour_id' => $id,
            ]);

            if (!$check->fetchColumn()) {
                Response::error(
                    'Tour image not found.',
                    404
                );
            }


            $this->db->beginTransaction();

            if ($isPrimary) {
                $resetPrimary =
                    $this->db->prepare("
                        UPDATE tour_images
                        SET is_primary = FALSE
                        WHERE tour_id = :tour_id
                          AND id <> :image_id
                    ");

                $resetPrimary->execute([
                    ':tour_id' => $id,
                    ':image_id' => $imageId,
                ]);
            }


            $statement =
                $this->db->prepare("
                    UPDATE tour_images
                    SET
                        image_url = :image_url,
                        alt_text = :alt_text,
                        is_primary = :is_primary,
                        sort_order = :sort_order
                    WHERE id = :id
                      AND tour_id = :tour_id
                    RETURNING
                        id,
                        tour_id,
                        image_url,
                        alt_text,
                        is_primary,
                        sort_order,
                        created_at
                ");

            $statement->bindValue(
                ':image_url',
                $imageUrl
            );

            $statement->bindValue(
                ':alt_text',
                $altText !== ''
                    ? $altText
                    : null,
                $altText !== ''
                    ? PDO::PARAM_STR
                    : PDO::PARAM_NULL
            );

            $statement->bindValue(
                ':is_primary',
                $isPrimary,
                PDO::PARAM_BOOL
            );

            $statement->bindValue(
                ':sort_order',
                $sortOrder,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':id',
                $imageId,
                PDO::PARAM_INT
            );

            $statement->bindValue(
                ':tour_id',
                $id,
                PDO::PARAM_INT
            );

            $statement->execute();

            $updatedImage =
                $statement->fetch(
                    PDO::FETCH_ASSOC
                );

            $this->db->commit();

            $this->normalizeImage(
                $updatedImage
            );

            Response::success(
                [
                    'image' => $updatedImage,
                ],
                'Tour image updated successfully.'
            );

        } catch (PDOException $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour update image database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update tour image at this time.',
                500
            );

        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour update image application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update tour image at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE IMAGE
    |--------------------------------------------------------------------------
    */

    public function destroyImage(
        int $id,
        int $imageId
    ): never {
        AuthMiddleware::requireAdmin();

        $this->validateTourId($id);

        if ($imageId <= 0) {
            Response::error(
                'Invalid image ID.',
                422
            );
        }

        try {
            $this->ensureTourExists($id);

            $statement =
                $this->db->prepare("
                    DELETE FROM tour_images
                    WHERE id = :id
                      AND tour_id = :tour_id
                ");

            $statement->execute([
                ':id' => $imageId,
                ':tour_id' => $id,
            ]);

            if ($statement->rowCount() === 0) {
                Response::error(
                    'Tour image not found.',
                    404
                );
            }

            Response::success(
                [
                    'id' => $imageId,
                    'tour_id' => $id,
                ],
                'Tour image deleted successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin tour delete image database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to delete tour image at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin tour delete image application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to delete tour image at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | DELETE TOUR
    |--------------------------------------------------------------------------
    */

    public function destroy(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) {
            Response::error(
                'Invalid tour ID.',
                422
            );
        }

        try {
            $this->db->beginTransaction();

            /*
            |--------------------------------------------------------------------------
            | CHECK TOUR
            |--------------------------------------------------------------------------
            */

            $check =
                $this->db->prepare("
                    SELECT
                        id,
                        title
                    FROM tours
                    WHERE id = :id
                    FOR UPDATE
                ");

            $check->execute([
                ':id' => $id,
            ]);

            $tour =
                $check->fetch(
                    PDO::FETCH_ASSOC
                );

            if (!$tour) {
                $this->db->rollBack();

                Response::error(
                    'Tour not found.',
                    404
                );
            }


            /*
            |--------------------------------------------------------------------------
            | PROTECT TOURS WITH BOOKINGS
            |--------------------------------------------------------------------------
            */

            $bookingCheck =
                $this->db->prepare("
                    SELECT COUNT(*)
                    FROM booking_enquiries
                    WHERE tour_id = :tour_id
                ");

            $bookingCheck->execute([
                ':tour_id' => $id,
            ]);

            $bookingCount =
                (int) $bookingCheck->fetchColumn();

            if ($bookingCount > 0) {
                $this->db->rollBack();

                Response::error(
                    'This tour cannot be deleted because it has booking enquiries. Deactivate it instead.',
                    409
                );
            }


            /*
            |--------------------------------------------------------------------------
            | DELETE IMAGES
            |--------------------------------------------------------------------------
            */

            $deleteImages =
                $this->db->prepare("
                    DELETE FROM tour_images
                    WHERE tour_id = :tour_id
                ");

            $deleteImages->execute([
                ':tour_id' => $id,
            ]);


            /*
            |--------------------------------------------------------------------------
            | DELETE PRICES
            |--------------------------------------------------------------------------
            */

            $deletePrices =
                $this->db->prepare("
                    DELETE FROM tour_prices
                    WHERE tour_id = :tour_id
                ");

            $deletePrices->execute([
                ':tour_id' => $id,
            ]);


            /*
            |--------------------------------------------------------------------------
            | DELETE TOUR
            |--------------------------------------------------------------------------
            */

            $deleteTour =
                $this->db->prepare("
                    DELETE FROM tours
                    WHERE id = :id
                ");

            $deleteTour->execute([
                ':id' => $id,
            ]);

            $this->db->commit();

            Response::success(
                [
                    'id' => $id,
                ],
                'Tour deleted successfully.'
            );

        } catch (PDOException $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour delete database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to delete the tour at this time.',
                500
            );

        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin tour delete application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to delete the tour at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | PRIVATE HELPERS
    |--------------------------------------------------------------------------
    */

    private function validateTourId(int $id): void
    {
        if ($id <= 0) {
            Response::error(
                'Invalid tour ID.',
                422
            );
        }
    }


    private function ensureTourExists(int $id): void
    {
        $statement =
            $this->db->prepare("
                SELECT id
                FROM tours
                WHERE id = :id
                LIMIT 1
            ");

        $statement->execute([
            ':id' => $id,
        ]);

        if (!$statement->fetchColumn()) {
            Response::error(
                'Tour not found.',
                404
            );
        }
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
        if ($title === '') {
            Response::error(
                'Tour title is required.',
                422
            );
        }

        if (mb_strlen($title) > 200) {
            Response::error(
                'Tour title cannot exceed 200 characters.',
                422
            );
        }

        if ($slug === '') {
            Response::error(
                'Tour slug is required.',
                422
            );
        }

        if (mb_strlen($slug) > 220) {
            Response::error(
                'Tour slug cannot exceed 220 characters.',
                422
            );
        }

        if (
            !preg_match(
                '/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                $slug
            )
        ) {
            Response::error(
                'Tour slug may contain only lowercase letters, numbers, and hyphens.',
                422
            );
        }

        if (
            !is_int($categoryId) ||
            $categoryId <= 0
        ) {
            Response::error(
                'A valid category ID is required.',
                422
            );
        }

        if (
            !is_int($destinationId) ||
            $destinationId <= 0
        ) {
            Response::error(
                'A valid destination ID is required.',
                422
            );
        }

        if (
            mb_strlen($shortDescription) > 500
        ) {
            Response::error(
                'Short description cannot exceed 500 characters.',
                422
            );
        }

        if (
            mb_strlen($duration) > 100
        ) {
            Response::error(
                'Duration cannot exceed 100 characters.',
                422
            );
        }

        if (
            !in_array(
                $status,
                ['ACTIVE', 'INACTIVE'],
                true
            )
        ) {
            Response::error(
                'Tour status must be ACTIVE or INACTIVE.',
                422
            );
        }
    }


    private function validatePriceFields(
        string $pricingType,
        mixed $minPeople,
        mixed $maxPeople,
        mixed $price,
        string $currency
    ): void {
        if ($pricingType === '') {
            Response::error(
                'Pricing type is required.',
                422
            );
        }

        if (mb_strlen($pricingType) > 30) {
            Response::error(
                'Pricing type cannot exceed 30 characters.',
                422
            );
        }

        if (
            !is_int($minPeople) ||
            $minPeople < 1
        ) {
            Response::error(
                'Minimum people must be at least 1.',
                422
            );
        }

        if ($maxPeople !== null) {
            $maxPeople =
                filter_var(
                    $maxPeople,
                    FILTER_VALIDATE_INT
                );

            if (
                $maxPeople === false ||
                $maxPeople < $minPeople
            ) {
                Response::error(
                    'Maximum people must be greater than or equal to minimum people.',
                    422
                );
            }
        }

        if (
            $price === null ||
            $price === '' ||
            !is_numeric($price)
        ) {
            Response::error(
                'A valid price is required.',
                422
            );
        }

        if ((float) $price <= 0) {
            Response::error(
                'Price must be greater than zero.',
                422
            );
        }

        if (mb_strlen($currency) > 10) {
            Response::error(
                'Currency cannot exceed 10 characters.',
                422
            );
        }

        if ($currency === '') {
            Response::error(
                'Currency is required.',
                422
            );
        }
    }


    private function parseBoolean(
        mixed $value
    ): bool {
        if (is_bool($value)) {
            return $value;
        }

        if (
            is_int($value) ||
            is_float($value)
        ) {
            if ((int) $value === 1) {
                return true;
            }

            if ((int) $value === 0) {
                return false;
            }
        }

        if (is_string($value)) {
            $normalized =
                strtolower(
                    trim($value)
                );

            if (
                in_array(
                    $normalized,
                    ['true', '1', 'yes'],
                    true
                )
            ) {
                return true;
            }

            if (
                in_array(
                    $normalized,
                    ['false', '0', 'no'],
                    true
                )
            ) {
                return false;
            }
        }

        Response::error(
            'Boolean value is invalid.',
            422
        );
    }


    private function normalizePrice(
        ?array &$price
    ): void {
        if ($price === null) {
            return;
        }

        $price['id'] =
            (int) $price['id'];

        $price['tour_id'] =
            (int) $price['tour_id'];

        $price['min_people'] =
            (int) $price['min_people'];

        $price['max_people'] =
            $price['max_people'] !== null
                ? (int) $price['max_people']
                : null;

        $price['price'] =
            (float) $price['price'];
    }


    private function normalizePrices(
        array &$prices
    ): void {
        foreach (
            $prices as &$price
        ) {
            $this->normalizePrice(
                $price
            );
        }

        unset($price);
    }


    private function normalizeImage(
        ?array &$image
    ): void {
        if ($image === null) {
            return;
        }

        $image['id'] =
            (int) $image['id'];

        $image['tour_id'] =
            (int) $image['tour_id'];

        $image['is_primary'] =
            filter_var(
                $image['is_primary'],
                FILTER_VALIDATE_BOOLEAN
            );

        $image['sort_order'] =
            (int) $image['sort_order'];
    }


    private function normalizeImages(
        array &$images
    ): void {
        foreach (
            $images as &$image
        ) {
            $this->normalizeImage(
                $image
            );
        }

        unset($image);
    }
}