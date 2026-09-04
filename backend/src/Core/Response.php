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

        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ]);

        exit;
    }
}