import DoctorSchedule from '../models/DoctorSchedule.js';
import User from '../models/User.js';

export const getClinicSchedules = async (req, res) => {
  try {
    // Only grab schedules for doctors in same clinic
    // If clinicId isn't strict, we fetch all schedules the user is allowed to see.
    // For now, fetch all schedules.
    const schedules = await DoctorSchedule.find().populate('doctorId', 'fullName specialization email');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, slotDuration, weeklySchedule } = req.body;

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Valid doctor not found' });
    }

    // Default clinicId fallback if not heavily strictly defined
    const clinicId = doctor.clinicId || (req.user && req.user.clinicId) || doctorId;

    const updatedSchedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId },
      {
        doctorId,
        clinicId,
        slotDuration,
        weeklySchedule
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(updatedSchedule);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
