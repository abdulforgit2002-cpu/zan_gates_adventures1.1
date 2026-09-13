<?php

class Tour
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /*
    |--------------------------------------------------------------------------
    | LIST ITEMS
    |--------------------------------------------------------------------------
    | Returns an array grouped by category:
    | [
    |   'highlight'   => ['…', '…'],
    |   'include'     => ['…', '…'],
    |   'exclude'     => ['…', '…'],
    |   'activity'    => ['…', '…'],
    |   'what_to_see' => ['…', '…'],
    | ]
    */

    public function getListItems(int $tourId): array
    {
        $statement = $this->db->prepare(
            "SELECT category, text, sort_order
             FROM tour_list_items
             WHERE tour_id = :tour_id
             ORDER BY category, sort_order, id"
        );

        $statement->execute([':tour_id' => $tourId]);

        $rows = $statement->fetchAll(PDO::FETCH_ASSOC);

        $grouped = [
            'highlight'   => [],
            'include'     => [],
            'exclude'     => [],
            'activity'    => [],
            'what_to_see' => [],
        ];

        foreach ($rows as $row) {
            $grouped[$row['category']][] = $row['text'];
        }

        return $grouped;
    }

    /*
    |--------------------------------------------------------------------------
    | GROUP PRICES
    |--------------------------------------------------------------------------
    */

    public function getGroupPrices(int $tourId): array
    {
        $statement = $this->db->prepare(
            "SELECT id, label, people_count, price, currency, sort_order
             FROM tour_group_prices
             WHERE tour_id = :tour_id
             ORDER BY sort_order, people_count"
        );

        $statement->execute([':tour_id' => $tourId]);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | EXTRA SECTIONS (tips, notes, itinerary, custom)
    |--------------------------------------------------------------------------
    | Returns an array keyed by section_key:
    | [
    |   'tips' => [
    |       'title' => 'TIPS',
    |       'items' => [
    |           ['title' => 'Seafood', 'body' => 'Prawns, Lobster…'],
    |       ],
    |   ],
    | ]
    */

    public function getExtraSections(int $tourId): array
    {
        $statement = $this->db->prepare(
            "SELECT id, section_key, section_title,
                    item_title, item_body, sort_order
             FROM tour_extra_sections
             WHERE tour_id = :tour_id
             ORDER BY section_key, sort_order, id"
        );

        $statement->execute([':tour_id' => $tourId]);

        $rows = $statement->fetchAll(PDO::FETCH_ASSOC);

        $grouped = [];

        foreach ($rows as $row) {
            $key = $row['section_key'];

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'title' => $row['section_title'] ?? $key,
                    'items' => [],
                ];
            }

            $grouped[$key]['items'][] = [
                'title' => $row['item_title'],
                'body'  => $row['item_body'],
            ];
        }

        return $grouped;
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE LIST ITEMS
    |--------------------------------------------------------------------------
    */

    public function saveListItems(int $tourId, array $data): void
    {
        $categories = [
            'highlight'   => 'highlights',
            'include'     => 'includes',
            'exclude'     => 'excludes',
            'activity'    => 'activities',
            'what_to_see' => 'what_to_see',
        ];

        $statement = $this->db->prepare(
            "INSERT INTO tour_list_items
                (tour_id, category, text, sort_order)
             VALUES
                (:tour_id, :category, :text, :sort_order)"
        );

        foreach ($categories as $category => $payloadKey) {
            $items = $data[$payloadKey] ?? [];

            if (!is_array($items)) {
                continue;
            }

            $position = 0;

            foreach ($items as $text) {
                $text = trim((string) $text);

                if ($text === '') {
                    continue;
                }

                $statement->execute([
                    ':tour_id'    => $tourId,
                    ':category'   => $category,
                    ':text'       => $text,
                    ':sort_order' => $position++,
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE GROUP PRICES
    |--------------------------------------------------------------------------
    */

    public function saveGroupPrices(int $tourId, array $rows): void
    {
        if (!is_array($rows)) {
            return;
        }

        $statement = $this->db->prepare(
            "INSERT INTO tour_group_prices
                (tour_id, label, people_count, price, currency, sort_order)
             VALUES
                (:tour_id, :label, :people_count, :price, :currency, :sort_order)"
        );

        $position = 0;

        foreach ($rows as $row) {
            $label  = trim((string) ($row['label'] ?? ''));
            $people = (int)    ($row['people_count'] ?? 1);
            $price  = (float)  ($row['price'] ?? 0);

            if ($label === '' || $price <= 0) {
                continue;
            }

            $statement->execute([
                ':tour_id'      => $tourId,
                ':label'        => $label,
                ':people_count' => $people,
                ':price'        => number_format($price, 2, '.', ''),
                ':currency'     => strtoupper($row['currency'] ?? 'USD'),
                ':sort_order'   => $position++,
            ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE EXTRA SECTIONS
    |--------------------------------------------------------------------------
    */

    public function saveExtraSections(int $tourId, array $sections): void
    {
        if (!is_array($sections)) {
            return;
        }

        $statement = $this->db->prepare(
            "INSERT INTO tour_extra_sections
                (tour_id, section_key, section_title,
                 item_title, item_body, sort_order)
             VALUES
                (:tour_id, :section_key, :section_title,
                 :item_title, :item_body, :sort_order)"
        );

        $position = 0;

        foreach ($sections as $section) {
            $key   = trim((string) ($section['section_key'] ?? ''));
            $title = trim((string) ($section['section_title'] ?? ''));

            if ($key === '') {
                continue;
            }

            $items = $section['items'] ?? [];

            if (!is_array($items)) {
                continue;
            }

            foreach ($items as $item) {
                $itemTitle = trim((string) ($item['title'] ?? ''));
                $itemBody  = trim((string) ($item['body'] ?? ''));

                if ($itemTitle === '' && $itemBody === '') {
                    continue;
                }

                $statement->execute([
                    ':tour_id'       => $tourId,
                    ':section_key'   => $key,
                    ':section_title' => $title !== '' ? $title : null,
                    ':item_title'    => $itemTitle !== '' ? $itemTitle : null,
                    ':item_body'     => $itemBody !== '' ? $itemBody : null,
                    ':sort_order'    => $position++,
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | CLEAR RELATED DATA
    |--------------------------------------------------------------------------
    */

    public function clearRelatedData(int $tourId): void
    {
        $this->db
            ->prepare("DELETE FROM tour_list_items WHERE tour_id = :id")
            ->execute([':id' => $tourId]);

        $this->db
            ->prepare("DELETE FROM tour_group_prices WHERE tour_id = :id")
            ->execute([':id' => $tourId]);

        $this->db
            ->prepare("DELETE FROM tour_extra_sections WHERE tour_id = :id")
            ->execute([':id' => $tourId]);
    }
}