-- +goose Up
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

-- +goose Down
DROP TABLE share_links;
