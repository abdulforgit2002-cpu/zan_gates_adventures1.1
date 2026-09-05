<?php

/*
|--------------------------------------------------------------------------
| Core Classes
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../src/Core/Database.php';
require_once __DIR__ . '/../src/Core/Response.php';
require_once __DIR__ . '/../src/Core/Request.php';
require_once __DIR__ . '/../src/Core/Router.php';


/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../src/Security/Jwt.php';
require_once __DIR__ . '/../src/Security/AuthConfig.php';
require_once __DIR__ . '/../src/Security/AuthMiddleware.php';


/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../src/Controllers/CategoryController.php';
require_once __DIR__ . '/../src/Controllers/DestinationController.php';
require_once __DIR__ . '/../src/Controllers/TourController.php';
require_once __DIR__ . '/../src/Controllers/TourImageController.php';
require_once __DIR__ . '/../src/Controllers/BookingEnquiryController.php';
require_once __DIR__ . '/../src/Controllers/AdminAuthController.php';
require_once __DIR__ . '/../src/Controllers/AdminBookingController.php';
require_once __DIR__ . '/../src/Controllers/AdminDashboardController.php';


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

$database = new Database();

$db = $database->connect();


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

$router = new Router();


/*
|--------------------------------------------------------------------------
| Controller Instances
|--------------------------------------------------------------------------
*/

$categoryController =
    new CategoryController($db);

$destinationController =
    new DestinationController($db);

$tourController =
    new TourController($db);

$tourImageController =
    new TourImageController($db);

$bookingEnquiryController =
    new BookingEnquiryController($db);

$adminAuthController =
    new AdminAuthController($db);

$adminBookingController =
    new AdminBookingController($db);

$adminDashboardController =
    new AdminDashboardController($db);


/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
*/

/*
 * Get all categories.
 *
 * GET /api/categories
 */
$router->get(
    '/api/categories',
    [$categoryController, 'index']
);


/*
|--------------------------------------------------------------------------
| Destinations
|--------------------------------------------------------------------------
*/

/*
 * Get all destinations.
 *
 * GET /api/destinations
 */
$router->get(
    '/api/destinations',
    [$destinationController, 'index']
);


/*
|--------------------------------------------------------------------------
| Tours
|--------------------------------------------------------------------------
*/

/*
 * Get all active tours.
 *
 * GET /api/tours
 */
$router->get(
    '/api/tours',
    [$tourController, 'index']
);


/*
 * Get a single tour by slug.
 *
 * GET /api/tours/slug/{slug}
 *
 * Example:
 * /api/tours/slug/safari-blue-zanzibar
 */
$router->get(
    '/api/tours/slug/{slug}',
    [$tourController, 'showBySlug']
);


/*
 * Get a single tour by ID.
 *
 * GET /api/tours/{id}
 */
$router->get(
    '/api/tours/{id}',
    [$tourController, 'show']
);


/*
 * Get tour prices.
 *
 * GET /api/tours/{id}/prices
 */
$router->get(
    '/api/tours/{id}/prices',
    [$tourController, 'prices']
);


/*
|--------------------------------------------------------------------------
| Tour Images
|--------------------------------------------------------------------------
*/

/*
 * Get all active images for a tour.
 *
 * GET /api/tours/{id}/images
 */
$router->get(
    '/api/tours/{id}/images',
    [$tourImageController, 'index']
);


/*
|--------------------------------------------------------------------------
| Booking Enquiries
|--------------------------------------------------------------------------
*/

/*
 * Create a public booking enquiry.
 *
 * POST /api/booking-enquiries
 *
 * This endpoint is PUBLIC.
 *
 * The backend is responsible for:
 *
 * - validating customer information
 * - validating travel date
 * - validating adults and children
 * - verifying the tour
 * - reading the official tour price
 * - calculating the estimated total
 * - creating the enquiry
 * - setting status to PENDING
 */
$router->post(
    '/api/booking-enquiries',
    [$bookingEnquiryController, 'store']
);


/*
|--------------------------------------------------------------------------
| ADMIN AUTHENTICATION
|--------------------------------------------------------------------------
*/


/*
 * Admin login.
 *
 * PUBLIC endpoint.
 *
 * POST /api/admin/login
 *
 * Request example:
 *
 * {
 *     "username": "admin",
 *     "password": "Admin@12345"
 * }
 */
$router->post(
    '/api/admin/login',
    [$adminAuthController, 'login']
);

$router->get(
    '/api/admin/dashboard',
    [$adminDashboardController, 'index']
);


/*
 * Get currently authenticated administrator.
 *
 * PROTECTED endpoint.
 *
 * GET /api/admin/me
 *
 * Header:
 *
 * Authorization: Bearer YOUR_TOKEN
 */
$router->get(
    '/api/admin/me',
    [$adminAuthController, 'me']
);


/*
|--------------------------------------------------------------------------
| ADMIN BOOKING MANAGEMENT
|--------------------------------------------------------------------------
|
| All endpoints below are protected by
| AuthMiddleware::requireAdmin().
|
| The authentication check itself is performed
| inside AdminBookingController.
|
|--------------------------------------------------------------------------
*/


/*
 * Get paginated booking enquiries.
 *
 * PROTECTED endpoint.
 *
 * GET /api/admin/bookings
 *
 * Optional query parameters:
 *
 * page
 * per_page
 * status
 * search
 * tour_id
 * travel_date
 * date_from
 * date_to
 *
 * Examples:
 *
 * GET /api/admin/bookings
 *
 * GET /api/admin/bookings?page=1&per_page=10
 *
 * GET /api/admin/bookings?status=PENDING
 *
 * GET /api/admin/bookings?search=John
 *
 * GET /api/admin/bookings?tour_id=1
 *
 * GET /api/admin/bookings?travel_date=2026-09-20
 *
 * GET /api/admin/bookings?date_from=2026-09-01&date_to=2026-09-30
 *
 * Header:
 *
 * Authorization: Bearer YOUR_TOKEN
 */
$router->get(
    '/api/admin/bookings',
    [$adminBookingController, 'index']
);


/*
 * Get a single booking enquiry.
 *
 * PROTECTED endpoint.
 *
 * GET /api/admin/bookings/{id}
 *
 * Example:
 *
 * GET /api/admin/bookings/1
 *
 * Header:
 *
 * Authorization: Bearer YOUR_TOKEN
 */
$router->get(
    '/api/admin/bookings/{id}',
    [$adminBookingController, 'show']
);


/*
 * Update booking status.
 *
 * PROTECTED endpoint.
 *
 * PUT /api/admin/bookings/{id}/status
 *
 * Request example:
 *
 * {
 *     "status": "CONFIRMED"
 * }
 *
 * Allowed statuses:
 *
 * PENDING
 * CONFIRMED
 * CANCELLED
 * COMPLETED
 *
 * Header:
 *
 * Authorization: Bearer YOUR_TOKEN
 */
$router->put(
    '/api/admin/bookings/{id}/status',
    [$adminBookingController, 'updateStatus']
);


/*
|--------------------------------------------------------------------------
| DISPATCH REQUEST
|--------------------------------------------------------------------------
*/

$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);