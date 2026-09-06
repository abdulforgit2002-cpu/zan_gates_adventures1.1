<?php

class BookingEnquiryController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * POST /api/booking-enquiries
     *
     * Creates a new tour booking enquiry.
     *
     * Important:
     * - The frontend does NOT submit the final price.
     * - The backend retrieves the official price from PostgreSQL.
     * - The backend selects the correct pricing tier.
     * - The backend calculates the estimated total.
     * - New enquiries are always created as PENDING.
     *
     * Current pricing model:
     * - PER_PERSON
     * - Pricing tier is determined by the number of adults.
     * - Children are recorded but are not automatically charged
     *   because no separate child pricing model currently exists.
     */
    public function store(): never
    {
        try {

            /*
             * ------------------------------------------------------
             * Read request body
             * ------------------------------------------------------
             */

            $data = Request::body();


            /*
             * ------------------------------------------------------
             * Retrieve submitted values
             * ------------------------------------------------------
             */

            $tourId = $data['tour_id'] ?? null;

            $travelDate =
                isset($data['travel_date'])
                    ? trim((string) $data['travel_date'])
                    : '';

            $adults =
                isset($data['adults'])
                    ? $data['adults']
                    : 1;

            $children =
                isset($data['children'])
                    ? $data['children']
                    : 0;

            $fullName =
                isset($data['full_name'])
                    ? trim((string) $data['full_name'])
                    : '';

            $email =
                isset($data['email'])
                    ? trim((string) $data['email'])
                    : '';

            $phone =
                isset($data['phone'])
                    ? trim((string) $data['phone'])
                    : '';

            $specialRequirements =
                isset($data['special_requirements'])
                    ? trim((string) $data['special_requirements'])
                    : '';


            /*
             * ------------------------------------------------------
             * Basic validation
             * ------------------------------------------------------
             */

            if (
                $tourId === null ||
                filter_var(
                    $tourId,
                    FILTER_VALIDATE_INT
                ) === false ||
                (int) $tourId < 1
            ) {

                Response::error(
                    'A valid tour is required.',
                    422
                );
            }

            $tourId = (int) $tourId;


            /*
             * ------------------------------------------------------
             * Adults validation
             * ------------------------------------------------------
             */

            if (
                filter_var(
                    $adults,
                    FILTER_VALIDATE_INT
                ) === false
            ) {

                Response::error(
                    'Adults must be a valid number.',
                    422
                );
            }

            $adults = (int) $adults;


            if ($adults < 1) {

                Response::error(
                    'At least one adult is required.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Children validation
             * ------------------------------------------------------
             */

            if (
                filter_var(
                    $children,
                    FILTER_VALIDATE_INT
                ) === false
            ) {

                Response::error(
                    'Children must be a valid number.',
                    422
                );
            }

            $children = (int) $children;


            if ($children < 0) {

                Response::error(
                    'Children cannot be negative.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Full name validation
             * ------------------------------------------------------
             */

            if ($fullName === '') {

                Response::error(
                    'Full name is required.',
                    422
                );
            }


            if (mb_strlen($fullName) > 150) {

                Response::error(
                    'Full name must not exceed 150 characters.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Email validation
             * ------------------------------------------------------
             */

            if ($email === '') {

                Response::error(
                    'Email address is required.',
                    422
                );
            }


            if (
                !filter_var(
                    $email,
                    FILTER_VALIDATE_EMAIL
                )
            ) {

                Response::error(
                    'Please provide a valid email address.',
                    422
                );
            }


            if (mb_strlen($email) > 180) {

                Response::error(
                    'Email address must not exceed 180 characters.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Phone validation
             * ------------------------------------------------------
             */

            if ($phone === '') {

                Response::error(
                    'Phone / WhatsApp number is required.',
                    422
                );
            }


            if (mb_strlen($phone) > 40) {

                Response::error(
                    'Phone number must not exceed 40 characters.',
                    422
                );
            }


            /*
             * Basic phone format validation.
             *
             * Allows:
             * +255700000000
             * 255700000000
             * 0700000000
             * spaces
             * hyphens
             * parentheses
             */

            if (
                !preg_match(
                    '/^[0-9+\-\s()]{7,40}$/',
                    $phone
                )
            ) {

                Response::error(
                    'Please provide a valid phone / WhatsApp number.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Special requirements validation
             * ------------------------------------------------------
             *
             * This field is optional.
             */

            if (mb_strlen($specialRequirements) > 5000) {

                Response::error(
                    'Special requirements must not exceed 5000 characters.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Travel date validation
             * ------------------------------------------------------
             */

            if ($travelDate === '') {

                Response::error(
                    'Travel date is required.',
                    422
                );
            }


            $dateObject =
                DateTime::createFromFormat(
                    'Y-m-d',
                    $travelDate
                );


            $dateErrors =
                DateTime::getLastErrors();


            if (
                $dateObject === false ||
                (
                    $dateErrors !== false &&
                    (
                        $dateErrors['warning_count'] > 0 ||
                        $dateErrors['error_count'] > 0
                    )
                ) ||
                $dateObject->format('Y-m-d') !== $travelDate
            ) {

                Response::error(
                    'Please provide a valid travel date.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Do not allow past dates
             * ------------------------------------------------------
             *
             * PostgreSQL is used as the authoritative current date.
             */

            $todayStmt = $this->db->query(
                "SELECT CURRENT_DATE AS today"
            );

            $today =
                $todayStmt->fetch()['today'];


            if ($travelDate < $today) {

                Response::error(
                    'Travel date cannot be in the past.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Start database transaction
             * ------------------------------------------------------
             */

            $this->db->beginTransaction();


            /*
             * ------------------------------------------------------
             * Verify tour
             * ------------------------------------------------------
             */

            $tourStmt = $this->db->prepare(
                "SELECT
                    id,
                    title,
                    status

                 FROM tours

                 WHERE id = :tour_id

                 AND status = 'ACTIVE'

                 LIMIT 1

                 FOR SHARE"
            );

            $tourStmt->execute([
                'tour_id' => $tourId
            ]);


            $tour = $tourStmt->fetch();


            if ($tour === false) {

                $this->db->rollBack();

                Response::error(
                    'Tour not found or is currently unavailable.',
                    404
                );
            }


            /*
             * ------------------------------------------------------
             * Retrieve official pricing
             * ------------------------------------------------------
             *
             * Current Zan Gates pricing model:
             *
             * PER_PERSON
             *
             * The applicable pricing tier is selected according
             * to the number of adults.
             *
             * Example:
             *
             * 1–4 adults
             *     → $120 per adult
             *
             * 5–10 adults
             *     → $100 per adult
             *
             * Children are recorded but are not automatically
             * charged because no separate child pricing model
             * currently exists.
             *
             * IMPORTANT:
             *
             * Do NOT select the cheapest price.
             *
             * The selected price must match the customer's
             * applicable adult pricing tier.
             */

            $priceStmt = $this->db->prepare(
                "SELECT
                    id,
                    pricing_type,
                    min_people,
                    max_people,
                    price,
                    currency

                 FROM tour_prices

                 WHERE tour_id = :tour_id

                 AND pricing_type = 'PER_PERSON'

                 AND min_people <= :adults

                 AND (
                    max_people IS NULL
                    OR max_people >= :adults
                 )

                 ORDER BY
                    min_people DESC

                 LIMIT 1

                 FOR SHARE"
            );

            $priceStmt->execute([
                'tour_id' => $tourId,
                'adults' => $adults
            ]);


            $price = $priceStmt->fetch();


            if ($price === false) {

                $this->db->rollBack();

                Response::error(
                    'Pricing is currently unavailable for this tour and group size.',
                    409
                );
            }


            /*
             * ------------------------------------------------------
             * Calculate estimated total
             * ------------------------------------------------------
             */

            $unitPrice =
                (float) $price['price'];

            $currency =
                $price['currency'] ?: 'USD';

            $pricingType =
                $price['pricing_type'];


            /*
             * Price must be greater than zero.
             *
             * A zero price should not normally be accepted
             * for a configured paid tour.
             */

            if ($unitPrice <= 0) {

                $this->db->rollBack();

                Response::error(
                    'Invalid tour pricing configuration.',
                    500
                );
            }


            /*
             * ------------------------------------------------------
             * Current supported pricing
             * ------------------------------------------------------
             *
             * PER_PERSON
             *
             * Adults are charged.
             * Children are recorded but currently have no
             * automatic charge.
             */

            if ($pricingType === 'PER_PERSON') {

                $estimatedTotal =
                    $adults * $unitPrice;

            } else {

                /*
                 * Group pricing is not yet part of the current
                 * booking calculation model.
                 */

                $this->db->rollBack();

                Response::error(
                    'This tour uses a pricing model that is not yet supported for online enquiries.',
                    409
                );
            }


            /*
             * ------------------------------------------------------
             * Round monetary value
             * ------------------------------------------------------
             */

            $estimatedTotal =
                round($estimatedTotal, 2);


            /*
             * ------------------------------------------------------
             * Insert enquiry
             * ------------------------------------------------------
             *
             * Do NOT accept:
             *
             * - status
             * - estimated_total
             * - currency
             *
             * from the frontend.
             *
             * These values are controlled by the backend.
             */

            $insertStmt = $this->db->prepare(
                "INSERT INTO booking_enquiries (
                    tour_id,
                    travel_date,
                    adults,
                    children,
                    full_name,
                    email,
                    phone,
                    special_requirements,
                    status,
                    estimated_total,
                    currency,
                    created_at,
                    updated_at
                )

                VALUES (
                    :tour_id,
                    :travel_date,
                    :adults,
                    :children,
                    :full_name,
                    :email,
                    :phone,
                    :special_requirements,
                    'PENDING',
                    :estimated_total,
                    :currency,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )

                RETURNING
                    id,
                    tour_id,
                    travel_date,
                    adults,
                    children,
                    full_name,
                    email,
                    phone,
                    special_requirements,
                    status,
                    estimated_total,
                    currency,
                    created_at"
            );


            $insertStmt->execute([
                'tour_id' =>
                    $tourId,

                'travel_date' =>
                    $travelDate,

                'adults' =>
                    $adults,

                'children' =>
                    $children,

                'full_name' =>
                    $fullName,

                'email' =>
                    $email,

                'phone' =>
                    $phone,

                'special_requirements' =>
                    $specialRequirements !== ''
                        ? $specialRequirements
                        : null,

                'estimated_total' =>
                    $estimatedTotal,

                'currency' =>
                    $currency
            ]);


            $booking =
                $insertStmt->fetch();


            /*
             * ------------------------------------------------------
             * Commit transaction
             * ------------------------------------------------------
             */

            $this->db->commit();


            /*
             * ------------------------------------------------------
             * Normalize database values
             * ------------------------------------------------------
             */

            $booking['id'] =
                (int) $booking['id'];

            $booking['tour_id'] =
                (int) $booking['tour_id'];

            $booking['adults'] =
                (int) $booking['adults'];

            $booking['children'] =
                (int) $booking['children'];

            $booking['estimated_total'] =
                (float) $booking['estimated_total'];


            /*
             * ------------------------------------------------------
             * Return public response
             * ------------------------------------------------------
             */

            Response::success(
                [
                    'id' =>
                        $booking['id'],

                    'tour_id' =>
                        $booking['tour_id'],

                    'tour' =>
                        $tour['title'],

                    'travel_date' =>
                        $booking['travel_date'],

                    'adults' =>
                        $booking['adults'],

                    'children' =>
                        $booking['children'],

                    'estimated_total' =>
                        $booking['estimated_total'],

                    'currency' =>
                        $booking['currency'],

                    'status' =>
                        $booking['status']
                ],
                'Your enquiry has been submitted successfully.',
                201
            );

        } catch (PDOException $e) {

            /*
             * ------------------------------------------------------
             * Roll back transaction if necessary.
             * ------------------------------------------------------
             */

            if ($this->db->inTransaction()) {

                $this->db->rollBack();
            }


            /*
             * Never expose database internals to the customer.
             */

            error_log(
                'Booking enquiry database error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to submit your enquiry at this time. Please try again.',
                500
            );

        } catch (Throwable $e) {

            if ($this->db->inTransaction()) {

                $this->db->rollBack();
            }


            error_log(
                'Booking enquiry application error: ' .
                $e->getMessage()
            );


            Response::error(
                'Unable to submit your enquiry at this time. Please try again.',
                500
            );
        }
    }
}