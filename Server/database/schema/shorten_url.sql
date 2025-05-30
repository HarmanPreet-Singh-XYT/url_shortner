-- +goose Up
CREATE TABLE shorten_url(
    id UUID NOT NULL PRIMARY KEY,
    originalUrl NOT NULL TEXT,
    shortUrl NOT NULL TEXT,
    customAlias TEXT,
    createdAt TIMESTAMP,
    clicks INT NOT NULL DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    description TEXT,
);
-- +goose Down
DROP TABLE shorten_url;