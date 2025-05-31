-- name: GetReferrerById :one
SELECT * FROM referrers
WHERE id = $1;

-- name: GetReferrersByUrlId :many
SELECT * FROM referrers
WHERE urlId = $1;

-- name: GetReferrerBySourceUrlId :one
SELECT * FROM referrers
WHERE urlId = $1 AND source = $2;

-- name: CreateReferrer :exec
INSERT INTO referrers (id, urlId, source, clicks)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    1
)
RETURNING *;

-- name: IncrementReferrerClicks :exec
UPDATE referrers
SET clicks = clicks + 1
WHERE urlId = $1 AND source = $2;
