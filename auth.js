const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Add better SECRET_KEY handling
const SECRET_KEY = process.env.JWT_SECRET;
console.log('JWT_SECRET:', SECRET_KEY); // Temporary debug line

if (!SECRET_KEY) {
    console.error('ERROR: JWT_SECRET is not set in environment variables');
    process.exit(1); // Stop the server if JWT_SECRET is missing
}

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
            console.error('Token verification failed:', error.message);
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