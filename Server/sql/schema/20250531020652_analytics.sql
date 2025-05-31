-- +goose Up
CREATE TABLE analytics (
    id UUID NOT NULL PRIMARY KEY,
    urlId UUID UNIQUE NOT NULL,
    uniqueClicks INT NOT NULL DEFAULT 0,
    totalClicks INT NOT NULL DEFAULT 0,
    FOREIGN KEY (urlId) REFERENCES shortenUrl(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE analytics;