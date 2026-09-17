-- ============================================================
-- BASE SCHEMA
-- ============================================================
-- Reconstructed from the SQL the controllers actually run
-- (backend/src/Controllers/*, backend/src/Models/Tour.php) —
-- this table never existed as a committed migration; the real
-- schema previously only lived inside the Railway Postgres
-- instance. This file recreates it from scratch for a fresh
-- database (e.g. a new VPS deploy).
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         varchar(150) NOT NULL,
    slug         varchar(170) NOT NULL UNIQUE,
    description  text,
    created_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DESTINATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS destinations (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         varchar(150) NOT NULL,
    slug         varchar(170) NOT NULL UNIQUE,
    description  text,
    created_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS (admin accounts — AdminAuthController reads/writes this)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username       varchar(100) NOT NULL UNIQUE,
    full_name      varchar(150) NOT NULL,
    password_hash  varchar(255) NOT NULL,
    role           varchar(20) NOT NULL DEFAULT 'ADMIN',
    created_at     timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TOURS
-- ============================================================
-- duration_start / duration_end / departure_location /
-- return_location are added later by
-- 0001_add_rich_tour_content.sql — not included here so that
-- migration's ADD COLUMN IF NOT EXISTS stays meaningful.

CREATE TABLE IF NOT EXISTS tours (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id         bigint NOT NULL REFERENCES categories(id),
    destination_id      bigint NOT NULL REFERENCES destinations(id),
    title               varchar(200) NOT NULL,
    slug                varchar(220) NOT NULL UNIQUE,
    short_description   varchar(500),
    description         text,
    duration            varchar(100),
    featured            boolean NOT NULL DEFAULT false,
    status              varchar(20) NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tours_category_id
    ON tours USING btree (category_id);

CREATE INDEX IF NOT EXISTS idx_tours_destination_id
    ON tours USING btree (destination_id);

CREATE INDEX IF NOT EXISTS idx_tours_status
    ON tours USING btree (status);

-- ============================================================
-- TOUR PRICES
-- ============================================================

CREATE TABLE IF NOT EXISTS tour_prices (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tour_id       bigint NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    pricing_type  varchar(30) NOT NULL,
    min_people    integer NOT NULL,
    max_people    integer,
    price         numeric(12,2) NOT NULL,
    currency      varchar(10) NOT NULL DEFAULT 'USD',
    created_at    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tour_prices_tour_id
    ON tour_prices USING btree (tour_id);

-- ============================================================
-- TOUR IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS tour_images (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tour_id      bigint NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    image_url    varchar(500) NOT NULL,
    alt_text     varchar(255),
    is_primary   boolean NOT NULL DEFAULT false,
    sort_order   integer NOT NULL DEFAULT 0,
    created_at   timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tour_images_tour_id
    ON tour_images USING btree (tour_id);

-- ============================================================
-- BOOKING ENQUIRIES
-- ============================================================
-- (tour_extra_sections is created by 0001_add_rich_tour_content.sql,
-- not here — that file is the sole source of truth for it.)

CREATE TABLE IF NOT EXISTS booking_enquiries (
    id                     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tour_id                bigint NOT NULL REFERENCES tours(id),
    travel_date            date NOT NULL,
    adults                 integer NOT NULL,
    children               integer NOT NULL DEFAULT 0,
    full_name              varchar(150) NOT NULL,
    email                  varchar(180) NOT NULL,
    phone                  varchar(40) NOT NULL,
    special_requirements   text,
    status                 varchar(20) NOT NULL DEFAULT 'PENDING',
    estimated_total        numeric(12,2),
    currency               varchar(10),
    created_at             timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_enquiries_tour_id
    ON booking_enquiries USING btree (tour_id);

CREATE INDEX IF NOT EXISTS idx_booking_enquiries_status
    ON booking_enquiries USING btree (status);

CREATE INDEX IF NOT EXISTS idx_booking_enquiries_travel_date
    ON booking_enquiries USING btree (travel_date);
