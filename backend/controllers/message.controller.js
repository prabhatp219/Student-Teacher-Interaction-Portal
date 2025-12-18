const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.listForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    if (!chat.participants.map(p => p.toString()).includes(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });

    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find({ chat: chatId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('from','name email');
    res.json(messages.reverse()); // return in chronological order
  } catch (err) {
    console.error('message.listForChat', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    if (!chat.participants.map(p => p.toString()).includes(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });

    const message = await Message.create({ chat: chatId, from: req.user.id, text, attachments: req.files?.map(f => ({ filename: f.originalname, url: `/uploads/${f.filename}`, mimeType: f.mimetype, size: f.size })) || [] });
    chat.lastMessageAt = new Date();
    await chat.save();

    // NOTE: emit via socket.io in your real app here.

    res.status(201).json(message);
  } catch (err) {
    console.error('message.postMessage', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Not found' });
    if (!message.readBy.map(r => r.toString()).includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }
    res.json({ msg: 'Marked' });
  } catch (err) {
    console.error('message.markRead', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
