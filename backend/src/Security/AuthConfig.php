<?php

class AuthConfig
{
    /**
     * JWT lifetime:
     * 8 hours.
     */
    public static function tokenLifetime(): int
    {
        return 8 * 60 * 60;
    }


    /**
     * Retrieve the JWT signing secret.
     *
     * The secret MUST be supplied through the
     * environment.
     */
    public static function jwtSecret(): string
    {
        $secret = getenv('JWT_SECRET');

        if (
            $secret === false ||
            trim($secret) === ''
        ) {

            throw new RuntimeException(
                'JWT_SECRET environment variable is not configured.'
            );
        }

        if (strlen($secret) < 32) {

            throw new RuntimeException(
                'JWT_SECRET must contain at least 32 characters.'
            );
        }

        return $secret;
    }
}