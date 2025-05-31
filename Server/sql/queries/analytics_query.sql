-- name: CreateAnalytics :exec
INSERT INTO analytics (id, urlId, uniqueClicks, totalClicks)
VALUES (
    gen_random_uuid(),
    $1,
    0,
    0
)
RETURNING *;
-- name: IncrementClicksById :exec
UPDATE analytics
   SET totalClicks = totalClicks + 1
WHERE id = $1;
-- name: IncrementClicksByUrlId :exec
UPDATE analytics
   SET totalClicks = totalClicks + 1
WHERE urlId = $1
RETURNING *;
-- name: IncrementUniqueClicksById :exec
UPDATE analytics
   SET uniqueClicks = uniqueClicks + 1
WHERE id = $1;
-- name: IncrementUniqueClicksByUrlId :exec
UPDATE analytics
   SET uniqueClicks = uniqueClicks + 1
WHERE urlId = $1;
-- name: GetAllAnalytics :many
SELECT * FROM analytics;
-- name: GetAnalyticsByUrlId :one
SELECT * FROM analytics WHERE urlId = $1;

-- name: IncrementTotalClicks_UniqueClicksByUrlId :exec
UPDATE analytics
   SET totalClicks = totalClicks + 1,
   uniqueClicks = uniqueClicks + 1
WHERE urlId = $1;