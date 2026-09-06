<?php

class AdminDashboardController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    |
    | GET /api/admin/dashboard
    |
    | Protected administrator endpoint.
    |
    */

    public function index(): never
    {
        /*
        |--------------------------------------------------------------------------
        | REQUIRE ADMIN AUTHENTICATION
        |--------------------------------------------------------------------------
        */

        AuthMiddleware::requireAdmin();


        try {

            /*
            |--------------------------------------------------------------------------
            | BOOKING STATISTICS
            |--------------------------------------------------------------------------
            |
            | Counts all booking enquiries by status.
            |
            */

            $statsStmt = $this->db->query(
                "
                SELECT
                    COUNT(*) AS total_bookings,

                    COUNT(*) FILTER (
                        WHERE status = 'PENDING'
                    ) AS pending_bookings,

                    COUNT(*) FILTER (
                        WHERE status = 'CONFIRMED'
                    ) AS confirmed_bookings,

                    COUNT(*) FILTER (
                        WHERE status = 'CANCELLED'
                    ) AS cancelled_bookings,

                    COUNT(*) FILTER (
                        WHERE status = 'COMPLETED'
                    ) AS completed_bookings

                FROM booking_enquiries
                "
            );

            $stats = $statsStmt->fetch(
                PDO::FETCH_ASSOC
            );


            /*
            |--------------------------------------------------------------------------
            | FINANCIAL SUMMARY
            |--------------------------------------------------------------------------
            |
            | Cancelled bookings are excluded from estimated revenue.
            |
            | We do NOT combine currencies.
            |
            | Example:
            |
            | USD 1,500
            | EUR 800
            |
            | These remain separate.
            |
            */

            $financialStmt = $this->db->query(
                "
                SELECT
                    currency,

                    COUNT(*) AS booking_count,

                    COALESCE(
                        SUM(estimated_total),
                        0
                    ) AS estimated_total

                FROM booking_enquiries

                WHERE
                    estimated_total IS NOT NULL
                    AND status <> 'CANCELLED'

                GROUP BY
                    currency

                ORDER BY
                    currency ASC
                "
            );

            $financialSummary =
                $financialStmt->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | RECENT BOOKINGS
            |--------------------------------------------------------------------------
            |
            | Shows the latest 10 booking enquiries.
            |
            */

            $recentStmt = $this->db->query(
                "
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

                    be.status,

                    be.estimated_total,
                    be.currency,

                    be.created_at,
                    be.updated_at

                FROM booking_enquiries be

                INNER JOIN tours t
                    ON t.id = be.tour_id

                ORDER BY
                    be.created_at DESC,
                    be.id DESC

                LIMIT 10
                "
            );

            $recentBookings =
                $recentStmt->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | UPCOMING BOOKINGS
            |--------------------------------------------------------------------------
            |
            | Only active enquiries are shown:
            |
            | PENDING
            | CONFIRMED
            |
            | Cancelled and completed bookings are excluded.
            |
            */

            $upcomingStmt = $this->db->query(
                "
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

                    be.status,

                    be.estimated_total,
                    be.currency

                FROM booking_enquiries be

                INNER JOIN tours t
                    ON t.id = be.tour_id

                WHERE
                    be.travel_date >= CURRENT_DATE

                    AND be.status IN (
                        'PENDING',
                        'CONFIRMED'
                    )

                ORDER BY
                    be.travel_date ASC,
                    be.id ASC

                LIMIT 10
                "
            );

            $upcomingBookings =
                $upcomingStmt->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | TOUR PERFORMANCE
            |--------------------------------------------------------------------------
            |
            | Shows booking performance for every tour.
            |
            | LEFT JOIN ensures tours with zero bookings
            | are also included.
            |
            */

            $tourStmt = $this->db->query(
                "
                SELECT
                    t.id,
                    t.title,
                    t.slug,

                    COUNT(be.id) AS booking_count,

                    COUNT(be.id) FILTER (
                        WHERE be.status = 'PENDING'
                    ) AS pending_count,

                    COUNT(be.id) FILTER (
                        WHERE be.status = 'CONFIRMED'
                    ) AS confirmed_count,

                    COUNT(be.id) FILTER (
                        WHERE be.status = 'CANCELLED'
                    ) AS cancelled_count,

                    COUNT(be.id) FILTER (
                        WHERE be.status = 'COMPLETED'
                    ) AS completed_count

                FROM tours t

                LEFT JOIN booking_enquiries be
                    ON be.tour_id = t.id

                GROUP BY
                    t.id,
                    t.title,
                    t.slug

                ORDER BY
                    booking_count DESC,
                    t.title ASC

                LIMIT 10
                "
            );

            $tourPerformance =
                $tourStmt->fetchAll(
                    PDO::FETCH_ASSOC
                );


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE STATISTICS
            |--------------------------------------------------------------------------
            */

            $stats = [
                'total_bookings' =>
                    (int) (
                        $stats['total_bookings']
                        ?? 0
                    ),

                'pending_bookings' =>
                    (int) (
                        $stats['pending_bookings']
                        ?? 0
                    ),

                'confirmed_bookings' =>
                    (int) (
                        $stats['confirmed_bookings']
                        ?? 0
                    ),

                'cancelled_bookings' =>
                    (int) (
                        $stats['cancelled_bookings']
                        ?? 0
                    ),

                'completed_bookings' =>
                    (int) (
                        $stats['completed_bookings']
                        ?? 0
                    ),
            ];


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE FINANCIAL DATA
            |--------------------------------------------------------------------------
            */

            foreach ($financialSummary as &$financial) {

                $financial['booking_count'] =
                    (int) (
                        $financial['booking_count']
                        ?? 0
                    );

                $financial['estimated_total'] =
                    (float) (
                        $financial['estimated_total']
                        ?? 0
                    );
            }

            unset($financial);


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE RECENT BOOKINGS
            |--------------------------------------------------------------------------
            */

            foreach ($recentBookings as &$booking) {

                $booking['id'] =
                    (int) (
                        $booking['id']
                        ?? 0
                    );

                $booking['tour_id'] =
                    (int) (
                        $booking['tour_id']
                        ?? 0
                    );

                $booking['adults'] =
                    (int) (
                        $booking['adults']
                        ?? 0
                    );

                $booking['children'] =
                    (int) (
                        $booking['children']
                        ?? 0
                    );


                if (
                    $booking['estimated_total']
                    !== null
                ) {

                    $booking['estimated_total'] =
                        (float) $booking[
                            'estimated_total'
                        ];
                }
            }

            unset($booking);


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE UPCOMING BOOKINGS
            |--------------------------------------------------------------------------
            */

            foreach ($upcomingBookings as &$booking) {

                $booking['id'] =
                    (int) (
                        $booking['id']
                        ?? 0
                    );

                $booking['tour_id'] =
                    (int) (
                        $booking['tour_id']
                        ?? 0
                    );

                $booking['adults'] =
                    (int) (
                        $booking['adults']
                        ?? 0
                    );

                $booking['children'] =
                    (int) (
                        $booking['children']
                        ?? 0
                    );


                if (
                    $booking['estimated_total']
                    !== null
                ) {

                    $booking['estimated_total'] =
                        (float) $booking[
                            'estimated_total'
                        ];
                }
            }

            unset($booking);


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE TOUR PERFORMANCE
            |--------------------------------------------------------------------------
            */

            foreach ($tourPerformance as &$tour) {

                $tour['id'] =
                    (int) (
                        $tour['id']
                        ?? 0
                    );

                $tour['booking_count'] =
                    (int) (
                        $tour['booking_count']
                        ?? 0
                    );

                $tour['pending_count'] =
                    (int) (
                        $tour['pending_count']
                        ?? 0
                    );

                $tour['confirmed_count'] =
                    (int) (
                        $tour['confirmed_count']
                        ?? 0
                    );

                $tour['cancelled_count'] =
                    (int) (
                        $tour['cancelled_count']
                        ?? 0
                    );

                $tour['completed_count'] =
                    (int) (
                        $tour['completed_count']
                        ?? 0
                    );
            }

            unset($tour);


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            Response::success(
                [
                    'statistics' =>
                        $stats,

                    'financial_summary' =>
                        $financialSummary,

                    'recent_bookings' =>
                        $recentBookings,

                    'upcoming_bookings' =>
                        $upcomingBookings,

                    'tour_performance' =>
                        $tourPerformance,
                ],

                'Dashboard data retrieved successfully.'
            );

        } catch (PDOException $e) {

            /*
            |--------------------------------------------------------------------------
            | DATABASE ERROR
            |--------------------------------------------------------------------------
            */

            error_log(
                'Admin dashboard database error: '
                . $e->getMessage()
            );


            Response::error(
                'Unable to retrieve dashboard data at this time.',
                500
            );

        } catch (Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | APPLICATION ERROR
            |--------------------------------------------------------------------------
            */

            error_log(
                'Admin dashboard application error: '
                . $e->getMessage()
            );


            Response::error(
                'Unable to retrieve dashboard data at this time.',
                500
            );
        }
    }
}