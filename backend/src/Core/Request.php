<?php

class Request
{
    public static function body(): array
    {
        $input = file_get_contents('php://input');

        if (!$input) {
            return [];
        }

        $data = json_decode($input, true);

        if (!is_array($data)) {
            Response::error(
                'Invalid JSON request body.',
                400
            );
        }

        return $data;
    }
}