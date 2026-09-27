const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Course = require('../models/Course');
const { getEligibleContacts, canStartDirectChat } = require('../services/messagingAccess.service');

exports.createOrGetChat = async (req, res) => {
  try {
    const { participants, type = 'one-to-one', title } = req.body;
    // participants should include requester if creating
    const allParticipants = Array.isArray(participants) ? participants : [];
    if (!allParticipants.includes(req.user.id)) allParticipants.push(req.user.id);

    // For one-to-one, try to reuse existing chat
    if (type !== 'one-to-one' || allParticipants.length !== 2) return res.status(400).json({ msg: 'Only one-to-one chats are supported' });
    const recipientId = allParticipants.find((id) => String(id) !== String(req.user.id));
    const allowed = await canStartDirectChat({ requesterId: req.user.id, requesterRole: req.user.role, recipientId, Course, User });
    if (!allowed) return res.status(403).json({ msg: 'You can message only people in your shared courses' });
    if (type === 'one-to-one') {
      const existing = await Chat.findOne({ type: 'one-to-one', participants: { $all: allParticipants, $size: 2 } }).populate('participants', 'name email role');
      if (existing) return res.json(existing);
    }

    let chat = await Chat.create({ participants: allParticipants, type: type || 'one-to-one', title });
    chat = await chat.populate('participants', 'name email role');
    res.status(201).json(chat);
  } catch (err) {
    console.error('chat.createOrGetChat', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id }).sort({ lastMessageAt: -1 }).populate('participants', 'name email role');
    res.json(chats);
  } catch (err) {
    console.error('chat.listUserChats', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.listEligibleContacts = async (req, res) => {
  try {
    const contacts = await getEligibleContacts({ userId: req.user.id, role: req.user.role, Course, User });
    res.json(contacts);
  } catch (err) {
    console.error('chat.listEligibleContacts', err);
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
