CREATE TABLE IF NOT EXISTS tour_translations (
    id SERIAL PRIMARY KEY,
    tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    duration VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tour_id, language)
);

CREATE INDEX IF NOT EXISTS idx_tour_translations_tour_id
    ON tour_translations (tour_id);

CREATE INDEX IF NOT EXISTS idx_tour_translations_language
    ON tour_translations (language);
