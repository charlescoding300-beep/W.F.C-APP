const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const db = require('../database/db');

const {
    hashPassword,
    createToken
} = require('../services/auth');

const router = express.Router();

function normalizePhone(phone) {
    return String(phone || '').trim();
}

function generateCode() {
    return crypto
        .randomInt(10000000, 100000000)
        .toString();
}

function generateUsername() {
    return `wfc_${crypto
        .randomBytes(6)
        .toString('hex')}`;
}


/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
|
| This is the REAL backend entry point for the WFC button.
|
*/

router.post('/start', (req, res) => {

    const sessionId = crypto
        .randomBytes(32)
        .toString('hex');

    res.cookie?.();

    return res.json({
        success: true,
        session_id: sessionId,
        next: 'phone'
    });
});


/*
|--------------------------------------------------------------------------
| REQUEST PHONE CODE
|--------------------------------------------------------------------------
*/

router.post('/request-code', (req, res) => {

    const phone = normalizePhone(req.body.phone);

    if (!phone) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'PHONE_REQUIRED',
                message: 'Phone number is required'
            }
        });
    }

    if (phone.length < 7 || phone.length > 20) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_PHONE',
                message: 'Invalid phone number'
            }
        });
    }

    const code = generateCode();

    const codeHash = hashPassword(code);

    db.prepare(`
        DELETE FROM phone_verifications
        WHERE phone = ?
        AND verified = 0
    `).run(phone);

    db.prepare(`
        INSERT INTO phone_verifications
        (
            phone,
            code_hash,
            expires_at,
            attempts,
            verified
        )
        VALUES (
            ?,
            ?,
            datetime('now', '+10 minutes'),
            0,
            0
        )
    `).run(
        phone,
        codeHash
    );

    console.log(
        `[WFC AUTH] Verification code for ${phone}: ${code}`
    );

    const response = {
        success: true,
        message: 'Verification code created',
        expires_in: 600
    };

    /*
     * Development only.
     * In production this must be replaced with an SMS provider.
     */

    if (process.env.NODE_ENV !== 'production') {
        response.development_code = code;
    }

    return res.json(response);
});


/*
|--------------------------------------------------------------------------
| VERIFY CODE
|--------------------------------------------------------------------------
*/

router.post('/verify-code', (req, res) => {

    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();

    if (!phone || !code) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'MISSING_FIELDS',
                message:
                    'Phone number and verification code are required'
            }
        });
    }

    if (!/^\d{8}$/.test(code)) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_CODE',
                message:
                    'Verification code must contain 8 digits'
            }
        });
    }

    const verification = db.prepare(`
        SELECT *
        FROM phone_verifications
        WHERE phone = ?
        AND verified = 0
        ORDER BY id DESC
        LIMIT 1
    `).get(phone);

    if (!verification) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'CODE_NOT_FOUND',
                message:
                    'No active verification code found'
            }
        });
    }

    if (verification.attempts >= 5) {
        return res.status(429).json({
            success: false,
            error: {
                code: 'TOO_MANY_ATTEMPTS',
                message:
                    'Too many verification attempts'
            }
        });
    }

    if (
        new Date(verification.expires_at + 'Z')
        < new Date()
    ) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'CODE_EXPIRED',
                message:
                    'Verification code has expired'
            }
        });
    }

    db.prepare(`
        UPDATE phone_verifications
        SET attempts = attempts + 1
        WHERE id = ?
    `).run(verification.id);

    if (
        !bcrypt.compareSync(
            code,
            verification.code_hash
        )
    ) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_CODE',
                message:
                    'Incorrect verification code'
            }
        });
    }

    db.prepare(`
        UPDATE phone_verifications
        SET verified = 1
        WHERE id = ?
    `).run(verification.id);


    /*
     * Find existing account
     */

    let user = db.prepare(`
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
        WHERE phone = ?
    `).get(phone);


    /*
     * Create account if this is a new number
     */

    let isNewUser = false;

    if (!user) {

        isNewUser = true;

        const username =
            generateUsername();

        const internalPassword =
            crypto.randomBytes(32).toString('hex');

        const passwordHash =
            hashPassword(internalPassword);

        const result = db.prepare(`
            INSERT INTO users
            (
                username,
                display_name,
                phone,
                password_hash,
                about,
                status
            )
            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
        `).run(
            username,
            '',
            phone,
            passwordHash,
            'Hey! I am using WFC.',
            'online'
        );

        user = db.prepare(`
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
        `).get(result.lastInsertRowid);
    }


    /*
     * Create real authentication token
     */

    const token = createToken(user);


    return res.json({
        success: true,

        message: 'Phone verified successfully',

        token,

        is_new_user: isNewUser,

        next: isNewUser
            ? 'profile'
            : 'app',

        user
    });
});


module.exports = router;
