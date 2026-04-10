import DoctorSchedule from '../models/DoctorSchedule.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// Helper to convert "HH:mm" to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to convert minutes to "HH:mm"
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// @desc    Get or Create Doctor Schedule
// @route   GET /api/schedule/:doctorId
// @access  Private
export const getSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    let schedule = await DoctorSchedule.findOne({ doctorId });
    
    if (!schedule) {
      // If doctor is looking for their own schedule but it doesn't exist, create default
      if (req.user._id.toString() === doctorId || req.user.role === 'superadmin') {
        const doc = await User.findById(doctorId);
        if(!doc) return res.status(404).json({message: "Doctor not found"});
        
        schedule = await DoctorSchedule.create({
          doctorId,
          clinicId: doc.clinicId
        });
      } else {
        return res.status(404).json({ message: 'Schedule not found' });
      }
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Doctor Schedule
// @route   PUT /api/schedule/:doctorId
// @access  Private (Doctor/Admin)
export const updateSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== doctorId) {
       return res.status(403).json({ message: 'Unauthorized to edit this schedule' });
    }

    const { weeklySchedule, slotDuration } = req.body;

    const schedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId },
      { $set: { weeklySchedule, slotDuration } },
      { new: true, upsert: true }
    );

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Available Slots for a specific Date
// @route   GET /api/schedule/slots/:doctorId?date=YYYY-MM-DD
// @access  Public/Private
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    
    if (!date) return res.status(400).json({ message: 'Date is required format YYYY-MM-DD' });

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // 1. Fetch Schedule
    const schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule) return res.json([]);

    const daySchedule = schedule.weeklySchedule[dayOfWeek];
    if (!daySchedule || !daySchedule.isWorkingDay) {
      return res.json([]); // Not a working day
    }

    // 2. Determine slot definitions
    const startMins = timeToMinutes(daySchedule.startTime);
    const endMins = timeToMinutes(daySchedule.endTime);
    const duration = schedule.slotDuration || 30;

    // Generate all possible slots
    let possibleSlots = [];
    for (let m = startMins; m + duration <= endMins; m += duration) {
       possibleSlots.push({
         time: minutesToTime(m),
         inMinutes: m,
         available: true
       });
    }

    // 3. Fetch Existing Appointments for conflict detection
    // Boundary of the exact day
    const startOfDay = new Date(targetDate.setHours(0,0,0,0));
    const endOfDay = new Date(targetDate.setHours(23,59,59,999));

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    // We assume appointmentDate holds the exact DateTime of the booking
    const bookedMins = bookedAppointments.map(appt => {
      const d = new Date(appt.appointmentDate);
      return d.getHours() * 60 + d.getMinutes();
    });

    // Mark unavailable
    // If a booked slot falls inside our possible slots interval, mark it false
    possibleSlots = possibleSlots.map(slot => {
       // Simple conflict: if any booking exactly matches or lands inside this slot span
       const conflict = bookedMins.some(bMin => bMin >= slot.inMinutes && bMin < slot.inMinutes + duration);
       if (conflict) slot.available = false;
       return slot;
    });

    res.json(possibleSlots.filter(s => s.available));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
