const express = require('express');

const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function getUser(userId) {
    return db.prepare(`
        SELECT
            id,
            username,
            display_name,
            phone,
            email,
            profile_picture,
            about,
            status,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
    `).get(userId);
}

/*
 * GET /api/v1/users/me
 */
router.get('/me', requireAuth, (req, res) => {
    const user = getUser(req.user.userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'USER_NOT_FOUND',
                message: 'User not found'
            }
        });
    }

    res.json({
        success: true,
        user
    });
});

/*
 * PATCH /api/v1/users/me
 *
 * Editable:
 * - username
 * - display_name
 * - email
 * - about
 * - status
 *
 * Phone number is intentionally not editable here.
 */
router.patch('/me', requireAuth, (req, res) => {
    const allowedFields = [
        'username',
        'display_name',
        'email',
        'about',
        'status'
    ];

    const updates = {};
    const body = req.body || {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            updates[field] = body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'NO_CHANGES',
                message: 'No editable profile fields were provided'
            }
        });
    }

    if (updates.username !== undefined) {
        if (
            typeof updates.username !== 'string' ||
            !/^[a-zA-Z0-9_.]{3,30}$/.test(updates.username)
        ) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USERNAME',
                    message:
                        'Username must be 3-30 characters and contain only letters, numbers, underscores, or dots'
                }
            });
        }

        updates.username = updates.username.trim();
    }

    if (updates.display_name !== undefined) {
        if (
            typeof updates.display_name !== 'string' ||
            updates.display_name.trim().length < 1 ||
            updates.display_name.trim().length > 80
        ) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DISPLAY_NAME',
                    message:
                        'Display name must be between 1 and 80 characters'
                }
            });
        }

        updates.display_name = updates.display_name.trim();
    }

    if (updates.email !== undefined) {
        if (updates.email === null || updates.email === '') {
            updates.email = null;
        } else if (
            typeof updates.email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                updates.email.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_EMAIL',
                    message: 'Please provide a valid email address'
                }
            });
        } else {
            updates.email = updates.email.trim().toLowerCase();
        }
    }

    if (updates.about !== undefined) {
        if (
            typeof updates.about !== 'string' ||
            updates.about.length > 140
        ) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ABOUT',
                    message: 'About must be 140 characters or less'
                }
            });
        }

        updates.about = updates.about.trim();
    }

    if (updates.status !== undefined) {
        const allowedStatuses = [
            'online',
            'offline',
            'busy',
            'away'
        ];

        if (
            typeof updates.status !== 'string' ||
            !allowedStatuses.includes(
                updates.status.toLowerCase()
            )
        ) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message:
                        'Status must be online, offline, busy, or away'
                }
            });
        }

        updates.status = updates.status.toLowerCase();
    }

    try {
        const fields = Object.keys(updates);

        const setClause = fields
            .map(field => `${field} = @${field}`)
            .join(', ');

        const statement = db.prepare(`
            UPDATE users
            SET
                ${setClause},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @userId
        `);

        statement.run({
            ...updates,
            userId: req.user.userId
        });

        const user = getUser(req.user.userId);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        if (
            error.code === 'SQLITE_CONSTRAINT_UNIQUE'
        ) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'PROFILE_ALREADY_EXISTS',
                    message:
                        'That username or email is already in use'
                }
            });
        }

        console.error(
            'PROFILE_UPDATE_ERROR:',
            error
        );

        res.status(500).json({
            success: false,
            error: {
                code: 'PROFILE_UPDATE_FAILED',
                message: 'Unable to update profile'
            }
        });
    }
});

module.exports = router;
