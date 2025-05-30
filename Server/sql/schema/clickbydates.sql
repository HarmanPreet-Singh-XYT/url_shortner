-- +goose Up
CREATE TABLE clicksbydate(
    id UUID NOT NULL PRIMARY KEY,
    urlId UUID NOT NULL,
    date TEXT NOT NULL,
    clicks int NOT NULL DEFAULT 1,
    FOREIGN KEY (urlId) REFERENCES shorten_url(id) ON DELETE CASCADE
);
-- +goose Down
DROP TABLE clicksbydate;