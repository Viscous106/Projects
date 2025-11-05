-- name: CreatePermission :one
INSERT INTO permissions (item_type, item_id, user_id, role, granted_by)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (item_type, item_id, user_id)
DO UPDATE SET role = EXCLUDED.role
RETURNING *;

-- name: GetItemPermissions :many
SELECT p.*, u.email, u.name as user_name
FROM permissions p
JOIN users u ON p.user_id = u.id
WHERE p.item_type = $1 AND p.item_id = $2;

-- name: GetUserPermissionForItem :one
SELECT * FROM permissions
WHERE item_type = $1 AND item_id = $2 AND user_id = $3;

-- name: RevokePermission :exec
DELETE FROM permissions
WHERE item_type = $1 AND item_id = $2 AND user_id = $3;

-- name: GetSharedWithMeFiles :many
SELECT f.*, u.name as owner_name, p.role
FROM files f
JOIN permissions p ON p.item_type = 'file' AND p.item_id = f.id
JOIN users u ON f.owner_id = u.id
WHERE p.user_id = $1 AND f.status = 'active';

-- name: GetSharedWithMeFolders :many
SELECT fo.*, u.name as owner_name, p.role
FROM folders fo
JOIN permissions p ON p.item_type = 'folder' AND p.item_id = fo.id
JOIN users u ON fo.owner_id = u.id
WHERE p.user_id = $1 AND fo.status = 'active';

-- name: CreateShare :one
INSERT INTO shares (item_type, item_id, token, created_by, permission, expires_at)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetShareByToken :one
SELECT * FROM shares WHERE token = $1 AND is_active = TRUE;

-- name: DeactivateShare :exec
UPDATE shares SET is_active = FALSE WHERE id = $1;

-- name: GetSharesByItem :many
SELECT * FROM shares WHERE item_type = $1 AND item_id = $2 AND is_active = TRUE;
