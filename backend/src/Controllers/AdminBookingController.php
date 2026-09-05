<?php

class AdminBookingController
{
    private PDO $db;

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

            $page = ($page !== false && $page !== null && $page >= 1)
                ? $page
                : 1;

            $perPage = ($perPage !== false && $perPage !== null)
                ? $perPage
                : 10;

            $perPage = max(1, min($perPage, 100));

            $offset = ($page - 1) * $perPage;


            /*
            |--------------------------------------------------------------------------
            | Filters
            |--------------------------------------------------------------------------
            */

            $status = strtoupper(
                trim((string) ($_GET['status'] ?? ''))
            );

            $search = trim(
                (string) ($_GET['search'] ?? '')
            );

            $tourId = filter_input(
                INPUT_GET,
                'tour_id',
                FILTER_VALIDATE_INT
            );

            $travelDate = trim(
                (string) ($_GET['travel_date'] ?? '')
            );

            $dateFrom = trim(
                (string) ($_GET['date_from'] ?? '')
            );

            $dateTo = trim(
                (string) ($_GET['date_to'] ?? '')
            );


            /*
            |--------------------------------------------------------------------------
            | Validate Status
            |--------------------------------------------------------------------------
            */

            $allowedStatuses = [
                'PENDING',
                'CONFIRMED',
                'CANCELLED',
                'COMPLETED'
            ];

