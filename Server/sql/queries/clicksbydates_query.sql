-- name: GetClicksByDatesById :many
SELECT * FROM clicksbydate
WHERE id = $1;
-- name: GetClicksByDatesByUrlId :many
SELECT * FROM clicksbydate
WHERE urlId = $1;
-- name: GetClicksByDatesByUrlIdDate :one
SELECT * FROM clicksbydate
WHERE urlId = $1 AND date = $2;
-- name: GetClicksByDatesByIdDate :many
SELECT * FROM clicksbydate
WHERE id = $1 AND date = $2;
-- name: CreateClicksByDate :exec
INSERT INTO clicksbydate (id, urlId, date, clicks)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    1
)
RETURNING *;
-- name: IncrementClicksByDateByUrlIdDate :exec
UPDATE clicksbydate
   SET clicks = clicks + 1
WHERE urlId = $1 AND date = $2;