-- +goose Up
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,

    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    status file_status DEFAULT 'active',
    is_starred BOOLEAN DEFAULT FALSE,

    -- Metadata
    thumbnail_path TEXT,
    preview_available BOOLEAN DEFAULT FALSE,

    -- Versioning
    version INTEGER DEFAULT 1,
    current_version_id UUID,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    trashed_at TIMESTAMP,
    last_accessed_at TIMESTAMP
);

CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_parent_folder ON files(parent_folder_id);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_starred ON files(is_starred) WHERE is_starred = TRUE;
CREATE INDEX idx_files_name_search ON files USING gin(to_tsvector('english', name));

-- +goose Down
DROP TABLE files;
