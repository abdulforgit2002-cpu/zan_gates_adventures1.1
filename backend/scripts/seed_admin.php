<?php

/*
|--------------------------------------------------------------------------
| Seed First Admin Account
|--------------------------------------------------------------------------
|
| Run once per deploy, after migrations have applied
| (see .github/workflows/deploy.yml):
|
|   docker compose -f docker-compose.prod.yml run --rm backend \
|       php scripts/seed_admin.php
|
| Does nothing if the `users` table already has at least one row —
| safe to run on every deploy.
|
| Reads credentials from ADMIN_USERNAME / ADMIN_PASSWORD /
| ADMIN_FULL_NAME (see .env.prod.example). Refuses to run if the
| username/password are not configured.
|
*/

require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Database.php';

Env::load(dirname(__DIR__, 2) . '/.env');

$database = new Database();
$db = $database->connect();

$existingCount = (int) $db->query('SELECT COUNT(*) FROM users')->fetchColumn();

if ($existingCount > 0) {
    echo "Admin seed skipped: the users table is not empty." . PHP_EOL;
    exit(0);
}

$username = trim((string) (getenv('ADMIN_USERNAME') ?: ''));
$password = (string) (getenv('ADMIN_PASSWORD') ?: '');
$fullName = trim((string) (getenv('ADMIN_FULL_NAME') ?: '')) ?: 'Site Admin';

if ($username === '' || $password === '') {
    fwrite(
        STDERR,
        "ERROR: ADMIN_USERNAME / ADMIN_PASSWORD are not set — cannot create the first admin account." . PHP_EOL
    );
    exit(1);
}

if (strlen($password) < 8) {
    fwrite(STDERR, "ERROR: ADMIN_PASSWORD must be at least 8 characters." . PHP_EOL);
    exit(1);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$statement = $db->prepare(
    "INSERT INTO users (username, full_name, password_hash, role)
     VALUES (:username, :full_name, :password_hash, 'ADMIN')"
);

$statement->execute([
    'username' => $username,
    'full_name' => $fullName,
    'password_hash' => $passwordHash,
]);

echo "Admin account '{$username}' created successfully." . PHP_EOL;
