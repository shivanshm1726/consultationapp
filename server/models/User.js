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
    enum: ['superadmin', 'admin', 'receptionist', 'patient'],
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
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
