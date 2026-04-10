import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
  limits: {
    maxDoctors: { type: Number, default: 1 },
    maxPatients: { type: Number, default: 50 },
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.model('Clinic', clinicSchema);
