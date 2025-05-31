-- name: CreateShortenURL :one
INSERT INTO shortenUrl (
    id, originalUrl, shortUrl, customAlias, createdAt, clicks, isActive, description
)
VALUES (
    gen_random_uuid(),
    $1, $2, $3,
    NOW(),
    $4, $5, $6
)
RETURNING *;
-- name: DeleteShortenURLById :exec
DELETE FROM shortenUrl WHERE Id = $1;
-- name: DeleteShortenURLByShortUrl :exec
DELETE FROM shortenUrl WHERE shortUrl = $1;
-- name: UpdateShortenURLStatusById :exec
UPDATE shortenUrl
   SET isActive = $2
WHERE id = $1;
-- name: UpdateShortenURLStatusByShortUrl :exec
UPDATE shortenUrl
   SET isActive = $2
WHERE shortUrl = $1;
-- name: GetAllShortens :many
SELECT * FROM shortenUrl;
-- name: UpdateShortenURLById :exec
UPDATE shortenUrl
   SET originalUrl = $2, customAlias = $3, description = $4
WHERE id = $1;
-- name: GetShortenURLByShortUrl :one
SELECT * FROM shortenUrl WHERE shortUrl = $1;
-- name: IncrementClick :exec
UPDATE shortenUrl
   SET clicks = clicks + 1
WHERE id = $1;