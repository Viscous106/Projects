-- +goose Up
CREATE TYPE file_status AS ENUM ('active', 'trashed', 'deleted');

CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,

    is_root BOOLEAN DEFAULT FALSE,
    status file_status DEFAULT 'active',
    is_starred BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    trashed_at TIMESTAMP
);

CREATE INDEX idx_folders_owner ON folders(owner_id);
CREATE INDEX idx_folders_parent ON folders(parent_folder_id);

-- +goose Down
DROP TABLE folders;
DROP TYPE file_status;
