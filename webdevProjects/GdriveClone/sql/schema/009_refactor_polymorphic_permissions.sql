-- +goose Up
-- Drop old permission and share tables
DROP TABLE IF EXISTS file_permissions;
DROP TABLE IF EXISTS share_links;

-- Create item type enum for polymorphic references
CREATE TYPE item_type AS ENUM ('file', 'folder');

-- Create unified permissions table for both files and folders
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type item_type NOT NULL,
    item_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role permission_role NOT NULL,
    granted_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(item_type, item_id, user_id)
);

CREATE INDEX idx_permissions_item ON permissions(item_type, item_id);
CREATE INDEX idx_permissions_user ON permissions(user_id);

-- Create unified share links table for both files and folders
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type item_type NOT NULL,
    item_id UUID NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    permission permission_role DEFAULT 'viewer',
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shares_token ON shares(token);
CREATE INDEX idx_shares_item ON shares(item_type, item_id);

-- +goose Down
DROP TABLE IF EXISTS shares;
DROP TABLE IF EXISTS permissions;
DROP TYPE IF EXISTS item_type;

-- Recreate old tables
CREATE TABLE file_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role permission_role NOT NULL,
    granted_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(file_id, user_id)
);

CREATE INDEX idx_file_permissions_file ON file_permissions(file_id);
CREATE INDEX idx_file_permissions_user ON file_permissions(user_id);

CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    permission permission_role DEFAULT 'viewer',
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_file ON share_links(file_id);
