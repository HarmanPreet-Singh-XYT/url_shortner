-- +goose Up
CREATE TABLE shorten_url (
    id UUID NOT NULL PRIMARY KEY,
    originalUrl TEXT NOT NULL,
    shortUrl TEXT NOT NULL,
    customAlias TEXT,
    createdAt TIMESTAMP,
    clicks INT NOT NULL DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- +goose Down
DROP TABLE shorten_url;
