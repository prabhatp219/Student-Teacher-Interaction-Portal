const Notification = require('../models/Notification');

exports.listForUser = async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json(items);
  } catch (err) {
    console.error('notification.listForUser', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { read: true });
    res.json({ msg: 'Marked' });
  } catch (err) {
    console.error('notification.markRead', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ msg: 'All marked' });
  } catch (err) {
    console.error('notification.markAllRead', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
