import Message from '../models/Message.js';
import User from '../models/User.js';

// GET /api/chats/:roomId - Fetch all messages for a chat room
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .populate('senderId', 'fullName email role')
      .populate('receiverId', 'fullName email role')
      .sort({ timestamp: 1 });

    const formatted = messages.map(m => ({
      _id: m._id,
      roomId: m.roomId,
      text: m.text || m.message || '',
      senderId: m.senderId?._id || m.senderId,
      senderName: m.senderId?.fullName || 'Unknown',
      senderRole: m.senderId?.role || 'patient',
      receiverId: m.receiverId?._id || m.receiverId,
      receiverName: m.receiverId?.fullName || 'Unknown',
      timestamp: m.timestamp,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      fileName: m.fileName,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/chats - Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { roomId, text, mediaUrl, mediaType, fileName, receiverId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'roomId is required' });
    }

    const message = await Message.create({
      roomId,
      senderId: req.user._id,
      receiverId: receiverId || req.user._id,
      text,
      message: text, // keep both fields in sync
      mediaUrl,
      mediaType,
      fileName,
      clinicId: req.clinicId,
    });

    // Populate sender info before broadcasting
    const populated = await Message.findById(message._id)
      .populate('senderId', 'fullName email role')
      .populate('receiverId', 'fullName email role');

    const formatted = {
      _id: populated._id,
      roomId: populated.roomId,
      text: populated.text || populated.message || '',
      senderId: populated.senderId?._id || populated.senderId,
      senderName: populated.senderId?.fullName || 'Unknown',
      senderRole: populated.senderId?.role || 'patient',
      receiverId: populated.receiverId?._id || populated.receiverId,
      receiverName: populated.receiverId?.fullName || 'Unknown',
      timestamp: populated.timestamp,
      mediaUrl: populated.mediaUrl,
      mediaType: populated.mediaType,
      fileName: populated.fileName,
    };

    // Broadcast via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('new_message', formatted);
    }

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chats/sessions - Get all chat sessions for the current doctor
export const getAllSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchStage = {};

    // For doctors/admins, only show conversations they're part of
    if (userRole === 'doctor' || userRole === 'admin') {
      matchStage = {
        $or: [
          { senderId: userId },
          { receiverId: userId },
        ],
      };
    }

    const sessions = await Message.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: { $ifNull: ['$text', '$message'] } },
          lastTimestamp: { $first: '$timestamp' },
          messageCount: { $sum: 1 },
          // Collect unique participant IDs
          participants: { $addToSet: '$senderId' },
          receivers: { $addToSet: '$receiverId' },
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ]);

    // Collect all unique user IDs to resolve names
    const allUserIds = new Set();
    sessions.forEach(s => {
      s.participants.forEach(id => allUserIds.add(id.toString()));
      s.receivers.forEach(id => allUserIds.add(id.toString()));
    });

    const users = await User.find(
      { _id: { $in: Array.from(allUserIds) } },
      'fullName email role'
    );
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = { fullName: u.fullName, email: u.email, role: u.role };
    });

    // Resolve the "other person" for each session
    const enriched = sessions.map(s => {
      const allIds = [
        ...s.participants.map(id => id.toString()),
        ...s.receivers.map(id => id.toString()),
      ];
      const uniqueIds = [...new Set(allIds)];

      // Find the "other" person (not the current user)
      const otherId = uniqueIds.find(id => id !== userId.toString()) || uniqueIds[0];
      const otherUser = userMap[otherId] || { fullName: 'Unknown Patient', email: '', role: 'patient' };

      return {
        _id: s._id,
        contactName: otherUser.fullName,
        contactEmail: otherUser.email,
        contactRole: otherUser.role,
        contactId: otherId,
        lastMessage: s.lastMessage || 'Media file',
        lastTimestamp: s.lastTimestamp,
        messageCount: s.messageCount,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
