const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Course = require('../models/Course');
const { getEligibleContacts, canStartDirectChat } = require('../services/messagingAccess.service');
const { getIO } = require('../socket');

exports.createOrGetChat = async (req, res) => {
  try {
    const { participants, type = 'one-to-one', title } = req.body;
    const allParticipants = Array.isArray(participants) ? participants : [];
    if (!allParticipants.includes(req.user.id)) allParticipants.push(req.user.id);

    if (type !== 'one-to-one' || allParticipants.length !== 2) return res.status(400).json({ msg: 'Only one-to-one chats are supported' });
    const recipientId = allParticipants.find((id) => String(id) !== String(req.user.id));
    const allowed = await canStartDirectChat({ requesterId: req.user.id, requesterRole: req.user.role, recipientId, Course, User });
    if (!allowed) return res.status(403).json({ msg: 'You can message only people in your shared courses' });
    
    if (type === 'one-to-one') {
      let existing = await Chat.findOne({ type: 'one-to-one', participants: { $all: allParticipants, $size: 2 } }).populate('participants', 'name email role');
      if (existing) {
        // If chat was previously deleted for requester, un-delete it for them so it appears again
        if (existing.deletedFor?.map(String).includes(req.user.id)) {
          existing.deletedFor = existing.deletedFor.filter((id) => String(id) !== String(req.user.id));
          await existing.save();
        }
        return res.json(existing);
      }
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
    const chats = await Chat.find({
      participants: req.user.id,
      deletedFor: { $ne: req.user.id }
    }).sort({ lastMessageAt: -1 }).populate('participants', 'name email role');
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

exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const mode = req.query.mode || req.body.mode || 'me'; // 'me' | 'everyone'
    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    
    const isParticipant = chat.participants.map(p => p.toString()).includes(req.user.id);
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const io = getIO();

    if (mode === 'everyone') {
      // Delete chat document and all its messages
      await Message.deleteMany({ chat: id });
      await Chat.findByIdAndDelete(id);

      if (io) {
        io.to(String(id)).emit('chat_deleted', { chatId: id, mode: 'everyone' });
        chat.participants.forEach((pId) => {
          io.to(String(pId)).emit('chat_deleted', { chatId: id, mode: 'everyone' });
        });
      }
      return res.json({ msg: 'Chat deleted for everyone', chatId: id, mode: 'everyone' });
    } else {
      // Delete for me: add req.user.id to deletedFor arrays
      if (!chat.deletedFor.map(String).includes(req.user.id)) {
        chat.deletedFor.push(req.user.id);
        await chat.save();
      }
      await Message.updateMany({ chat: id }, { $addToSet: { deletedFor: req.user.id } });

      if (io) {
        io.to(String(req.user.id)).emit('chat_deleted', { chatId: id, mode: 'me' });
      }
      return res.json({ msg: 'Chat deleted for you', chatId: id, mode: 'me' });
    }
  } catch (err) {
    console.error('chat.deleteChat', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
