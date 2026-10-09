const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes =
    require('./routes/auth');

const userRoutes =
    require('./routes/users');

const profileRoutes =
    require('./routes/profiles');

const contactRoutes =
    require('./routes/contacts');

const chatRoutes =
    require('./routes/chats');

const messageRoutes =
    require('./routes/messages');

const aiRoutes =
    require('./routes/ai');

const blockRoutes =
    require('./routes/blocks');

const mediaRoutes =
    require('./routes/media');

const {
    requestId,
    notFound,
    errorHandler
} = require('./middleware/global');

const app = express();

app.disable('x-powered-by');

app.use(requestId);

app.use(helmet({
    contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
            ? undefined
            : false
}));

app.use(cors());

app.use(express.json({
    limit: '2mb'
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(
    '/uploads',
    express.static(
        path.join(
            __dirname,
            '..',
            'uploads'
        )
    )
);

app.use(
    express.static(
        path.join(
            __dirname,
            '..',
            'public'
        )
    )
);


/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

app.get(
    '/api/v1/health',
    (req, res) => {
        res.json({
            success: true,
            app: 'WFC',
            message:
                'WFC backend is running',
            version: 'v1',
            request_id:
                req.requestId
        });
    }
);


/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use(
    '/api/v1/auth',
    authRoutes
);

app.use(
    '/api/v1/users',
    userRoutes
);


/*
|--------------------------------------------------------------------------
| Future-ready modules
|--------------------------------------------------------------------------
*/

app.use(
    '/api/v1/profiles',
    profileRoutes
);

app.use(
    '/api/v1/contacts',
    contactRoutes
);

app.use(
    '/api/v1/chats',
    chatRoutes
);

app.use(
    '/api/v1/messages',
    messageRoutes
);

app.use(
    '/api/v1/ai',
    aiRoutes
);

app.use(
    '/api/v1/blocks',
    blockRoutes
);

app.use(
    '/api/v1/media',
    mediaRoutes
);


/*
|--------------------------------------------------------------------------
| API 404
|--------------------------------------------------------------------------
*/

app.use(
    '/api',
    notFound
);


/*
|--------------------------------------------------------------------------
| Global error handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

module.exports = app;
