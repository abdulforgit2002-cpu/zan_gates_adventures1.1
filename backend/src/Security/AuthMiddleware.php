<?php

class AuthMiddleware
{
    /**
     * Require an authenticated administrator.
     *
     * Returns the decoded JWT payload when authentication
     * succeeds. Terminates the request with an appropriate
     * HTTP error response when authentication fails.
     */
    public static function requireAdmin(): array
    {
        /*
        |--------------------------------------------------------------------------
        | Read Authorization Header
        |--------------------------------------------------------------------------
        */

        $authorization =
            $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if ($authorization === '') {
            Response::error(
                'Authorization token is required.',
                401
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Validate Bearer Token Format
        |--------------------------------------------------------------------------
        */

        if (
            !preg_match(
                '/^Bearer\s+(.+)$/i',
                $authorization,
                $matches
            )
        ) {
            Response::error(
                'Invalid authorization header.',
                401
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Extract Token
        |--------------------------------------------------------------------------
        */

        $token = trim($matches[1]);

        if ($token === '') {
            Response::error(
                'Authentication token is required.',
                401
            );
        }


        /*
        |--------------------------------------------------------------------------
        | JWT Configuration
        |--------------------------------------------------------------------------
        |
        | Configuration errors are server-side problems and should
        | return HTTP 500.
        |
        */

        try {
            $secret = AuthConfig::jwtSecret();

        } catch (Throwable $e) {

            error_log(
                'JWT configuration error: ' .
                $e->getMessage()
            );

            Response::error(
                'Authentication service is not configured correctly.',
                500
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Decode and Verify JWT
        |--------------------------------------------------------------------------
        |
        | Jwt::decode() throws an exception when:
        |
        | - token format is invalid
        | - token encoding is invalid
        | - token payload is invalid
        | - algorithm is unsupported
        | - signature is invalid
        | - expiration is missing
        | - token has expired
        |
        | These are authentication failures and therefore return 401.
        |
        */

        try {

            $payload = Jwt::decode(
                $token,
                $secret
            );

        } catch (Throwable $e) {

            /*
             * Do not expose the internal JWT error to the client.
             */
            error_log(
                'JWT authentication failure: ' .
                $e->getMessage()
            );

            Response::error(
                'Invalid or expired authentication token.',
                401
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Validate Token Payload
        |--------------------------------------------------------------------------
        */

        if (!is_array($payload)) {
            Response::error(
                'Invalid authentication token.',
                401
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Validate Administrator Role
        |--------------------------------------------------------------------------
        */

        if (
            ($payload['role'] ?? null) !== 'ADMIN'
        ) {
            Response::error(
                'Administrator access required.',
                403
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Authentication Successful
        |--------------------------------------------------------------------------
        */

        return $payload;
    }
}