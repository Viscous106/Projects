-- name: CreateUser :one
INSERT INTO users (email, hashed_password, name)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: UpdateUserStorage :exec
UPDATE users
SET storage_used = storage_used + $2,
    updated_at = NOW()
WHERE id = $1;

-- name: GetStorageUsage :one
SELECT storage_used, storage_limit FROM users WHERE id = $1;

-- name: SearchUsersByEmail :many
SELECT id, email, name, created_at FROM users
WHERE email ILIKE '%' || $1 || '%'
LIMIT 10;
