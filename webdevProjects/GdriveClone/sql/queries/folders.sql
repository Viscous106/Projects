-- name: CreateFolder :one
INSERT INTO folders (name, owner_id, parent_folder_id, is_root)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetFolderByID :one
SELECT * FROM folders WHERE id = $1 AND status = 'active';

-- name: GetFolderByIDAnyStatus :one
SELECT * FROM folders WHERE id = $1;

-- name: GetSubfolders :many
SELECT * FROM folders
WHERE parent_folder_id = $1 AND status = 'active'
ORDER BY name ASC;

-- name: GetRootFolder :one
SELECT * FROM folders
WHERE owner_id = $1 AND is_root = TRUE
LIMIT 1;

-- name: RenameFolder :exec
UPDATE folders
SET name = $2, updated_at = NOW()
WHERE id = $1;

-- name: MoveFolder :exec
UPDATE folders
SET parent_folder_id = $2, updated_at = NOW()
WHERE id = $1;

-- name: TrashFolder :exec
UPDATE folders
SET status = 'trashed', trashed_at = NOW()
WHERE id = $1;

-- name: RestoreFolder :exec
UPDATE folders
SET status = 'active', trashed_at = NULL
WHERE id = $1;

-- name: PermanentDeleteFolder :exec
UPDATE folders
SET status = 'deleted'
WHERE id = $1;

-- name: GetTrashedFolders :many
SELECT * FROM folders
WHERE owner_id = $1 AND status = 'trashed'
ORDER BY trashed_at DESC;

-- name: GetFoldersByOwner :many
SELECT * FROM folders
WHERE owner_id = $1 AND status = 'active'
ORDER BY name ASC;

-- name: GetRootFolders :many
SELECT * FROM folders
WHERE owner_id = $1
  AND parent_folder_id IS NULL
  AND is_root = FALSE
  AND status = 'active'
ORDER BY name ASC;

-- name: GetStarredFolders :many
SELECT * FROM folders
WHERE owner_id = $1 AND is_starred = TRUE AND status = 'active'
ORDER BY updated_at DESC;

-- name: ToggleStarFolder :exec
UPDATE folders
SET is_starred = NOT is_starred, updated_at = NOW()
WHERE id = $1;

-- name: GetFoldersInTrashOlderThan :many
SELECT * FROM folders
WHERE status = 'trashed'
  AND trashed_at < NOW() - INTERVAL '1 day' * $1
ORDER BY trashed_at ASC;
