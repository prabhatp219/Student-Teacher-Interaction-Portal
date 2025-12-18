// backend/middleware/rbac.js
exports.requireRole = (allowed = []) => (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
    if (!Array.isArray(allowed) || allowed.length === 0) return next();
    if (allowed.includes(req.user.role)) return next();
    return res.status(403).json({ msg: 'Forbidden: insufficient permission' });
  } catch (err) {
    console.error('rbac middleware error', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
