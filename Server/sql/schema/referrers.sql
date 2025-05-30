-- +goose Up
CREATE TABLE referrers(
    id UUID NOT NULL PRIMARY KEY,
    urlId UUID NOT NULL,
    source TEXT NOT NULL,
    clicks int NOT DEFAULT 1,
    FOREIGN KEY (urlId) REFERENCES shorten_url(id) ON DELETE CASCADE
);
-- +goose Down
DROP TABLE referrers;