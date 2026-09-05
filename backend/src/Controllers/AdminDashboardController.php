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
        AuthMiddleware::requireAdmin();

        try {

            /*
            |--------------------------------------------------------------------------
            | Booking Statistics
            |--------------------------------------------------------------------------
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

            $stats = $statsStmt->fetch();


            /*
            |--------------------------------------------------------------------------
            | Estimated Booking Value
            |--------------------------------------------------------------------------
            |
            | Currently the system stores booking currency.
            | Therefore totals are grouped by currency rather
            | than incorrectly combining USD, EUR, etc.
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
                WHERE estimated_total IS NOT NULL
                GROUP BY currency
                ORDER BY currency ASC
                "
            );

            $financialSummary =
                $financialStmt->fetchAll();


            /*
            |--------------------------------------------------------------------------
            | Recent Bookings
            |--------------------------------------------------------------------------
            |
            | Latest 10 enquiries.
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
                $recentStmt->fetchAll();


            /*
            |--------------------------------------------------------------------------
            | Upcoming Bookings
            |--------------------------------------------------------------------------
            |
            | Exclude cancelled bookings.
            | Include today and future travel dates.
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
                    AND be.status <> 'CANCELLED'

                ORDER BY
                    be.travel_date ASC,
                    be.id ASC

                LIMIT 10
                "
            );

            $upcomingBookings =
                $upcomingStmt->fetchAll();


            /*
            |--------------------------------------------------------------------------
            | Tour Performance
            |--------------------------------------------------------------------------
            |
            | Shows how many bookings each tour has received.
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
                $tourStmt->fetchAll();


            /*
            |--------------------------------------------------------------------------
            | Normalize Numeric Values
            |--------------------------------------------------------------------------
            */

            $stats = [
                'total_bookings' =>
                    (int) ($stats['total_bookings'] ?? 0),

                'pending_bookings' =>
                    (int) ($stats['pending_bookings'] ?? 0),

                'confirmed_bookings' =>
                    (int) ($stats['confirmed_bookings'] ?? 0),

                'cancelled_bookings' =>
                    (int) ($stats['cancelled_bookings'] ?? 0),

                'completed_bookings' =>
                    (int) ($stats['completed_bookings'] ?? 0)
            ];


            foreach ($financialSummary as &$financial) {

                $financial['booking_count'] =
                    (int) $financial['booking_count'];

                $financial['estimated_total'] =
                    (float) $financial['estimated_total'];
            }

            unset($financial);


            foreach ($recentBookings as &$booking) {

                $booking['id'] =
                    (int) $booking['id'];

                $booking['tour_id'] =
                    (int) $booking['tour_id'];

                $booking['adults'] =
                    (int) $booking['adults'];

                $booking['children'] =
                    (int) $booking['children'];

                if (
                    $booking['estimated_total'] !== null
                ) {
                    $booking['estimated_total'] =
                        (float) $booking['estimated_total'];
                }
            }

            unset($booking);


            foreach ($upcomingBookings as &$booking) {

                $booking['id'] =
                    (int) $booking['id'];

                $booking['tour_id'] =
                    (int) $booking['tour_id'];

                $booking['adults'] =
                    (int) $booking['adults'];

                $booking['children'] =
                    (int) $booking['children'];

                if (
                    $booking['estimated_total'] !== null
                ) {
                    $booking['estimated_total'] =
                        (float) $booking['estimated_total'];
                }
            }

            unset($booking);


            foreach ($tourPerformance as &$tour) {

                $tour['id'] =
                    (int) $tour['id'];

                $tour['booking_count'] =
                    (int) $tour['booking_count'];

                $tour['pending_count'] =
                    (int) $tour['pending_count'];

                $tour['confirmed_count'] =
                    (int) $tour['confirmed_count'];

                $tour['cancelled_count'] =
                    (int) $tour['cancelled_count'];

                $tour['completed_count'] =
                    (int) $tour['completed_count'];
            }

            unset($tour);


            /*
            |--------------------------------------------------------------------------
            | Response
            |--------------------------------------------------------------------------
            */

            Response::success(
                [
                    'statistics' => $stats,

                    'financial_summary' =>
                        $financialSummary,

                    'recent_bookings' =>
                        $recentBookings,

                    'upcoming_bookings' =>
                        $upcomingBookings,

                    'tour_performance' =>
                        $tourPerformance
                ],
                'Dashboard data retrieved successfully.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin dashboard database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve dashboard data at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin dashboard application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to retrieve dashboard data at this time.',
                500
            );
        }
    }
}