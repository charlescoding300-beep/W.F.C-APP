const { verifyToken } = require('../services/auth');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTH_REQUIRED',
                message: 'Authentication required'
            }
        });
    }

    const token = header.slice(7);

    try {
        const payload = verifyToken(token);

        req.user = payload;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired authentication token'
            }
        });
    }
}

module.exports = {
    requireAuth
};
