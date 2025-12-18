const Announcement = require('../models/Announcement');

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user.id };
    const a = await Announcement.create(payload);
    res.status(201).json(a);
  } catch (err) {
    console.error('announcement.create', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { course, role, department, page = 1, limit = 25 } = req.query;
    const q = {};
    if (course) q.course = course;
    if (role) q.role = role;
    if (department) q.department = department;
    // Only active announcements
    q.$or = [{ startsAt: null }, { startsAt: { $lte: new Date() } }];
    const skip = (Number(page) - 1) * Number(limit);
    const items = await Announcement.find(q).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).populate('createdBy','name email');
    const total = await Announcement.countDocuments(q);
    res.json({ data: items, total });
  } catch (err) {
    console.error('announcement.list', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const a = await Announcement.findById(req.params.id).populate('createdBy','name email');
    if (!a) return res.status(404).json({ msg: 'Not found' });
    res.json(a);
  } catch (err) {
    console.error('announcement.get', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const a = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!a) return res.status(404).json({ msg: 'Not found' });
    res.json(a);
  } catch (err) {
    console.error('announcement.update', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error('announcement.delete', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

