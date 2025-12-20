const Log = require('../models/Log');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, actor, action, from, to } = req.query;
    const q = {};
    if (actor) q.actor = actor;
    if (action) q.action = action;
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
    const skip = (Number(page) - 1) * Number(limit);
    const items = await Log.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('actor','name email');
    const total = await Log.countDocuments(q);
    res.json({ data: items, total });
  } catch (err) {
    console.error('admin.getLogs', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// importUsers: accepts array of user objects in req.body.users
exports.importUsers = async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ msg: 'users must be an array' });

    const created = [];
    for (const u of users) {
      if (!u.email || !u.name) continue;
      const exists = await User.findOne({ email: u.email });
      if (exists) continue;
      const pwd = u.password || Math.random().toString(36).slice(-8);
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(pwd, 10);
      const newUser = await User.create({ name: u.name, email: u.email, passwordHash, role: u.role || 'student', department: u.department, meta: u.meta });
      created.push(newUser);
    }

    res.json({ created: created.length });
  } catch (err) {
    console.error('admin.importUsers', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    // stub: return simple counts. Replace with richer analytics later.
    const userCount = await User.countDocuments();
    const logsCount = await Log.countDocuments();
    res.json({ users: userCount, logs: logsCount });
  } catch (err) {
    console.error('admin.getReports', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: 'All fields required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('admin.createUser', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash') // never send password hashes
      .sort({ createdAt: 1 });

    res.json(users);
  } catch (err) {
    console.error('admin.getUsers', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
