-- +goose Up
CREATE TYPE permission_role AS ENUM ('viewer', 'commenter', 'editor', 'owner');

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

-- +goose Down
DROP TABLE file_permissions;
DROP TYPE permission_role;
