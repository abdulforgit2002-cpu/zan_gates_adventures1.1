<?php

class AdminCategoryController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * GET /api/admin/categories
     */
    public function index(): never
    {
        AuthMiddleware::requireAdmin();

        try {
            $stmt = $this->db->query(
                "SELECT
                    id, name, slug, description, created_at, updated_at,
                    (SELECT COUNT(*) FROM tours WHERE tours.category_id = categories.id) AS tour_count
                 FROM categories
                 ORDER BY name"
            );

            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($categories as &$category) {
                $category['id'] = (int) $category['id'];
                $category['tour_count'] = (int) $category['tour_count'];
            }
            unset($category);

            Response::success($categories, 'Categories retrieved successfully.');

        } catch (PDOException $e) {
            error_log('Admin category index database error: ' . $e->getMessage());
            Response::error('Unable to retrieve categories at this time.', 500);
        }
    }

    /**
     * POST /api/admin/categories
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

            $slugCheck = $this->db->prepare("SELECT id FROM categories WHERE slug = :slug LIMIT 1");
            $slugCheck->execute([':slug' => $slug]);

            if ($slugCheck->fetchColumn()) {
                Response::error('A category with this slug already exists.', 409);
            }

            $statement = $this->db->prepare(
                "INSERT INTO categories (name, slug, description)
                 VALUES (:name, :slug, :description)
                 RETURNING id, name, slug, description, created_at, updated_at"
            );

            $statement->bindValue(':name', $name);
            $statement->bindValue(':slug', $slug);
            $statement->bindValue(':description', $description !== '' ? $description : null,
                $description !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $statement->execute();

            $category = $statement->fetch(PDO::FETCH_ASSOC);
            $category['id'] = (int) $category['id'];
            $category['tour_count'] = 0;

            Response::success($category, 'Category created successfully.', 201);

        } catch (PDOException $e) {
            error_log('Admin category store database error: ' . $e->getMessage());
            Response::error('Unable to create the category at this time.', 500);
        }
    }

    /**
     * PUT /api/admin/categories/{id}
     */
    public function update(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) Response::error('Invalid category ID.', 422);

        try {
            $body = Request::body();

            $name = trim((string) ($body['name'] ?? ''));
            $slug = trim((string) ($body['slug'] ?? ''));
            $description = trim((string) ($body['description'] ?? ''));

            $this->validateFields($name, $slug, $description);

            $categoryCheck = $this->db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
            $categoryCheck->execute([':id' => $id]);

            if (!$categoryCheck->fetchColumn()) Response::error('Category not found.', 404);

            $slugCheck = $this->db->prepare("SELECT id FROM categories WHERE slug = :slug AND id <> :id LIMIT 1");
            $slugCheck->execute([':slug' => $slug, ':id' => $id]);

            if ($slugCheck->fetchColumn()) Response::error('A category with this slug already exists.', 409);

            $statement = $this->db->prepare(
                "UPDATE categories
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

            $category = $statement->fetch(PDO::FETCH_ASSOC);
            $category['id'] = (int) $category['id'];

            Response::success($category, 'Category updated successfully.');

        } catch (PDOException $e) {
            error_log('Admin category update database error: ' . $e->getMessage());
            Response::error('Unable to update the category at this time.', 500);
        }
    }

    /**
     * DELETE /api/admin/categories/{id}
     */
    public function destroy(int $id): never
    {
        AuthMiddleware::requireAdmin();

        if ($id <= 0) Response::error('Invalid category ID.', 422);

        try {
            $check = $this->db->prepare("SELECT id FROM categories WHERE id = :id LIMIT 1");
            $check->execute([':id' => $id]);

            if (!$check->fetchColumn()) Response::error('Category not found.', 404);

            $tourCheck = $this->db->prepare("SELECT COUNT(*) FROM tours WHERE category_id = :id");
            $tourCheck->execute([':id' => $id]);

            if ((int) $tourCheck->fetchColumn() > 0) {
                Response::error(
                    'This category cannot be deleted because it is used by existing tours.',
                    409
                );
            }

            $this->db->prepare("DELETE FROM categories WHERE id = :id")->execute([':id' => $id]);

            Response::success(['id' => $id], 'Category deleted successfully.');

        } catch (PDOException $e) {
            error_log('Admin category delete database error: ' . $e->getMessage());
            Response::error('Unable to delete the category at this time.', 500);
        }
    }

    private function validateFields(string $name, string $slug, string $description): void
    {
        if ($name === '') Response::error('Category name is required.', 422);
        if (mb_strlen($name) > 150) Response::error('Category name cannot exceed 150 characters.', 422);

        if ($slug === '') Response::error('Category slug is required.', 422);
        if (mb_strlen($slug) > 170) Response::error('Category slug cannot exceed 170 characters.', 422);
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            Response::error('Category slug may contain only lowercase letters, numbers, and hyphens.', 422);
        }

        if (mb_strlen($description) > 2000) {
            Response::error('Description cannot exceed 2000 characters.', 422);
        }
    }
}
