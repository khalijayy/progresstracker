import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
              message: 'No authentication token, access denied',
              code: 'TOKEN_MISSING'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
              message: 'User not found',
              code: 'USER_NOT_FOUND'
            });
        }

        // Check token expiration
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token format',
                code: 'TOKEN_INVALID'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(401).json({ 
            message: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};