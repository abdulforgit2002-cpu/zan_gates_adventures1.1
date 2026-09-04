<?php

class Database
{
    private string $host = 'localhost';
    private string $port = '5432';
    private string $database = 'zan_gates_db';
    private string $username = 'zan_gates_user';
    private string $password = 'ZanGates@2026';

    public function connect(): PDO
    {
        $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->database}";

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