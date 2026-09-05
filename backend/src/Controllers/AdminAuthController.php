<?php

class AdminAuthController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }


    /**
     * POST /api/admin/login
     *
     * Authenticates an administrator and returns
     * a JWT access token.
     */
    public function login(): never
    {
        try {

            $data = Request::body();

            $username =
                isset($data['username'])
                    ? trim((string) $data['username'])
                    : '';

            $password =
                isset($data['password'])
                    ? (string) $data['password']
                    : '';


            /*
             * ------------------------------------------------------
             * Validate username
             * ------------------------------------------------------
             */

            if ($username === '') {

                Response::error(
                    'Username is required.',
                    422
                );
            }

            if (mb_strlen($username) > 100) {

                Response::error(
                    'Username is invalid.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Validate password
             * ------------------------------------------------------
             */

            if ($password === '') {

                Response::error(
                    'Password is required.',
                    422
                );
            }


            /*
             * ------------------------------------------------------
             * Find administrator
             * ------------------------------------------------------
             */

            $stmt = $this->db->prepare(
                "SELECT
                    id,
                    username,
                    full_name,
                    password_hash,
                    role

                 FROM users

                 WHERE username = :username

                 LIMIT 1"
            );

            $stmt->execute([
                'username' => $username
            ]);

            $user = $stmt->fetch();


            /*
             * Use the same public error whether the username
             * or password is incorrect.
             *
             * This prevents username enumeration.
             */
            if (
                $user === false ||
                !password_verify(
                    $password,
                    $user['password_hash']
                )
            ) {

                Response::error(
                    'Invalid username or password.',
                    401
                );
            }


            /*
             * ------------------------------------------------------
             * Verify administrator role
             * ------------------------------------------------------
             */

            if (
                strtoupper(
                    (string) $user['role']
                ) !== 'ADMIN'
            ) {

                Response::error(
                    'Administrator access is required.',
                    403
                );
            }


            /*
             * ------------------------------------------------------
             * Refresh password hash if PHP recommends it.
             * ------------------------------------------------------
             */

            if (
                password_needs_rehash(
                    $user['password_hash'],
                    PASSWORD_DEFAULT
                )
            ) {

                $newHash = password_hash(
                    $password,
                    PASSWORD_DEFAULT
                );

                $updateStmt = $this->db->prepare(
                    "UPDATE users
                     SET password_hash = :password_hash
                     WHERE id = :id"
                );

                $updateStmt->execute([
                    'password_hash' => $newHash,
                    'id' => $user['id']
                ]);
            }


            /*
             * ------------------------------------------------------
             * Create JWT payload
             * ------------------------------------------------------
             */

            $payload = [
                'sub' =>
                    (int) $user['id'],

                'username' =>
                    $user['username'],

                'full_name' =>
                    $user['full_name'],

                'role' =>
                    strtoupper(
                        (string) $user['role']
                    )
            ];


            /*
             * ------------------------------------------------------
             * Generate JWT
             * ------------------------------------------------------
             */

            $token = Jwt::encode(
                $payload,
                AuthConfig::jwtSecret(),
                AuthConfig::tokenLifetime()
            );


            /*
             * ------------------------------------------------------
             * Return authentication response
             * ------------------------------------------------------
             */

            Response::success(
                [
                    'token' =>
                        $token,

                    'token_type' =>
                        'Bearer',

                    'expires_in' =>
                        AuthConfig::tokenLifetime(),

                    'admin' => [
                        'id' =>
                            (int) $user['id'],

                        'username' =>
                            $user['username'],

                        'full_name' =>
                            $user['full_name'],

                        'role' =>
                            strtoupper(
                                (string) $user['role']
                            )
                    ]
                ],
                'Login successful.'
            );

        } catch (PDOException $e) {

            error_log(
                'Admin login database error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to process login at this time.',
                500
            );

        } catch (Throwable $e) {

            error_log(
                'Admin login application error: ' .
                $e->getMessage()
            );

            Response::error(
                'Unable to process login at this time.',
                500
            );
        }
    }


    /**
     * GET /api/admin/me
     *
     * Returns the currently authenticated administrator.
     */
    public function me(): never
    {
        $admin =
            AuthMiddleware::requireAdmin();

        Response::success(
            [
                'id' =>
                    (int) $admin['sub'],

                'username' =>
                    $admin['username'] ?? null,

                'full_name' =>
                    $admin['full_name'] ?? null,

                'role' =>
                    strtoupper(
                        (string) ($admin['role'] ?? '')
                    )
            ],
            'Authenticated administrator retrieved successfully.'
        );
    }
}