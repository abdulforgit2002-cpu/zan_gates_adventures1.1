<?php

// ===============================
// ENVIRONMENT CONFIGURATION
// ===============================

require_once __DIR__ . '/../src/Core/Env.php';

Env::load(
    dirname(__DIR__, 2) . '/.env'
);


// ===============================
// CORS CONFIGURATION
// ===============================

// Allow configuring CORS origin and credentials via environment variables.
$allowedOrigin = getenv('CORS_ALLOWED_ORIGIN') ?: 'http://localhost:5173';
header('Access-Control-Allow-Origin: ' . $allowedOrigin);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Optionally allow credentials when explicitly enabled (for HttpOnly cookie auth).
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
