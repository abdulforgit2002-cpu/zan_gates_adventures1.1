<?php

// ===============================
// ENVIRONMENT CONFIGURATION
// ===============================

require_once __DIR__ . '/../src/Core/Env.php';

Env::load(
    dirname(__DIR__, 2) . '/.env'
);


// ===============================
// CLASS REQUIREMENTS
// ===============================

require_once __DIR__ . '/../src/Core/Database.php';
require_once __DIR__ . '/../src/Models/Tour.php';


// ===============================
// CORS CONFIGURATION
// ===============================
//
// CORS_ALLOWED_ORIGIN accepts a single value OR a comma-separated
// list. Both work:
//
//   https://zanzibargates.co.tz
//   https://zanzibargates.co.tz,https://www.zanzibargates.co.tz,http://localhost:5173
//
// CORS_ALLOWED_ORIGINS (plural) is also supported if you ever want
// to switch to it.
//

$allowedOriginsEnv =
    getenv('CORS_ALLOWED_ORIGINS')
    ?: getenv('CORS_ALLOWED_ORIGIN')
    ?: 'http://localhost:5173';

$allowedOrigins = array_values(array_filter(array_map(
    'trim',
    explode(',', $allowedOriginsEnv)
)));

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

// If no Origin header is sent (curl, Postman, same-origin), let it through.
// If the origin is on the allowlist, echo it back.
if ($requestOrigin === '' || in_array($requestOrigin, $allowedOrigins, true)) {
    if ($requestOrigin !== '') {
        header('Access-Control-Allow-Origin: ' . $requestOrigin);
    }
}

header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (getenv('CORS_ALLOW_CREDENTIALS') === '1' || getenv('CORS_ALLOW_CREDENTIALS') === 'true') {
    header('Access-Control-Allow-Credentials: true');
}

// Handle browser preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


// ===============================
// LOAD API ROUTES
// ===============================

require_once __DIR__ . '/../routes/api.php';