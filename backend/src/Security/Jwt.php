<?php

class Jwt
{
    /**
     * Generate a JWT using HS256.
     *
     * @param array $payload
     * @param string $secret
     * @param int $ttlSeconds
     * @return string
     */
    public static function encode(
        array $payload,
        string $secret,
        int $ttlSeconds = 3600
    ): string {

        $issuedAt = time();

        $payload['iat'] = $issuedAt;
        $payload['exp'] = $issuedAt + $ttlSeconds;

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $encodedHeader = self::base64UrlEncode(
            json_encode($header, JSON_UNESCAPED_SLASHES)
        );

        $encodedPayload = self::base64UrlEncode(
            json_encode($payload, JSON_UNESCAPED_SLASHES)
        );

        $signature = hash_hmac(
            'sha256',
            $encodedHeader . '.' . $encodedPayload,
            $secret,
            true
        );

        $encodedSignature = self::base64UrlEncode(
            $signature
        );

        return
            $encodedHeader .
            '.' .
            $encodedPayload .
            '.' .
            $encodedSignature;
    }


    /**
     * Decode and verify a JWT.
     *
     * @return array
     */
    public static function decode(
        string $token,
        string $secret
    ): array {

        $parts = explode('.', $token);

        if (count($parts) !== 3) {

            throw new RuntimeException(
                'Invalid token format.'
            );
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] =
            $parts;

        $headerJson = self::base64UrlDecode(
            $encodedHeader
        );

        $payloadJson = self::base64UrlDecode(
            $encodedPayload
        );

        $signature = self::base64UrlDecode(
            $encodedSignature
        );

        if (
            $headerJson === false ||
            $payloadJson === false ||
            $signature === false
        ) {

            throw new RuntimeException(
                'Invalid token encoding.'
            );
        }

        $header = json_decode(
            $headerJson,
            true
        );

        $payload = json_decode(
            $payloadJson,
            true
        );

        if (
            !is_array($header) ||
            !is_array($payload)
        ) {

            throw new RuntimeException(
                'Invalid token payload.'
            );
        }

        if (
            ($header['alg'] ?? null) !== 'HS256'
        ) {

            throw new RuntimeException(
                'Unsupported token algorithm.'
            );
        }

        $expectedSignature = hash_hmac(
            'sha256',
            $encodedHeader . '.' . $encodedPayload,
            $secret,
            true
        );

        if (
            !hash_equals(
                $expectedSignature,
                $signature
            )
        ) {

            throw new RuntimeException(
                'Invalid token signature.'
            );
        }

        if (
            !isset($payload['exp']) ||
            !is_numeric($payload['exp'])
        ) {

            throw new RuntimeException(
                'Token expiration is missing.'
            );
        }

        if (
            (int) $payload['exp'] <= time()
        ) {

            throw new RuntimeException(
                'Token has expired.'
            );
        }

        return $payload;
    }


    /**
     * Base64 URL-safe encoding.
     */
    private static function base64UrlEncode(
        string $data
    ): string {

        return rtrim(
            strtr(
                base64_encode($data),
                '+/',
                '-_'
            ),
            '='
        );
    }


    /**
     * Base64 URL-safe decoding.
     */
    private static function base64UrlDecode(
        string $data
    ): string|false {

        $padding =
            strlen($data) % 4;

        if ($padding !== 0) {

            $data .= str_repeat(
                '=',
                4 - $padding
            );
        }

        return base64_decode(
            strtr(
                $data,
                '-_',
                '+/'
            ),
            true
        );
    }
}