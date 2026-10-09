PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    profile_picture TEXT,
    about TEXT DEFAULT 'Hey! I am using WFC.',
    status TEXT DEFAULT 'offline',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'private',
    name TEXT,
    picture TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_members (
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (chat_id, user_id),

    FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text',
    body TEXT,
    media_url TEXT,
    reply_to INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reply_to)
        REFERENCES messages(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contacts (
    user_id INTEGER NOT NULL,
    contact_user_id INTEGER NOT NULL,

    PRIMARY KEY (user_id, contact_user_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (contact_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocked_users (
    user_id INTEGER NOT NULL,
    blocked_user_id INTEGER NOT NULL,

    PRIMARY KEY (user_id, blocked_user_id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (blocked_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message_id INTEGER,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_chat
ON messages(chat_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_members_user
ON chat_members(user_id);

CREATE INDEX IF NOT EXISTS idx_contacts_user
ON contacts(user_id);

CREATE TABLE IF NOT EXISTS phone_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone
ON phone_verifications(phone);

