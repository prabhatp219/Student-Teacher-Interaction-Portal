const Chat = require('../models/Chat');
const Message = require('../models/Message');

exports.createOrGetChat = async (req, res) => {
  try {
    const { participants, type, title } = req.body;
    // participants should include requester if creating
    const allParticipants = Array.isArray(participants) ? participants : [];
    if (!allParticipants.includes(req.user.id)) allParticipants.push(req.user.id);

    // For one-to-one, try to reuse existing chat
    if (type === 'one-to-one' && allParticipants.length === 2) {
      const existing = await Chat.findOne({ type: 'one-to-one', participants: { $all: allParticipants, $size: 2 } });
      if (existing) return res.json(existing);
    }

    const chat = await Chat.create({ participants: allParticipants, type: type || 'one-to-one', title });
    res.status(201).json(chat);
  } catch (err) {
    console.error('chat.createOrGetChat', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id }).sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error('chat.listUserChats', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('participants','name email');
    if (!chat) return res.status(404).json({ msg: 'Not found' });
    if (!chat.participants.map(p => p._id.toString()).includes(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    res.json(chat);
  } catch (err) {
    console.error('chat.getChatById', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
