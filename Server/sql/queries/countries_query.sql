-- name: GetCountriesById :one
SELECT * FROM countries
WHERE id = $1;

-- name: GetCountriesByUrlId :many
SELECT * FROM countries
WHERE urlId = $1;

-- name: GetCountryClicksByUrlIdDate :one
SELECT * FROM countries
WHERE urlId = $1 AND country = $2;

-- name: CreateCountryClicks :exec
INSERT INTO countries (id, urlId, country, clicks)
VALUES (
    gen_random_uuid(),
    $1,
    $2,
    1
)
RETURNING *;

-- name: IncrementCountryClicks :exec
UPDATE countries
SET clicks = clicks + 1
WHERE urlId = $1 AND country = $2;
