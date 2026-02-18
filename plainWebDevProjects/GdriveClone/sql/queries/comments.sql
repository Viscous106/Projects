-- name: CreateComment :one
INSERT INTO comments (file_id, user_id, content)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetFileComments :many
SELECT
    c.*,
    u.name as user_name,
    u.email
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.file_id = $1
  AND c.is_deleted = FALSE
ORDER BY c.created_at ASC;

-- name: GetComment :one
SELECT * FROM comments
WHERE id = $1 AND is_deleted = FALSE;

-- name: UpdateComment :one
UPDATE comments
SET content = $2, updated_at = NOW()
WHERE id = $1 AND is_deleted = FALSE
RETURNING *;

-- name: DeleteComment :exec
UPDATE comments
SET is_deleted = TRUE, updated_at = NOW()
WHERE id = $1;

-- name: GetCommentsByUser :many
SELECT
    c.*,
    f.name as file_name
FROM comments c
JOIN files f ON c.file_id = f.id
WHERE c.user_id = $1
  AND c.is_deleted = FALSE
ORDER BY c.created_at DESC
LIMIT $2;
