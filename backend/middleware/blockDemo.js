// middleware/blockDemo.js
// Blocks any write operations (POST, PUT, PATCH, DELETE) for demo accounts.
// Demo users can still READ (GET) everything — they just can't change data.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Routes that demo users ARE allowed to POST to (login itself must work)
const DEMO_WHITELIST = ['/api/v1/auth/login', '/api/v1/auth/refresh'];

module.exports = async (req, res, next) => {
  // Only block write methods
  if (!WRITE_METHODS.includes(req.method)) return next();

  // Allow login/refresh so demo login itself works
  if (DEMO_WHITELIST.some(path => req.path === path || req.originalUrl.includes(path))) {
    return next();
  }

  // Try to decode token — if none, let auth middleware handle it
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('isDemo');

    if (user && user.isDemo) {
      return res.status(403).json({
        msg: 'Demo accounts are read-only. This action is not allowed in demo mode.',
        isDemo: true
      });
    }
    next();
  } catch (err) {
    // Invalid token — let auth middleware return the proper error
    next();
  }
};

