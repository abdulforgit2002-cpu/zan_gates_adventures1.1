<?php

class CategoryController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function index(): never
    {
        try {

            $stmt = $this->db->query(
                'SELECT
                    id,
                    name,
                    slug,
                    description,
                    created_at
                 FROM categories
                 ORDER BY name'
            );

            Response::success(
                $stmt->fetchAll(),
                'Categories retrieved successfully.'
            );

        } catch (PDOException $e) {

            Response::error(
                'Failed to retrieve categories.',
                500,
                [
                    'error' => $e->getMessage()
                ]
            );
        }
    }
}