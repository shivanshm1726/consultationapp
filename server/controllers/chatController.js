import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId, text, mediaUrl, mediaType, fileName, receiverId } = req.body;
    const message = await Message.create({
      roomId,
      senderId: req.user.id,
      receiverId: receiverId || req.user.id, // Fallback if missing, but should be sent
      text,
      mediaUrl,
      mediaType,
      fileName,
    });
    
    // Broadcast message
    const io = req.app.get('io');
    if (io) {
       io.to(roomId).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: "$roomId",
          lastMessage: { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" },
          messageCount: { $sum: 1 },
          attachments: { $sum: { $cond: [{ $ifNull: ["$mediaUrl", false] }, 1, 0] } }
      }},
      { $sort: { lastTimestamp: -1 } }
    ]);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
