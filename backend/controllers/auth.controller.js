const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const JWT_EXP = '7d'; // adjust as needed
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, meta } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, department, meta });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXP });
    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error('auth.register', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Missing fields', message: 'Missing fields' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials', message: 'Invalid credentials' });

    if (user.isActive === false) {
      return res.status(403).json({
        msg: 'Your account has been deactivated. Please contact the administrator.',
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials', message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXP });
    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    res.json({ token, user: userSafe, isFirstLogin: !!user.isFirstLogin });
  } catch (err) {
    console.error('auth.login', err);
    res.status(500).json({ msg: 'Server error', message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ msg: 'Google credential is required', message: 'Google credential is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({ msg: 'Invalid or expired Google token', message: 'Invalid or expired Google token' });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ msg: 'Invalid Google account payload', message: 'Invalid Google account payload' });
    }

    if (!payload.email_verified) {
      return res.status(403).json({ msg: 'Google email is not verified', message: 'Google email is not verified' });
    }

    const verifiedGoogleEmail = payload.email.toLowerCase().trim();
    const googleId = payload.sub;

    // Search existing EduHub user collection
    const user = await User.findOne({ email: verifiedGoogleEmail });

    // CRITICAL: DO NOT automatically create a new EduHub user
    if (!user) {
      return res.status(403).json({
        msg: 'You are not registered with EduHub. Please contact the administrator.',
        message: 'You are not registered with EduHub. Please contact the administrator.'
      });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({
        msg: 'Your account has been deactivated. Please contact the administrator.',
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Link googleId if not yet set
    if (!user.googleId && googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // Generate standard EduHub JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXP }
    );

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    res.json({
      token,
      user: userSafe,
      isFirstLogin: !!user.isFirstLogin
    });
  } catch (err) {
    console.error('auth.googleLogin', err);
    res.status(500).json({ msg: 'Server error', message: 'Server error' });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        msg: 'Password must be at least 6 characters',
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found', message: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.isFirstLogin = false;
    await user.save();

    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    res.json({
      msg: 'Password updated successfully',
      message: 'Password updated successfully',
      user: userSafe
    });
  } catch (err) {
    console.error('auth.setPassword', err);
    res.status(500).json({ msg: 'Server error', message: 'Server error' });
  }
};


exports.refresh = async (req, res) => {
  // simple refresh pattern — you can implement refresh tokens later
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: 'No token' });
    if (!authHeader.startsWith("Bearer ")) {
  return res.status(401).json({ msg: "Invalid token format" });
}
const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    const newToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXP });
    res.json({ token: newToken });
  } catch (err) {
    console.error('auth.refresh', err);
    res.status(401).json({ msg: 'Invalid token' });
  }
};

exports.logout = async (req, res) => {
  // stateless JWT: nothing to do here unless you maintain a blacklist
  res.json({ msg: 'Logged out (client should discard token)' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('auth.getMe', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
