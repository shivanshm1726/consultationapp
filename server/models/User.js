import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'receptionist', 'patient'],
    default: 'patient',
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: false, // Optional for superadmins, required mathematically for others by controller logic
  },
  isAvailableOnline: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: true, // Will default to true for old users, explicitly set to false for doctors during registration
  },
  specialization: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
