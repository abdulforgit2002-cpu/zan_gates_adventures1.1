<?php

class AdminDestinationController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * GET /api/admin/destinations
     */
    public function index(): never
    {
        AuthMiddleware::requireAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT
                    id, name, slug, description, created_at, updated_at,
                    (SELECT COUNT(*) FROM tours WHERE tours.destination_id = destinations.id) AS tour_count
                 FROM destinations
                 ORDER BY name"
            );

            $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($destinations as &$destination) {
                $destination['id'] = (int) $destination['id'];
                $destination['tour_count'] = (int) $destination['tour_count'];
            }
            unset($destination);

            Response::success($destinations, 'Destinations retrieved successfully.');

        } catch (PDOException $e) {
            error_log('Admin destination index database error: ' . $e->getMessage());
            Response::error('Unable to retrieve destinations at this time.', 500);
        }
    }

    /**
     * POST /api/admin/destinations
     */
    public function store(): never
    {
        AuthMiddleware::requireAdmin();

        try {
            $body = Request::body();

            $name = trim((string) ($body['name'] ?? ''));
            $slug = trim((string) ($body['slug'] ?? ''));
            $description = trim((string) ($body['description'] ?? ''));

            $this->validateFields($name, $slug, $description);

            $slugCheck = $this->db->prepare("SELECT id FROM destinations WHERE slug = :slug LIMIT 1");
            $slugCheck->execute([':slug' => $slug]);

            if ($slugCheck->fetchColumn()) {
                Response::error('A destination with this slug already exists.', 409);
            }

            $statement = $this->db->prepare(
                "INSERT INTO destinations (name, slug, description)
                 VALUES (:name, :slug, :description)
                 RETURNING id, name, slug, description, created_at, updated_at"
            );

            $statement->bindValue(':name', $name);
            $statement->bindValue(':slug', $slug);
            $statement->bindValue(':description', $description !== '' ? $description : null,
                $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->execute();

            $destination = $statement->fetch(PDO::FETCH_ASSOC);
            $destination['id'] = (int) $destination['id'];
            $destination['tour_count'] = 0;

            Response::success($destination, 'Destination created successfully.', 201);

        } catch (PDOException $e) {
            error_log('Admin destination store database error: ' . $e->getMessage());
            Response::error('Unable to create the destination at this time.', 500);
        }
    }

    /**
     * PUT /api/admin/destinations/{id}
     */
    public function update(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) Response::error('Invalid destination ID.', 422);

        try {
            $body = Request::body();

            $name = trim((string) ($body['name'] ?? ''));
            $slug = trim((string) ($body['slug'] ?? ''));
            $description = trim((string) ($body['description'] ?? ''));

            $this->validateFields($name, $slug, $description);

            $destinationCheck = $this->db->prepare("SELECT id FROM destinations WHERE id = :id LIMIT 1");
            $destinationCheck->execute([':id' => $id]);

            if (!$destinationCheck->fetchColumn()) Response::error('Destination not found.', 404);

            $slugCheck = $this->db->prepare("SELECT id FROM destinations WHERE slug = :slug AND id <> :id LIMIT 1");
            $slugCheck->execute([':slug' => $slug, ':id' => $id]);

            if ($slugCheck->fetchColumn()) Response::error('A destination with this slug already exists.', 409);

            $statement = $this->db->prepare(
                "UPDATE destinations
                 SET name = :name, slug = :slug, description = :description, updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id
                 RETURNING id, name, slug, description, created_at, updated_at"
            );

            $statement->bindValue(':name', $name);
            $statement->bindValue(':slug', $slug);
            $statement->bindValue(':description', $description !== '' ? $description : null,
                $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->bindValue(':id', $id, PDO::PARAM_INT);
            $statement->execute();

            $destination = $statement->fetch(PDO::FETCH_ASSOC);
            $destination['id'] = (int) $destination['id'];

            Response::success($destination, 'Destination updated successfully.');

        } catch (PDOException $e) {
            error_log('Admin destination update database error: ' . $e->getMessage());
            Response::error('Unable to update the destination at this time.', 500);
        }
    }

    /**
     * DELETE /api/admin/destinations/{id}
     */
    public function destroy(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) Response::error('Invalid destination ID.', 422);

        try {
            $check = $this->db->prepare("SELECT id FROM destinations WHERE id = :id LIMIT 1");
            $check->execute([':id' => $id]);

            if (!$check->fetchColumn()) Response::error('Destination not found.', 404);

            $tourCheck = $this->db->prepare("SELECT COUNT(*) FROM tours WHERE destination_id = :id");
            $tourCheck->execute([':id' => $id]);

            if ((int) $tourCheck->fetchColumn() > 0) {
                Response::error(
                    'This destination cannot be deleted because it is used by existing tours.',
                    409
                );
            }

            $this->db->prepare("DELETE FROM destinations WHERE id = :id")->execute([':id' => $id]);

            Response::success(['id' => $id], 'Destination deleted successfully.');

        } catch (PDOException $e) {
            error_log('Admin destination delete database error: ' . $e->getMessage());
            Response::error('Unable to delete the destination at this time.', 500);
        }
    }

    private function validateFields(string $name, string $slug, string $description): void
    {
        if ($name === '') Response::error('Destination name is required.', 422);
        if (mb_strlen($name) > 150) Response::error('Destination name cannot exceed 150 characters.', 422);

        if ($slug === '') Response::error('Destination slug is required.', 422);
        if (mb_strlen($slug) > 170) Response::error('Destination slug cannot exceed 170 characters.', 422);
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            Response::error('Destination slug may contain only lowercase letters, numbers, and hyphens.', 422);
        }

        if (mb_strlen($description) > 2000) {
            Response::error('Description cannot exceed 2000 characters.', 422);
        }
    }
}
