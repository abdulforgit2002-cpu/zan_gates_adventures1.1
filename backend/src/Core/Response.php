<?php

class Response
{
    public static function success(
        mixed $data = null,
        string $message = 'Success.',
        int $statusCode = 200
    ): never {

        http_response_code($statusCode);

        header('Content-Type: application/json');

        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);

        exit;
    }

    public static function error(
        string $message,
        int $statusCode = 400,
        mixed $errors = null
    ): never {

        http_response_code($statusCode);

        header('Content-Type: application/json');

        // Show full internal error messages only when APP_DEBUG is enabled
        $debug = getenv('APP_DEBUG') === '1' || getenv('APP_DEBUG') === 'true';

        // For server errors, avoid leaking internal messages unless debug is enabled
        $outputMessage = $message;

        if ($statusCode >= 500 && !$debug) {
            $outputMessage = 'Internal server error.';
        }

        echo json_encode([
            'success' => false,
            'message' => $outputMessage,
            'errors' => $errors
        ]);

        exit;
    }
}