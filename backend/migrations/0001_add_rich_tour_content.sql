-- ============================================================
-- EXTEND TOURS WITH PRACTICAL INFO
-- ============================================================

ALTER TABLE tours
    ADD COLUMN IF NOT EXISTS duration_start       varchar(20),
    ADD COLUMN IF NOT EXISTS duration_end         varchar(20),
    ADD COLUMN IF NOT EXISTS departure_location   varchar(255),
    ADD COLUMN IF NOT EXISTS return_location      varchar(255);


-- ============================================================
-- TOUR LIST ITEMS
-- One row per bullet point across all bullet categories.
-- ============================================================

CREATE TABLE IF NOT EXISTS tour_list_items (
    id           bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    tour_id      bigint NOT NULL,
    category     varchar(30) NOT NULL,
    text         varchar(500) NOT NULL,
    sort_order   integer NOT NULL DEFAULT 0,
    created_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tour_list_items_tour
        FOREIGN KEY (tour_id) REFERENCES tours(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tour_list_items_tour_id
    ON public.tour_list_items USING btree (tour_id);

CREATE INDEX IF NOT EXISTS idx_tour_list_items_tour_category
    ON public.tour_list_items USING btree (tour_id, category);


-- ============================================================
-- TOUR GROUP PRICES
-- ============================================================

CREATE TABLE IF NOT EXISTS tour_group_prices (
    id           bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    tour_id      bigint NOT NULL,
    label        varchar(100) NOT NULL,
    people_count integer NOT NULL DEFAULT 1,
    price        numeric(12,2) NOT NULL,
    currency     varchar(10) NOT NULL DEFAULT 'USD',
    sort_order   integer NOT NULL DEFAULT 0,
    created_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tour_group_prices_tour
        FOREIGN KEY (tour_id) REFERENCES tours(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tour_group_prices_tour_id
    ON public.tour_group_prices USING btree (tour_id);


-- ============================================================
-- TOUR EXTRA SECTIONS (tips, notes, itinerary, custom)
-- ============================================================

CREATE TABLE IF NOT EXISTS tour_extra_sections (
    id            bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    tour_id       bigint NOT NULL,
    section_key   varchar(50) NOT NULL,
    section_title varchar(150),
    item_title    varchar(150),
    item_body     text,
    sort_order    integer NOT NULL DEFAULT 0,
    created_at    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tour_extra_sections_tour
        FOREIGN KEY (tour_id) REFERENCES tours(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tour_extra_sections_tour_id
    ON public.tour_extra_sections USING btree (tour_id);

CREATE INDEX IF NOT EXISTS idx_tour_extra_sections_section
    ON public.tour_extra_sections USING btree (tour_id, section_key);