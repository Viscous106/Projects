-- name: GetUserStorageStats :one
SELECT
    u.storage_used,
    u.storage_limit,
    COUNT(DISTINCT f.id) as total_files,
    COUNT(DISTINCT fo.id) as total_folders
FROM users u
LEFT JOIN files f ON f.owner_id = u.id AND f.status = 'active'
LEFT JOIN folders fo ON fo.owner_id = u.id AND fo.status = 'active'
WHERE u.id = $1
GROUP BY u.id, u.storage_used, u.storage_limit;

-- name: GetStorageByFileType :many
SELECT
    CASE
        WHEN mime_type LIKE 'image/%' THEN 'Images'
        WHEN mime_type LIKE 'video/%' THEN 'Videos'
        WHEN mime_type LIKE 'audio/%' THEN 'Audio'
        WHEN mime_type = 'application/pdf' THEN 'PDFs'
        WHEN mime_type LIKE 'application/vnd.ms-%' OR
             mime_type LIKE 'application/vnd.openxmlformats-officedocument%' OR
             mime_type LIKE 'application/msword%' THEN 'Documents'
        WHEN mime_type LIKE 'application/zip%' OR
             mime_type LIKE 'application/x-rar%' OR
             mime_type LIKE 'application/x-7z%' THEN 'Archives'
        WHEN mime_type LIKE 'text/%' THEN 'Text Files'
        ELSE 'Other'
    END as file_type,
    COUNT(*) as file_count,
    COALESCE(SUM(size), 0) as total_size
FROM files
WHERE owner_id = $1 AND status = 'active'
GROUP BY file_type
ORDER BY total_size DESC;

-- name: GetRecentStorageGrowth :many
SELECT
    DATE(created_at) as date,
    COUNT(*) as files_added,
    COALESCE(SUM(size), 0) as storage_added
FROM files
WHERE owner_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
  AND status = 'active'
GROUP BY DATE(created_at)
ORDER BY date DESC;
