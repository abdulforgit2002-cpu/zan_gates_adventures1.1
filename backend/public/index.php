<?php

// ===============================
// CORS CONFIGURATION
// ===============================

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle browser preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ===============================
// LOAD API ROUTES
// ===============================

require_once __DIR__ . '/../routes/api.php';