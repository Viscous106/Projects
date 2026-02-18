-- +goose Up
CREATE TYPE activity_type AS ENUM (
    'upload', 'delete', 'restore', 'share', 'unshare',
    'rename', 'move', 'comment', 'download', 'star', 'unstar'
);

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    details JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_file ON activity_log(file_id);

-- +goose Down
DROP TABLE activity_log;
DROP TYPE activity_type;
