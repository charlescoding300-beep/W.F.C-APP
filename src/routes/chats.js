const express = require('express');

const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/*
 * GET /api/v1/chats
 * Return all chats belonging to the authenticated user.
 */
router.get('/', requireAuth, (req, res) => {
    const userId = req.user.userId;

    const chats = db.prepare(`
        SELECT
            c.id,
            c.type,
            c.name,
            c.picture,
            c.created_at,
            c.updated_at,

            other.id AS other_user_id,
            other.username AS other_username,
            other.display_name AS other_display_name,
            other.profile_picture AS other_profile_picture,
            other.about AS other_about,
            other.status AS other_status,

            last_message.id AS last_message_id,
            last_message.body AS last_message_body,
            last_message.message_type AS last_message_type,
            last_message.sender_id AS last_message_sender_id,
            last_message.created_at AS last_message_created_at

        FROM chats c

        INNER JOIN chat_members mine
            ON mine.chat_id = c.id
            AND mine.user_id = ?

        LEFT JOIN chat_members other_member
            ON other_member.chat_id = c.id
            AND other_member.user_id != ?

        LEFT JOIN users other
            ON other.id = other_member.user_id

        LEFT JOIN messages last_message
            ON last_message.id = (
                SELECT m.id
                FROM messages m
                WHERE m.chat_id = c.id
                ORDER BY m.id DESC
                LIMIT 1
            )

        ORDER BY
            COALESCE(last_message.created_at, c.updated_at) DESC,
            c.id DESC
    `).all(userId, userId);

    res.json({
        success: true,
        chats
    });
});

/*
 * GET /api/v1/chats/:chatId
 * Return one chat if the authenticated user belongs to it.
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

    const chat = db.prepare(`
        SELECT
            c.id,
            c.type,
            c.name,
            c.picture,
            c.created_at,
            c.updated_at,

            other.id AS other_user_id,
            other.username AS other_username,
            other.display_name AS other_display_name,
            other.profile_picture AS other_profile_picture,
            other.about AS other_about,
            other.status AS other_status

        FROM chats c

        INNER JOIN chat_members mine
            ON mine.chat_id = c.id
            AND mine.user_id = ?

        LEFT JOIN chat_members other_member
            ON other_member.chat_id = c.id
            AND other_member.user_id != ?

        LEFT JOIN users other
            ON other.id = other_member.user_id

        WHERE c.id = ?
        LIMIT 1
    `).get(userId, userId, chatId);

    if (!chat) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'CHAT_NOT_FOUND',
                message: 'Chat not found'
            }
        });
    }

    res.json({
        success: true,
        chat
    });
});

/*
 * POST /api/v1/chats/private
 * Create or open a private chat with another user.
 */
router.post('/private', requireAuth, (req, res) => {
    const userId = req.user.userId;
    const otherUserId = Number(req.body?.user_id);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_USER_ID',
                message: 'Invalid user ID'
            }
        });
    }

    if (otherUserId === userId) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'SELF_CHAT_NOT_ALLOWED',
                message: 'You cannot start a private chat with yourself'
            }
        });
    }

    const otherUser = db.prepare(`
        SELECT
            id,
            username,
            display_name,
            profile_picture,
            about,
            status
        FROM users
        WHERE id = ?
    `).get(otherUserId);

    if (!otherUser) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'User not found'
            }
        });
    }

    const existingChat = db.prepare(`
        SELECT c.id
        FROM chats c

        INNER JOIN chat_members m1
            ON m1.chat_id = c.id
            AND m1.user_id = ?

        INNER JOIN chat_members m2
            ON m2.chat_id = c.id
            AND m2.user_id = ?

        WHERE c.type = 'private'
        LIMIT 1
    `).get(userId, otherUserId);

    if (existingChat) {
        const chat = db.prepare(`
            SELECT
                c.id,
                c.type,
                c.name,
                c.picture,
                c.created_at,
                c.updated_at
            FROM chats c
            WHERE c.id = ?
        `).get(existingChat.id);

        return res.json({
            success: true,
            created: false,
            chat,
            other_user: otherUser
        });
    }

    const createChat = db.transaction(() => {
        const chatResult = db.prepare(`
            INSERT INTO chats (
                type
            )
            VALUES ('private')
        `).run();

        const chatId = chatResult.lastInsertRowid;

        db.prepare(`
            INSERT INTO chat_members (
                chat_id,
                user_id
            )
            VALUES (?, ?)
        `).run(chatId, userId);

        db.prepare(`
            INSERT INTO chat_members (
                chat_id,
                user_id
            )
            VALUES (?, ?)
        `).run(chatId, otherUserId);

        return chatId;
    });

    const chatId = createChat();

    const chat = db.prepare(`
        SELECT
            id,
            type,
            name,
            picture,
            created_at,
            updated_at
        FROM chats
        WHERE id = ?
    `).get(chatId);

    res.status(201).json({
        success: true,
        created: true,
        chat,
        other_user: otherUser
    });
});

module.exports = router;
