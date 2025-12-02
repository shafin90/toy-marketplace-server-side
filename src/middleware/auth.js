const { verifyToken, extractToken } = require('../utils/jwt');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
const authenticate = (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const decoded = verifyToken(token);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(401).send({ message: error.message || 'Invalid token' });
    }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token, but attaches user if token is valid
 */
const optionalAuth = (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const decoded = verifyToken(token);
            req.user = decoded;
        }
    } catch (error) {
        // Ignore errors for optional auth
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuth
};

