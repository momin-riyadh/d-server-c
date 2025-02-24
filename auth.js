const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const auth = {
    generateToken(user) {
        return jwt.sign(
            { id: user.id, role: user.role },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
    },

    verifyToken(req, res, next) {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    },

    checkRole(roles) {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
            }
            next();
        };
    }
};

module.exports = auth;