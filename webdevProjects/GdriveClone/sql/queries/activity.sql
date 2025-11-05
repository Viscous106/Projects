-- name: LogActivity :exec
INSERT INTO activity_log (user_id, file_id, activity_type, details)
VALUES ($1, $2, $3, $4);

-- name: GetUserActivity :many
SELECT al.*, f.name as file_name
FROM activity_log al
LEFT JOIN files f ON al.file_id = f.id
WHERE al.user_id = $1
ORDER BY al.created_at DESC
LIMIT $2;

-- name: GetFileActivity :many
SELECT al.*, u.name as user_name
FROM activity_log al
JOIN users u ON al.user_id = u.id
WHERE al.file_id = $1
ORDER BY al.created_at DESC
LIMIT $2;

-- name: GetActivityTimeline :many
SELECT 
    DATE(al.created_at) as activity_date,
    al.id,
    al.user_id,
    al.file_id,
    al.activity_type,
    al.details,
    al.created_at,
    u.name as user_name,
    u.email as user_email,
    f.name as file_name,
    f.mime_type as file_mime_type
FROM activity_log al
JOIN users u ON al.user_id = u.id
LEFT JOIN files f ON al.file_id = f.id
WHERE al.user_id = $1
  AND DATE(al.created_at) >= $2::date
  AND DATE(al.created_at) <= $3::date
ORDER BY al.created_at DESC;

-- name: GetDashboardActivity :many
SELECT 
    al.*,
    u.name as user_name,
    u.email as user_email,
    f.name as file_name,
    f.mime_type as file_mime_type,
    f.size as file_size
FROM activity_log al
JOIN users u ON al.user_id = u.id
LEFT JOIN files f ON al.file_id = f.id
WHERE al.user_id = $1
ORDER BY al.created_at DESC
LIMIT $2;