            if (
                $status !== '' &&
                !in_array($status, $allowedStatuses, true)
            ) {

                Response::error(
                    'Invalid booking status.',
                    422,
                    [
                        'allowed_statuses' => $allowedStatuses
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


            if ($status !== '') {

                $conditions[] = 'be.status = :status';

                $params['status'] = $status;
            }


            if (
                $search !== ''
            ) {

                if (strlen($search) > 150) {

                    Response::error(
                        'Search text is too long.',
                        422
                    );
                }

                $conditions[] = '(
                    be.full_name ILIKE :search
                    OR be.email ILIKE :search
                    OR be.phone ILIKE :search
                    OR t.title ILIKE :search
                )';

                $params['search'] = '%' . $search . '%';
            }


            if (
                $tourId !== false &&
                $tourId !== null
            ) {

                $conditions[] = 'be.tour_id = :tour_id';

                $params['tour_id'] = $tourId;
            }


            if ($travelDate !== '') {

                $conditions[] = 'be.travel_date = :travel_date';

                $params['travel_date'] = $travelDate;
            }


            if ($dateFrom !== '') {

                $conditions[] = 'be.travel_date >= :date_from';

                $params['date_from'] = $dateFrom;
            }


            if ($dateTo !== '') {

                $conditions[] = 'be.travel_date <= :date_to';

                $params['date_to'] = $dateTo;
            }


            $where = '';

            if (!empty($conditions)) {

                $where = 'WHERE ' . implode(
                    ' AND ',
                    $conditions
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Count
            |--------------------------------------------------------------------------
            */

            $countSql = "
                SELECT COUNT(*)
                FROM booking_enquiries be
                INNER JOIN tours t
                    ON t.id = be.tour_id
                {$where}
            ";

            $countStmt = $this->db->prepare($countSql);

            $countStmt->execute($params);

            $total = (int) $countStmt->fetchColumn();


            /*
            |--------------------------------------------------------------------------
            | Calculate Pagination
            |--------------------------------------------------------------------------
            */

            $totalPages = $total > 0
                ? (int) ceil($total / $perPage)
                : 0;


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

            $stmt = $this->db->prepare($sql);

            foreach ($params as $key => $value) {

                $stmt->bindValue(
                    ':' . $key,
                    $value
                );
            }

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

            $bookings = $stmt->fetchAll();


            /*
            |--------------------------------------------------------------------------
            | Normalize Data
            |--------------------------------------------------------------------------
            */

            foreach ($bookings as &$booking) {

                $booking['id'] = (int) $booking['id'];

                $booking['tour_id'] = (int) $booking['tour_id'];

                $booking['adults'] = (int) $booking['adults'];

                $booking['children'] = (int) $booking['children'];

                if ($booking['estimated_total'] !== null) {

                    $booking['estimated_total'] =
                        (float) $booking['estimated_total'];
                }
            }

            unset($booking);


            /*
            |--------------------------------------------------------------------------
            | Response
            |--------------------------------------------------------------------------
            */

            Response::success(
                [
                    'bookings' => $bookings,

                    'pagination' => [
                        'page' => $page,
                        'per_page' => $perPage,
                        'total' => $total,
                        'total_pages' => $totalPages,
                        'has_next_page' =>
                            $page < $totalPages,
                        'has_previous_page' =>
                            $page > 1
                    ]
                ],
                'Bookings retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin booking list error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve bookings at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin booking application error: ' .
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

            $stmt = $this->db->prepare(
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
                'id' => $id
            ]);

            $booking = $stmt->fetch();

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

            $booking['id'] = (int) $booking['id'];

            $booking['tour_id'] = (int) $booking['tour_id'];

            $booking['adults'] = (int) $booking['adults'];

            $booking['children'] = (int) $booking['children'];

            if ($booking['estimated_total'] !== null) {

                $booking['estimated_total'] =
                    (float) $booking['estimated_total'];
            }


            Response::success(
                $booking,
                'Booking retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin booking detail error: ' .
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

        if ($id < 1) {

            Response::error(
                'Invalid booking ID.',
                422
            );
        }

        $data = Request::body();

        $status = strtoupper(
            trim((string) ($data['status'] ?? ''))
        );

        $allowedStatuses = [
            'PENDING',
            'CONFIRMED',
            'CANCELLED',
            'COMPLETED'
        ];

        if (
            !in_array(
                $status,
                $allowedStatuses,
                true
            )
        ) {

            Response::error(
                'Invalid booking status.',
                422,
                [
                    'allowed_statuses' => $allowedStatuses
                ]
            );
        }

        try {

            $this->db->beginTransaction();


            /*
            |--------------------------------------------------------------------------
            | Lock Booking
            |--------------------------------------------------------------------------
            */

            $findStmt = $this->db->prepare(
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
                'id' => $id
            ]);

            $booking = $findStmt->fetch();

            if (!$booking) {

                $this->db->rollBack();

                Response::error(
                    'Booking enquiry not found.',
                    404
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Update Status
            |--------------------------------------------------------------------------
            */

            $updateStmt = $this->db->prepare(
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
                'id' => $id
            ]);


            /*
            |--------------------------------------------------------------------------
            | Retrieve Updated Booking
            |--------------------------------------------------------------------------
            */

            $detailStmt = $this->db->prepare(
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
                'id' => $id
            ]);

            $updatedBooking = $detailStmt->fetch();


            $this->db->commit();


            /*
            |--------------------------------------------------------------------------
            | Normalize
            |--------------------------------------------------------------------------
            */

            $updatedBooking['id'] =
                (int) $updatedBooking['id'];

            $updatedBooking['tour_id'] =
                (int) $updatedBooking['tour_id'];

            $updatedBooking['adults'] =
                (int) $updatedBooking['adults'];

            $updatedBooking['children'] =
                (int) $updatedBooking['children'];

            if (
                $updatedBooking['estimated_total'] !== null
            ) {

                $updatedBooking['estimated_total'] =
                    (float) $updatedBooking['estimated_total'];
            }


            Response::success(
                $updatedBooking,
                'Booking status updated successfully.'
            );

        } catch (PDOException $e) {

            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            error_log(
                'Admin booking status error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to update booking status at this time.',
                500
            );

        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {
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
    | Date Validation
    |--------------------------------------------------------------------------
    */

    private function isValidDate(string $date): bool
    {
        $parsed = DateTime::createFromFormat(
            'Y-m-d',
            $date
        );

        return $parsed !== false &&
            $parsed->format('Y-m-d') === $date;
    }
}