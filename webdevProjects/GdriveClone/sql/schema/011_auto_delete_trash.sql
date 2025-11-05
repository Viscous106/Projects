-- +goose Up
-- Add index on trashed_at for efficient cleanup queries
CREATE INDEX idx_files_trashed_at ON files(trashed_at) WHERE status = 'trashed';
CREATE INDEX idx_folders_trashed_at ON folders(trashed_at) WHERE status = 'trashed';

-- +goose Down
DROP INDEX IF EXISTS idx_files_trashed_at;
DROP INDEX IF EXISTS idx_folders_trashed_at;

