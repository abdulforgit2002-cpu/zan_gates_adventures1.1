<?php

class Database
{
    private string $host;
    private string $port;
    private string $database;
    private string $username;
    private string $password;

    public function __construct()
    {
        $this->host =
            getenv('DB_HOST') !== false
                ? getenv('DB_HOST')
                : 'localhost';

        $this->port =
            getenv('DB_PORT') !== false
                ? getenv('DB_PORT')
                : '5432';

        $this->database =
            getenv('DB_NAME') !== false
                ? getenv('DB_NAME')
                : '';

        $this->username =
            getenv('DB_USER') !== false
                ? getenv('DB_USER')
                : '';

        $password = getenv('DB_PASSWORD');

        if (
            $password === false ||
            trim($password) === ''
        ) {
            throw new RuntimeException(
                'DB_PASSWORD environment variable is not configured.'
            );
        }

        $this->password = $password;
    }

    public function connect(): PDO
    {
        if ($this->database === '') {
            throw new RuntimeException(
                'DB_NAME environment variable is not configured.'
            );
        }

        if ($this->username === '') {
            throw new RuntimeException(
                'DB_USER environment variable is not configured.'
            );
        }

        $dsn =
            "pgsql:host={$this->host};" .
            "port={$this->port};" .
            "dbname={$this->database}";

        $pdo = new PDO(
            $dsn,
            $this->username,
            $this->password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );

        return $pdo;
    }
}
