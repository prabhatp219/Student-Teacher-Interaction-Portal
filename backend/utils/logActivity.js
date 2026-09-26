const Log = require('../models/Log');

/**
 * Log an activity to the database
 * @param {Object} options
 * @param {string|Object} [options.actor] - User ID or User document
 * @param {string} options.action - Action name (e.g., USER_LOGIN, USER_CREATE)
 * @param {Object} [options.meta] - Additional metadata / payload
 * @param {Object} [options.req] - Express request object to extract IP and/or actor
 * @param {string} [options.ip] - Explicit IP override
 */
const logActivity = async ({ actor = null, action, meta = {}, req = null, ip = null }) => {
  try {
    let clientIp = ip;
    if (!clientIp && req) {
      clientIp =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        '';
      if (clientIp === '::1') clientIp = '127.0.0.1';
      else if (clientIp.startsWith('::ffff:')) clientIp = clientIp.replace('::ffff:', '');
    }

    let actorId = null;
    if (actor) {
      actorId = actor._id || actor.id || (typeof actor === 'string' ? actor : null);
    } else if (req && req.user) {
      actorId = req.user._id || req.user.id;
    }

    return await Log.create({
      actor: actorId,
      action,
      meta,
      ip: clientIp || '127.0.0.1',
    });
  } catch (err) {
    // Non-blocking log error
    console.error('Failed to record activity log:', err.message);
  }
};

module.exports = logActivity;
