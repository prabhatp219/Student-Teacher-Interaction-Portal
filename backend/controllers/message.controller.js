const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getIO } = require('../socket');

exports.listForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    if (!chat.participants.map(p => p.toString()).includes(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });

    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: req.user.id }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('from', 'name email');
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
    let chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });
    if (!chat.participants.map(p => p.toString()).includes(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });

    // If chat was deleted for any participant, remove them from deletedFor so new messages make chat reappear
    if (chat.deletedFor && chat.deletedFor.length > 0) {
      chat.deletedFor = [];
    }

    let message = await Message.create({
      chat: chatId,
      from: req.user.id,
      text,
      attachments: req.files?.map(f => ({ filename: f.originalname, url: `/uploads/${f.filename}`, mimeType: f.mimetype, size: f.size })) || []
    });
    chat.lastMessageAt = new Date();
    await chat.save();

    // Populate sender details before emitting
    message = await message.populate('from', 'name email');

    // Emit to chat room & participant personal rooms in real time
    const io = getIO();
    if (io) {
      io.to(String(chatId)).emit('new_message', message);
      if (chat.participants) {
        chat.participants.forEach((pId) => {
          io.to(String(pId)).emit('new_message', message);
        });
      }
    }

    res.status(201).json(message);
  } catch (err) {
    console.error('message.postMessage', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });
    if (!message.readBy.map(String).includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }
    res.json(message);
  } catch (err) {
    console.error('message.markRead', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const mode = req.query.mode || req.body.mode || 'me'; // 'me' | 'everyone'
    let message = await Message.findById(id);
    if (!message) return res.status(404).json({ msg: 'Message not found' });

    const chat = await Chat.findById(message.chat);
    if (!chat) return res.status(404).json({ msg: 'Chat not found' });

    const isParticipant = chat.participants.map(p => p.toString()).includes(req.user.id);
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    const io = getIO();

    if (mode === 'everyone') {
      const isSender = String(message.from) === String(req.user.id);
      if (!isSender && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'You can delete for everyone only your own messages' });
      }

      message.isDeletedForEveryone = true;
      message.text = 'This message was deleted';
      message.attachments = [];
      await message.save();

      message = await message.populate('from', 'name email');

      if (io) {
        const payload = { messageId: id, chatId: message.chat, message, mode: 'everyone' };
        io.to(String(message.chat)).emit('message_deleted', payload);
        chat.participants.forEach((pId) => {
          io.to(String(pId)).emit('message_deleted', payload);
        });
      }
      return res.json({ msg: 'Message deleted for everyone', message, mode: 'everyone' });
    } else {
      if (!message.deletedFor.map(String).includes(req.user.id)) {
        message.deletedFor.push(req.user.id);
        await message.save();
      }

      if (io) {
        io.to(String(req.user.id)).emit('message_deleted', { messageId: id, chatId: message.chat, mode: 'me' });
      }
      return res.json({ msg: 'Message deleted for you', messageId: id, mode: 'me' });
    }
  } catch (err) {
    console.error('message.deleteMessage', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
