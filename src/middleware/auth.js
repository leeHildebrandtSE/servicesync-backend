// ========================================
// AUTHENTICATION MIDDLEWARE - src/middleware/auth.js
// ========================================

import jwt from 'jsonwebtoken';

// Simple console logging for now (to avoid logger conflicts)
const log = {
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
  debug: (msg) => console.debug(`[DEBUG] ${msg}`)
};

// JWT Authentication Middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    log.warn('Authentication failed: No token provided');
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    log.warn('Authentication failed: Invalid token', error.message);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      log.warn(`Authorization failed: User ${req.user.employeeId} attempted to access ${req.path} with role ${req.user.role}`);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    } catch (error) {
      // Ignore invalid tokens for optional auth
      log.debug('Optional auth: Invalid token ignored');
    }
  }

  next();
};