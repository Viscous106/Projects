-- name: CreateFileVersion :one
INSERT INTO file_versions (file_id, version_number, storage_path, size, uploaded_by)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetFileVersions :many
SELECT fv.*, u.name as uploader_name, u.email as uploader_email
FROM file_versions fv
JOIN users u ON fv.uploaded_by = u.id
WHERE fv.file_id = $1
ORDER BY fv.version_number DESC;

-- name: GetLatestVersionNumber :one
SELECT COALESCE(MAX(version_number), 0) as latest_version
FROM file_versions
WHERE file_id = $1;

-- name: GetFileVersion :one
SELECT fv.*, u.name as uploader_name
FROM file_versions fv
JOIN users u ON fv.uploaded_by = u.id
WHERE fv.id = $1;

-- name: DeleteFileVersions :exec
DELETE FROM file_versions
WHERE file_id = $1;
