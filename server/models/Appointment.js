import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String, // HH:mm format
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  priority: {
    type: String,
    enum: ['normal', 'emergency'],
    default: 'normal',
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
  recurrenceEndDate: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  amount: {
    type: Number,
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
  },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
