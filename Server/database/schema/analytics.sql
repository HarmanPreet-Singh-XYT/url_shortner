-- +goose Up
CREATE TABLE analytics(
    id UUID NOT NULL PRIMARY KEY,
    urlId UUID NOT NULL,
    uniqueClicks int NOT NULL DEFAULT 0,
    totalClicks int NOT NULL DEFAULT 0,
);
-- +goose Down
DROP TABLE analytics;