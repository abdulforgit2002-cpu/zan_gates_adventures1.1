<?php

class AdminBookingController
{
    private PDO $db;

    /**
     * Allowed booking statuses.
     */
    private const ALLOWED_STATUSES = [
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
    ];

    /**
     * Valid booking status transitions.
     *
     * PENDING:
     *   -> CONFIRMED
     *   -> CANCELLED
     *
     * CONFIRMED:
     *   -> COMPLETED
     *   -> CANCELLED
     *
     * CANCELLED:
     *   -> no transition
     *
     * COMPLETED:
     *   -> no transition
     */
    private const STATUS_TRANSITIONS = [
        'PENDING' => [
            'CONFIRMED',
            'CANCELLED',
        ],

        'CONFIRMED' => [
            'COMPLETED',
            'CANCELLED',
        ],

        'CANCELLED' => [],

        'COMPLETED' => [],
    ];


    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    /*
    |--------------------------------------------------------------------------
    | List Bookings
    |--------------------------------------------------------------------------
    |
    | GET /api/admin/bookings
    |
    | Supported query parameters:
    |
    | page
    | per_page
    | status
    | search
    | tour_id
    | travel_date
    | date_from
    | date_to
    |
    */

    public function index(): never
    {
        AuthMiddleware::requireAdmin();

        try {

            /*
            |--------------------------------------------------------------------------
            | Pagination
            |--------------------------------------------------------------------------
            */

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


            $page = (
                $page !== false &&
                $page !== null &&
                $page >= 1
            )
                ? $page
                : 1;


            $perPage = (
                $perPage !== false &&
                $perPage !== null &&
                $perPage >= 1
            )
                ? $perPage
                : 10;


            /*
            |--------------------------------------------------------------------------
            | Protect API From Excessively Large Requests
            |--------------------------------------------------------------------------
            */

            $perPage = min(
                $perPage,
                100
            );


            $offset = ($page - 1) * $perPage;


            /*
            |--------------------------------------------------------------------------
            | Filters
            |--------------------------------------------------------------------------
            */

            $status = strtoupper(
                trim(
                    (string) (
                        $_GET['status'] ?? ''
                    )
                )
            );


            $search = trim(
                (string) (
                    $_GET['search'] ?? ''
                )
            );


            $tourId = filter_input(
                INPUT_GET,
                'tour_id',
                FILTER_VALIDATE_INT
            );


            $travelDate = trim(
                (string) (
                    $_GET['travel_date'] ?? ''
                )
            );


            $dateFrom = trim(
                (string) (
                    $_GET['date_from'] ?? ''
                )
            );


            $dateTo = trim(
                (string) (
                    $_GET['date_to'] ?? ''
                )
            );


            /*
            |--------------------------------------------------------------------------
            | Validate Status
            |--------------------------------------------------------------------------
            */

            if (
                $status !== '' &&
                !in_array(
                    $status,
                    self::ALLOWED_STATUSES,
                    true
                )
            ) {

                Response::error(
                    'Invalid booking status.',
                    422,
                    [
                        'allowed_statuses' =>
                            self::ALLOWED_STATUSES,
                    ]
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Validate Tour ID
            |--------------------------------------------------------------------------
            */

            if (
                $tourId !== false &&
                $tourId !== null &&
                $tourId < 1
            ) {

                Response::error(
                    'Invalid tour ID.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Validate Search
            |--------------------------------------------------------------------------
            */

            if (strlen($search) > 150) {

                Response::error(
                    'Search text is too long.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Validate Dates
            |--------------------------------------------------------------------------
            */

            if (
                $travelDate !== '' &&
                !$this->isValidDate($travelDate)
            ) {

                Response::error(
                    'Invalid travel_date. Expected YYYY-MM-DD.',
                    422
                );
            }


            if (
                $dateFrom !== '' &&
                !$this->isValidDate($dateFrom)
            ) {

                Response::error(
                    'Invalid date_from. Expected YYYY-MM-DD.',
                    422
                );
            }


            if (
                $dateTo !== '' &&
                !$this->isValidDate($dateTo)
            ) {

                Response::error(
                    'Invalid date_to. Expected YYYY-MM-DD.',
                    422
                );
            }


            if (
                $dateFrom !== '' &&
                $dateTo !== '' &&
                $dateFrom > $dateTo
            ) {

                Response::error(
                    'date_from cannot be later than date_to.',
                    422
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Build WHERE Conditions
            |--------------------------------------------------------------------------
            */

            $conditions = [];

            $params = [];


            /*
            |--------------------------------------------------------------------------
            | Status Filter
            |--------------------------------------------------------------------------
            */

            if ($status !== '') {

                $conditions[] =
                    'be.status = :status';

                $params['status'] =
                    $status;
            }


            /*
            |--------------------------------------------------------------------------
            | Search Filter
            |--------------------------------------------------------------------------
            */

            if ($search !== '') {

                $conditions[] = '
                    (
                        be.full_name ILIKE :search
                        OR be.email ILIKE :search
                        OR be.phone ILIKE :search
                        OR t.title ILIKE :search
                    )
                ';

                $params['search'] =
                    '%' . $search . '%';
            }


            /*
            |--------------------------------------------------------------------------
            | Tour Filter
            |--------------------------------------------------------------------------
            */

            if (
                $tourId !== false &&
                $tourId !== null
            ) {

                $conditions[] =
                    'be.tour_id = :tour_id';

                $params['tour_id'] =
                    $tourId;
            }


            /*
            |--------------------------------------------------------------------------
            | Exact Travel Date
            |--------------------------------------------------------------------------
            */

            if ($travelDate !== '') {

                $conditions[] =
                    'be.travel_date = :travel_date';

                $params['travel_date'] =
                    $travelDate;
            }


            /*
            |--------------------------------------------------------------------------
            | Date From
            |--------------------------------------------------------------------------
            */

            if ($dateFrom !== '') {

                $conditions[] =
                    'be.travel_date >= :date_from';

                $params['date_from'] =
                    $dateFrom;
            }


            /*
            |--------------------------------------------------------------------------
            | Date To
            |--------------------------------------------------------------------------
            */

            if ($dateTo !== '') {

                $conditions[] =
                    'be.travel_date <= :date_to';

                $params['date_to'] =
                    $dateTo;
            }


            /*
            |--------------------------------------------------------------------------
            | WHERE Clause
            |--------------------------------------------------------------------------
            */

            $where = '';

            if (!empty($conditions)) {

                $where =
                    'WHERE ' .
                    implode(
                        ' AND ',
                        $conditions
                    );
            }


            /*
            |--------------------------------------------------------------------------
            | Count Results
            |--------------------------------------------------------------------------
            */

            $countSql = "
                SELECT COUNT(*)
                FROM booking_enquiries be
                INNER JOIN tours t
                    ON t.id = be.tour_id
                {$where}
            ";


            $countStmt =
                $this->db->prepare(
                    $countSql
                );


            $countStmt->execute(
                $params
            );


            $total =
                (int) $countStmt->fetchColumn();


            /*
            |--------------------------------------------------------------------------
            | Pagination Metadata
            |--------------------------------------------------------------------------
            */

            $totalPages =
                $total > 0
                    ? (int) ceil(
                        $total / $perPage
                    )
                    : 0;


            /*
            |--------------------------------------------------------------------------
            | Prevent Page Beyond Available Results
            |--------------------------------------------------------------------------
            |
            | We don't silently change the requested page because the
            | frontend needs the actual pagination state.
            |
            */

            /*
            |--------------------------------------------------------------------------
            | Fetch Bookings
            |--------------------------------------------------------------------------
            */

            $sql = "
                SELECT
                    be.id,
                    be.tour_id,
                    t.title AS tour_title,
                    t.slug AS tour_slug,
                    be.travel_date,
                    be.adults,
                    be.children,
                    be.full_name,
                    be.email,
                    be.phone,
                    be.special_requirements,
                    be.status,
                    be.estimated_total,
                    be.currency,
                    be.created_at,
                    be.updated_at
                FROM booking_enquiries be
                INNER JOIN tours t
                    ON t.id = be.tour_id
                {$where}
                ORDER BY
                    be.created_at DESC,
                    be.id DESC
                LIMIT :limit
                OFFSET :offset
            ";


            $stmt =
                $this->db->prepare(
                    $sql
                );


            /*
            |--------------------------------------------------------------------------
            | Bind Dynamic Filter Parameters
            |--------------------------------------------------------------------------
            */

            foreach (
                $params as $key => $value
            ) {

                if (
                    $key === 'tour_id'
                ) {

                    $stmt->bindValue(
                        ':' . $key,
                        $value,
                        PDO::PARAM_INT
                    );

                } else {

                    $stmt->bindValue(
                        ':' . $key,
                        $value,
                        PDO::PARAM_STR
                    );
                }
            }


            /*
            |--------------------------------------------------------------------------
            | Bind Pagination Parameters
            |--------------------------------------------------------------------------
            */

            $stmt->bindValue(
                ':limit',
                $perPage,
                PDO::PARAM_INT
            );


            $stmt->bindValue(
                ':offset',
                $offset,
                PDO::PARAM_INT
            );


            $stmt->execute();


            $bookings =
                $stmt->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | Normalize Data
            |--------------------------------------------------------------------------
            */

            $bookings =
                $this->normalizeBookings(
                    $bookings
                );


            /*
            |--------------------------------------------------------------------------
            | Response
            |--------------------------------------------------------------------------
            */

            Response::success(
                [
                    'bookings' =>
                        $bookings,

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
                'Bookings retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin booking list database error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to retrieve bookings at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin booking list application error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to retrieve bookings at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Show Booking
    |--------------------------------------------------------------------------
    |
    | GET /api/admin/bookings/{id}
    |
    */

    public function show(int $id): never
    {
        AuthMiddleware::requireAdmin();


        if ($id < 1) {

            Response::error(
                'Invalid booking ID.',
                422
            );
        }


        try {

            $stmt =
                $this->db->prepare(
                    '
                    SELECT
                        be.id,
                        be.tour_id,
                        t.title AS tour_title,
                        t.slug AS tour_slug,
                        be.travel_date,
                        be.adults,
                        be.children,
                        be.full_name,
                        be.email,
                        be.phone,
                        be.special_requirements,
                        be.status,
                        be.estimated_total,
                        be.currency,
                        be.created_at,
                        be.updated_at
                    FROM booking_enquiries be
                    INNER JOIN tours t
                        ON t.id = be.tour_id
                    WHERE be.id = :id
                    LIMIT 1
                    '
                );


            $stmt->execute([
                'id' => $id,
            ]);


            $booking =
                $stmt->fetch(
                    PDO::FETCH_ASSOC
                );


            if (!$booking) {

                Response::error(
                    'Booking enquiry not found.',
                    404
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Normalize
            |--------------------------------------------------------------------------
            */

            $booking =
                $this->normalizeBooking(
                    $booking
                );


            /*
            |--------------------------------------------------------------------------
            | Response
            |--------------------------------------------------------------------------
            */

            Response::success(
                $booking,
                'Booking retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin booking detail database error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to retrieve booking at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin booking detail application error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to retrieve booking at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Update Booking Status
    |--------------------------------------------------------------------------
    |
    | PUT /api/admin/bookings/{id}/status
    |
    */

    public function updateStatus(int $id): never
    {
        AuthMiddleware::requireAdmin();


        /*
        |--------------------------------------------------------------------------
        | Validate Booking ID
        |--------------------------------------------------------------------------
        */

        if ($id < 1) {

            Response::error(
                'Invalid booking ID.',
                422
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Read Request Body
        |--------------------------------------------------------------------------
        */

        $data = Request::body();


        if (!is_array($data)) {

            Response::error(
                'Invalid request body.',
                422
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Read Requested Status
        |--------------------------------------------------------------------------
        */

        $status = strtoupper(
            trim(
                (string) (
                    $data['status'] ?? ''
                )
            )
        );


        /*
        |--------------------------------------------------------------------------
        | Validate Requested Status
        |--------------------------------------------------------------------------
        */

        if (
            !in_array(
                $status,
                self::ALLOWED_STATUSES,
                true
            )
        ) {

            Response::error(
                'Invalid booking status.',
                422,
                [
                    'allowed_statuses' =>
                        self::ALLOWED_STATUSES,
                ]
            );
        }


        try {

            /*
            |--------------------------------------------------------------------------
            | Begin Transaction
            |--------------------------------------------------------------------------
            */

            $this->db->beginTransaction();


            /*
            |--------------------------------------------------------------------------
            | Lock Current Booking
            |--------------------------------------------------------------------------
            */

            $findStmt =
                $this->db->prepare(
                    '
                    SELECT
                        id,
                        status
                    FROM booking_enquiries
                    WHERE id = :id
                    FOR UPDATE
                    '
                );


            $findStmt->execute([
                'id' => $id,
            ]);


            $booking =
                $findStmt->fetch(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | Booking Not Found
            |--------------------------------------------------------------------------
            */

            if (!$booking) {

                $this->db->rollBack();

                Response::error(
                    'Booking enquiry not found.',
                    404
                );
            }


            $currentStatus =
                strtoupper(
                    trim(
                        (string) (
                            $booking['status'] ?? ''
                        )
                    )
                );


            /*
            |--------------------------------------------------------------------------
            | Validate Current Database Status
            |--------------------------------------------------------------------------
            */

            if (
                !in_array(
                    $currentStatus,
                    self::ALLOWED_STATUSES,
                    true
                )
            ) {

                $this->db->rollBack();

                error_log(
                    'Invalid booking status found for booking #' .
                    $id .
                    ': ' .
                    $currentStatus
                );


                Response::error(
                    'This booking has an invalid status and cannot be updated.',
                    409
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Prevent No-Op Updates
            |--------------------------------------------------------------------------
            */

            if (
                $currentStatus === $status
            ) {

                $this->db->rollBack();

                Response::error(
                    'Booking is already ' .
                    $status .
                    '.',
                    409
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Validate Status Transition
            |--------------------------------------------------------------------------
            */

            $allowedTransitions =
                self::STATUS_TRANSITIONS[
                    $currentStatus
                ] ?? [];


            if (
                !in_array(
                    $status,
                    $allowedTransitions,
                    true
                )
            ) {

                $this->db->rollBack();

                Response::error(
                    sprintf(
                        'Invalid booking status transition: %s → %s.',
                        $currentStatus,
                        $status
                    ),
                    409,
                    [
                        'current_status' =>
                            $currentStatus,

                        'requested_status' =>
                            $status,

                        'allowed_next_statuses' =>
                            $allowedTransitions,
                    ]
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Update Status
            |--------------------------------------------------------------------------
            */

            $updateStmt =
                $this->db->prepare(
                    '
                    UPDATE booking_enquiries
                    SET
                        status = :status,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                    '
                );


            $updateStmt->execute([
                'status' => $status,
                'id' => $id,
            ]);


            /*
            |--------------------------------------------------------------------------
            | Verify Update
            |--------------------------------------------------------------------------
            */

            if (
                $updateStmt->rowCount() !== 1
            ) {

                $this->db->rollBack();

                Response::error(
                    'Booking status could not be updated.',
                    409
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Retrieve Updated Booking
            |--------------------------------------------------------------------------
            */

            $detailStmt =
                $this->db->prepare(
                    '
                    SELECT
                        be.id,
                        be.tour_id,
                        t.title AS tour_title,
                        t.slug AS tour_slug,
                        be.travel_date,
                        be.adults,
                        be.children,
                        be.full_name,
                        be.email,
                        be.phone,
                        be.special_requirements,
                        be.status,
                        be.estimated_total,
                        be.currency,
                        be.created_at,
                        be.updated_at
                    FROM booking_enquiries be
                    INNER JOIN tours t
                        ON t.id = be.tour_id
                    WHERE be.id = :id
                    LIMIT 1
                    '
                );


            $detailStmt->execute([
                'id' => $id,
            ]);


            $updatedBooking =
                $detailStmt->fetch(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | Defensive Verification
            |--------------------------------------------------------------------------
            */

            if (!$updatedBooking) {

                $this->db->rollBack();

                Response::error(
                    'Booking was updated but could not be retrieved.',
                    500
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Commit Transaction
            |--------------------------------------------------------------------------
            */

            $this->db->commit();


            /*
            |--------------------------------------------------------------------------
            | Normalize Updated Booking
            |--------------------------------------------------------------------------
            */

            $updatedBooking =
                $this->normalizeBooking(
                    $updatedBooking
                );


            /*
            |--------------------------------------------------------------------------
            | Response
            |--------------------------------------------------------------------------
            */

            Response::success(
                $updatedBooking,
                'Booking status updated successfully.'
            );

        } catch (PDOException $e) {

            if (
                $this->db->inTransaction()
            ) {

                $this->db->rollBack();
            }


            error_log(
                'Admin booking status database error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to update booking status at this time.',
                500
            );

        } catch (Throwable $e) {

            if (
                $this->db->inTransaction()
            ) {

                $this->db->rollBack();
            }


            error_log(
                'Admin booking status application error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to update booking status at this time.',
                500
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Normalize One Booking
    |--------------------------------------------------------------------------
    */

    private function normalizeBooking(
        array $booking
    ): array {

        if (isset($booking['id'])) {

            $booking['id'] =
                (int) $booking['id'];
        }


        if (isset($booking['tour_id'])) {

            $booking['tour_id'] =
                (int) $booking['tour_id'];
        }


        if (isset($booking['adults'])) {

            $booking['adults'] =
                (int) $booking['adults'];
        }


        if (isset($booking['children'])) {

            $booking['children'] =
                (int) $booking['children'];
        }


        if (
            isset(
                $booking['estimated_total']
            ) &&
            $booking['estimated_total'] !== null
        ) {

            $booking['estimated_total'] =
                (float) $booking['estimated_total'];
        }


        if (isset($booking['status'])) {

            $booking['status'] =
                strtoupper(
                    (string) $booking['status']
                );
        }


        return $booking;
    }


    /*
    |--------------------------------------------------------------------------
    | Normalize Multiple Bookings
    |--------------------------------------------------------------------------
    */

    private function normalizeBookings(
        array $bookings
    ): array {

        foreach (
            $bookings as &$booking
        ) {

            $booking =
                $this->normalizeBooking(
                    $booking
                );
        }

        unset($booking);


        return $bookings;
    }


    /*
    |--------------------------------------------------------------------------
    | Date Validation
    |--------------------------------------------------------------------------
    */

    private function isValidDate(
        string $date
    ): bool {

        $parsed =
            DateTime::createFromFormat(
                'Y-m-d',
                $date
            );


        if ($parsed === false) {

            return false;
        }


        $errors =
            DateTime::getLastErrors();


        /*
        |--------------------------------------------------------------------------
        | PHP Can Return false When There Are No Errors
        |--------------------------------------------------------------------------
        */

        if (
            $errors !== false &&
            (
                $errors['warning_count'] > 0 ||
                $errors['error_count'] > 0
            )
        ) {

            return false;
        }


        return
            $parsed->format('Y-m-d') ===
            $date;
    }
}