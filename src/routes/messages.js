const express = require('express');

const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const messageColumns = db.prepare('PRAGMA table_info(messages)').all();
if (!messageColumns.some(column => column.name === 'view_once')) {
    db.exec('ALTER TABLE messages ADD COLUMN view_once INTEGER NOT NULL DEFAULT 0');
}
db.exec(`CREATE TABLE IF NOT EXISTS message_views (
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, user_id)
)`);

/*
 * GET /api/v1/messages/:chatId
 * Load messages belonging to a chat.
 */
router.get('/:chatId', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const chatId = Number(req.params.chatId);

    if (!Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_CHAT_ID',
                message: 'Invalid chat ID'
            }
        });
    }

    const member = db.prepare(`
        SELECT 1
        FROM chat_members
        WHERE chat_id = ?
          AND user_id = ?
        LIMIT 1
    `).get(chatId, userId);

    if (!member) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'CHAT_ACCESS_DENIED',
                message: 'You are not a member of this chat'
            }
        });
    }

    const messages = db.prepare(`
        SELECT
            m.id,
            m.chat_id,
            m.sender_id,
            m.message_type,
            m.body,
            m.media_url,
            m.reply_to,
            m.is_read,
            m.view_once,
            EXISTS (SELECT 1 FROM message_views seen WHERE seen.message_id = m.id AND seen.user_id = ?) AS viewed_once,
            m.created_at,

            u.username AS sender_username,
            u.display_name AS sender_display_name,
            u.profile_picture AS sender_profile_picture,
            u.phone_verified_at AS sender_phone_verified_at

        FROM messages m

        INNER JOIN users u
            ON u.id = m.sender_id
        INNER JOIN chat_members mine
            ON mine.chat_id = m.chat_id AND mine.user_id = ?

        WHERE m.chat_id = ? AND m.id > COALESCE(mine.cleared_through_message_id, 0)

        ORDER BY m.id ASC
    `).all(userId, userId, chatId);

    res.json({
        success: true,
        messages
    });
});

