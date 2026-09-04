<?php

class TourImageController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * GET /api/tours/{id}/images
     *
     * Retrieves all images belonging to
     * an active tour.
     */
    public function index(int $tourId): never
    {
        try {

            /*
             * ------------------------------------------------------
             * Verify that the tour exists and is active.
             * ------------------------------------------------------
             */
            $tourStmt = $this->db->prepare(
                "SELECT id
                 FROM tours
                 WHERE id = :tour_id
                 AND status = 'ACTIVE'
                 LIMIT 1"
            );

            $tourStmt->execute([
                'tour_id' => $tourId
            ]);

            if ($tourStmt->fetch() === false) {

                Response::error(
                    'Tour not found.',
                    404
                );
            }


            /*
             * ------------------------------------------------------
             * Retrieve tour images.
             * ------------------------------------------------------
             */
            $stmt = $this->db->prepare(
                "SELECT
                    id,
                    tour_id,
                    image_url,
                    alt_text,
                    is_primary,
                    sort_order,
                    created_at

                 FROM tour_images

                 WHERE tour_id = :tour_id

                 ORDER BY
                    is_primary DESC,
                    sort_order ASC,
                    id ASC"
            );

            $stmt->execute([
                'tour_id' => $tourId
            ]);

            $images = $stmt->fetchAll();


            /*
             * ------------------------------------------------------
             * Convert PostgreSQL values into appropriate
             * JSON types.
             * ------------------------------------------------------
             */
            foreach ($images as &$image) {

                $image['id'] =
                    (int) $image['id'];

                $image['tour_id'] =
                    (int) $image['tour_id'];

                $image['is_primary'] =
                    (bool) $image['is_primary'];

                $image['sort_order'] =
                    (int) $image['sort_order'];
            }

            unset($image);


            /*
             * ------------------------------------------------------
             * Return successful response.
             * ------------------------------------------------------
             */
            Response::success(
                $images,
                'Tour images retrieved successfully.'
            );

        } catch (PDOException $e) {

            Response::error(
                'Failed to retrieve tour images.',
                500,
                [
                    'error' => $e->getMessage()
                ]
            );
        }
    }
}