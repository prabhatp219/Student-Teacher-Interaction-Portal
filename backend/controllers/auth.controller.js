const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_EXP = '7d'; // adjust as needed

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
    if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXP });
    const userSafe = user.toObject();
    delete userSafe.passwordHash;

    res.json({ token, user: userSafe });
  } catch (err) {
    console.error('auth.login', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.refresh = async (req, res) => {
  // simple refresh pattern — you can implement refresh tokens later
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: 'No token' });
    const token = authHeader.split(' ')[1];
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
