const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'Not found' });
    res.json(user);
  } catch (err) {
    console.error('user.getMe', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.passwordHash; // password change via dedicated endpoint if you add one
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error('user.updateMe', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Admin-only
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 25, role } = req.query;
    const q = {};
    if (role) q.role = role;
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(q).select('-passwordHash').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(q);
    res.json({ data: users, total });
  } catch (err) {
    console.error('user.listUsers', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('-passwordHash');
    if (!u) return res.status(404).json({ msg: 'Not found' });
    res.json(u);
  } catch (err) {
    console.error('user.getUserById', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.passwordHash;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) {
    console.error('user.updateUser', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error('user.deleteUser', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
