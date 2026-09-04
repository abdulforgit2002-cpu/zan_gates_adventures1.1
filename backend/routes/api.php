<?php

require_once __DIR__ . '/../src/Core/Database.php';
require_once __DIR__ . '/../src/Core/Response.php';
require_once __DIR__ . '/../src/Core/Request.php';
require_once __DIR__ . '/../src/Core/Router.php';

require_once __DIR__ . '/../src/Controllers/CategoryController.php';
require_once __DIR__ . '/../src/Controllers/DestinationController.php';
require_once __DIR__ . '/../src/Controllers/TourController.php';
require_once __DIR__ . '/../src/Controllers/TourImageController.php';

$database = new Database();

$db = $database->connect();

$router = new Router();

$categoryController =
    new CategoryController($db);

$destinationController =
    new DestinationController($db);

$tourController =
    new TourController($db);

$tourImageController =
    new TourImageController($db);


/*
|--------------------------------------------------------------------------
| Categories
|--------------------------------------------------------------------------
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

$router->get(
    '/api/destinations',
    [$destinationController, 'index']
);


/*
|--------------------------------------------------------------------------
| Tours
|--------------------------------------------------------------------------
*/

$router->get(
    '/api/tours',
    [$tourController, 'index']
);

$router->get(
    '/api/tours/slug/{slug}',
    [$tourController, 'showBySlug']
);

$router->get(
    '/api/tours/{id}',
    [$tourController, 'show']
);

$router->get(
    '/api/tours/{id}/prices',
    [$tourController, 'prices']
);

$router->get(
    '/api/tours/{id}/images',
    [$tourImageController, 'index']
);


/*
|--------------------------------------------------------------------------
| Dispatch
|--------------------------------------------------------------------------
*/

$router->dispatch(
    $_SERVER['REQUEST_METHOD'],
    $_SERVER['REQUEST_URI']
);