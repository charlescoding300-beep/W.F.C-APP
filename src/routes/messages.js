const express = require('express');

const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

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
            m.created_at,

            u.username AS sender_username,
            u.display_name AS sender_display_name,
            u.profile_picture AS sender_profile_picture

        FROM messages m

        INNER JOIN users u
            ON u.id = m.sender_id

        WHERE m.chat_id = ?

        ORDER BY m.id ASC
    `).all(chatId);

    res.json({
        success: true,
        messages
    });
});

/*
 * POST /api/v1/messages
 * Send a text message.
 */
router.post('/', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const body = req.body || {};

    const chatId = Number(body.chat_id);
    const messageBody =
        typeof body.body === 'string'
            ? body.body.trim()
            : '';

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

    const result = db.prepare(`
        INSERT INTO messages (
            chat_id,
            sender_id,
            message_type,
            body,
            is_read
        )
        VALUES (?, ?, 'text', ?, 1)
    `).run(
        chatId,
        userId,
        messageBody
    );

    db.prepare(`
        UPDATE chats
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(chatId);

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
            u.profile_picture AS sender_profile_picture

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

    res.json({
        success: true,
        updated: result.changes
    });
});

module.exports = router;
