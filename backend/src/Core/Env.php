<?php

class Env
{
    /**
     * Load simple KEY=VALUE pairs from the project .env file.
     *
     * Existing system environment variables are never overwritten.
     */
    public static function load(string $file): void
    {
        if (!is_file($file)) {
            return;
        }

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($lines === false) {
            throw new RuntimeException(
                'Unable to read environment configuration file.'
            );
        }

        foreach ($lines as $line) {
            $line = trim($line);

            // Ignore comments.
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            // Ignore malformed lines.
            if (!str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);

            $key = trim($key);
            $value = trim($value);

            // Only allow valid environment variable names.
            if (
                $key === '' ||
                !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $key)
            ) {
                continue;
            }

            // Remove matching surrounding quotes.
            if (
                strlen($value) >= 2 &&
                (
                    ($value[0] === '"' && $value[strlen($value) - 1] === '"') ||
                    ($value[0] === "'" && $value[strlen($value) - 1] === "'")
                )
            ) {
                $value = substr($value, 1, -1);
            }

            // Do not overwrite variables supplied by the real environment.
            if (getenv($key) !== false) {
                continue;
            }

            putenv($key . '=' . $value);
        }
    }
}
