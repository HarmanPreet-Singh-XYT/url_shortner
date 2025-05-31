-- +goose Up
CREATE TABLE shortenUrl (
    id UUID NOT NULL PRIMARY KEY,
    originalUrl TEXT NOT NULL,
    shortUrl TEXT NOT NULL,
    customAlias TEXT NOT NULL,
    createdAt TIMESTAMP,
    clicks INT NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NOT NULL
);

-- +goose Down
DROP TABLE shortenUrl;
