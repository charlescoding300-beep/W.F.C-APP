-- WFC additive database foundation.
-- Existing tables and API columns remain unchanged.

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id INTEGER PRIMARY KEY,
    display_name TEXT,
    about TEXT,
    avatar_url TEXT,
    website TEXT,
    location TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, setting_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    user_id INTEGER,
    properties_json TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Chat list, membership lookup, and message-history indexes.
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_id
    ON messages(chat_id, id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id_id
    ON messages(sender_id, id);

CREATE INDEX IF NOT EXISTS idx_chat_members_user_chat
    ON chat_members(user_id, chat_id);

CREATE INDEX IF NOT EXISTS idx_chats_updated_id
    ON chats(updated_at, id);

-- Media and verification lookups.
CREATE INDEX IF NOT EXISTS idx_media_user_created
    ON media(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_media_message
    ON media(message_id);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone_expiry
    ON phone_verifications(phone, expires_at);

-- Settings lookup.
CREATE INDEX IF NOT EXISTS idx_user_settings_user
    ON user_settings(user_id);

-- Analytics queries by event and time.
CREATE INDEX IF NOT EXISTS idx_analytics_event_created
    ON analytics_events(event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_user_created
    ON analytics_events(user_id, created_at);
