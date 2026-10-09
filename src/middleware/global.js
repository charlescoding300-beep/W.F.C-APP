const crypto = require('crypto');

function requestId(req, res, next) {
    const id =
        req.headers['x-request-id'] ||
        crypto.randomUUID();

    req.requestId = id;
    res.setHeader(
        'X-Request-ID',
        id
    );

    next();
}

function notFound(req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
            request_id: req.requestId
        }
    });
}

function errorHandler(error, req, res, next) {
    console.error(
        `[WFC ERROR] ${req.requestId || '-'}`
    );
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(
        error.statusCode ||
        error.status ||
        500
    ).json({
        success: false,
        error: {
            code:
                error.code ||
                'INTERNAL_ERROR',
            message:
                process.env.NODE_ENV ===
                'production'
                    ? 'Internal server error'
                    : error.message ||
                      'Internal server error',
            request_id:
                req.requestId
        }
    });
}

module.exports = {
    requestId,
    notFound,
    errorHandler
};
