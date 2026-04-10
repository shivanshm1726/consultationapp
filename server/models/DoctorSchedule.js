import mongoose from 'mongoose';

const dayScheduleSchema = new mongoose.Schema({
  isWorkingDay: { type: Boolean, default: true },
  startTime: { type: String, default: "09:00" }, // standard HH:mm format
  endTime: { type: String, default: "17:00" }
}, { _id: false });

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
  },
  slotDuration: {
    type: Number,
    default: 30, // Minutes
  },
  weeklySchedule: {
    monday: { type: dayScheduleSchema, default: () => ({}) },
    tuesday: { type: dayScheduleSchema, default: () => ({}) },
    wednesday: { type: dayScheduleSchema, default: () => ({}) },
    thursday: { type: dayScheduleSchema, default: () => ({}) },
    friday: { type: dayScheduleSchema, default: () => ({}) },
    saturday: { type: dayScheduleSchema, default: () => ({ isWorkingDay: false }) },
    sunday: { type: dayScheduleSchema, default: () => ({ isWorkingDay: false }) },
  }
}, { timestamps: true });

export default mongoose.model('DoctorSchedule', doctorScheduleSchema);
