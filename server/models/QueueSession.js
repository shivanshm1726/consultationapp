import mongoose from 'mongoose';

const queueSessionSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  activeToken: {
    type: Number,
    default: 0 // 0 means haven't started yet
  },
  maxTokenIssued: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model('QueueSession', queueSessionSchema);