router.post('/:chatId/clear', requireAuth, (req, res) => {
    const userId = Number(req.user.userId);
    const chatId = Number(req.params.chatId);
    if (!Number.isInteger(chatId) || chatId < 1) return res.status(400).json({ success: false, error: { message: 'Invalid chat.' } });
    const member = db.prepare('SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId);
    if (!member) return res.status(404).json({ success: false, error: { message: 'Chat not found.' } });
    const latest = Number(db.prepare('SELECT COALESCE(MAX(id), 0) AS id FROM messages WHERE chat_id = ?').get(chatId).id);
    db.prepare('UPDATE chat_members SET cleared_through_message_id = ?, last_read_message_id = MAX(last_read_message_id, ?) WHERE chat_id = ? AND user_id = ?').run(latest, latest, chatId, userId);
    return res.json({ success: true, cleared_through_message_id: latest });
});

/*
 * POST /api/v1/messages
 * Send a text message.
 */
router.post('/', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const body = req.body || {};

    const chatId = Number(body.chat_id);
    const messageType = body.message_type === 'sticker' ? 'sticker' : 'text';
    const messageBody =
        typeof body.body === 'string'
            ? body.body.trim()
            : '';
    const allowedStickers = new Set(['👋', '💙', '🎉', '😂', '✨', '👍', '🥳', '🫶', 'wfc:wave', 'wfc:heart', 'wfc:sparkle', 'wfc:rocket', 'wfc:laugh', 'wfc:party', 'wfc:thanks', 'wfc:cheers', 'wfc:person-wave', 'wfc:person-clap', 'wfc:person-laugh', 'wfc:person-hug']);

    if (!Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_CHAT_ID',
                message: 'Invalid chat ID'
            }
        });
    }

    if (!messageBody) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'EMPTY_MESSAGE',
                message: 'Message cannot be empty'
            }
        });
    }

    if (messageType === 'sticker' && !allowedStickers.has(messageBody)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_STICKER', message: 'Choose a sticker from the W.F.C sticker tray.' } });
    }

    if (messageBody.length > 5000) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'MESSAGE_TOO_LONG',
                message: 'Message is too long'
            }
        });
    }

    const member = db.prepare(`
        SELECT 1
        FROM chat_members
        WHERE chat_id = ?
          AND user_id = ?
        LIMIT 1
    `).get(chatId, userId);

    if (!member) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'CHAT_ACCESS_DENIED',
                message: 'You are not a member of this chat'
            }
        });
    }

    const chatType = db.prepare(`
        SELECT c.type
        FROM chats c
        JOIN chat_members member ON member.chat_id = c.id
        WHERE c.id = ? AND member.user_id = ?
    `).get(chatId, userId)?.type;
    if (chatType === 'private') {
        const peer = db.prepare(`SELECT user_id FROM chat_members WHERE chat_id = ? AND user_id <> ? LIMIT 1`).get(chatId, userId);
        if (peer && db.prepare(`SELECT 1 FROM blocked_users WHERE (user_id = ? AND blocked_user_id = ?) OR (user_id = ? AND blocked_user_id = ?) LIMIT 1`).get(userId, peer.user_id, peer.user_id, userId)) {
            return res.status(403).json({ success: false, error: { code: 'USER_BLOCKED', message: 'This message could not be sent because this contact is blocked.' } });
        }
    }
    const mentionNames = chatType === 'group'
        ? [...new Set([...messageBody.matchAll(/@([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)/g)].map(match => match[1].toLowerCase()))].slice(0, 30)
        : [];
    const mentionUserIds = mentionNames.map(username => db.prepare(`
        SELECT member.user_id
        FROM chat_members member
        JOIN users mentioned_user ON mentioned_user.id = member.user_id
        WHERE member.chat_id = ?
          AND member.user_id <> ?
          AND lower(mentioned_user.username) = ?
        LIMIT 1
    `).get(chatId, userId, username)?.user_id).filter(Boolean);

    const result = db.transaction(() => {
        const inserted = db.prepare(`
            INSERT INTO messages (chat_id, sender_id, message_type, body, is_read)
            VALUES (?, ?, ?, ?, 0)
        `).run(chatId, userId, messageType, messageBody);
        const addMention = db.prepare('INSERT OR IGNORE INTO message_mentions (message_id, user_id) VALUES (?, ?)');
        mentionUserIds.forEach(mentionedUserId => addMention.run(inserted.lastInsertRowid, mentionedUserId));
        db.prepare('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(chatId);
        return inserted;
    })();

    const message = db.prepare(`
        SELECT
            m.id,
            m.chat_id,
            m.sender_id,
            m.message_type,
            m.body,
            m.media_url,
            m.reply_to,
            m.is_read,
            m.created_at,

            u.username AS sender_username,
            u.display_name AS sender_display_name,
            u.profile_picture AS sender_profile_picture,
            u.phone_verified_at AS sender_phone_verified_at

        FROM messages m

        INNER JOIN users u
            ON u.id = m.sender_id

        WHERE m.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
        success: true,
        message
    });
});

/*
 * PATCH /api/v1/messages/:chatId/read
 * Mark messages received by the authenticated user as read.
 */
router.patch('/:chatId/read', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const chatId = Number(req.params.chatId);

    if (!Number.isInteger(chatId) || chatId <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_CHAT_ID',
                message: 'Invalid chat ID'
            }
        });
    }

    const member = db.prepare(`
        SELECT 1
        FROM chat_members
        WHERE chat_id = ?
          AND user_id = ?
        LIMIT 1
    `).get(chatId, userId);

    if (!member) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'CHAT_ACCESS_DENIED',
                message: 'You are not a member of this chat'
            }
        });
    }

    const result = db.prepare(`
        UPDATE messages
        SET is_read = 1
        WHERE chat_id = ?
          AND sender_id != ?
          AND is_read = 0
    `).run(chatId, userId);
    db.prepare(`
        UPDATE chat_members
        SET last_read_message_id = COALESCE(
            (SELECT MAX(id) FROM messages WHERE chat_id = ?),
            last_read_message_id
        )
        WHERE chat_id = ? AND user_id = ?
    `).run(chatId, chatId, userId);
    db.prepare('DELETE FROM message_mentions WHERE user_id = ? AND message_id IN (SELECT id FROM messages WHERE chat_id = ?)').run(userId, chatId);

    res.json({
        success: true,
        updated: result.changes
    });
});

module.exports = router;
