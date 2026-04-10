import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'file'],
  },
  fileName: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
