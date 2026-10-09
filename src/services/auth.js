const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function hashPassword(password) {
    return bcrypt.hashSync(password, 12);
}

function verifyPassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
}

function createToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d'
        }
    );
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
    hashPassword,
    verifyPassword,
    createToken,
    verifyToken
};
