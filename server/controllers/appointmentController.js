import Appointment from '../models/Appointment.js';
import DoctorSchedule from '../models/DoctorSchedule.js';

export const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, reason, amount } = req.body;
    const appointment = await Appointment.create({
      clinicId: req.clinicId || (req.user && req.user.clinicId),
      patientId,
      userId: req.user._id,
      doctorId,
      appointmentDate,
      timeSlot,
      reason,
      status: 'scheduled',
      amount,
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // format: "YYYY-MM-DD"

    if (!date) return res.status(400).json({ message: "Date is required" });

    const scheduleDate = new Date(date);
    const dayOfWeek = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule || !schedule.weeklySchedule[dayOfWeek] || !schedule.weeklySchedule[dayOfWeek].isWorkingDay) {
       return res.json([]); 
    }

    const { startTime, endTime } = schedule.weeklySchedule[dayOfWeek];
    const slotDuration = schedule.slotDuration || 30;

    const slots = [];
    let [startHour, startMin] = startTime.split(':').map(Number);
    let [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentSlot = new Date(scheduleDate);
    currentSlot.setHours(startHour, startMin, 0, 0);

    const endTimeObj = new Date(scheduleDate);
    endTimeObj.setHours(endHour, endMin, 0, 0);

    while (currentSlot < endTimeObj) {
      const timeString = currentSlot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      slots.push({ time: timeString, available: true });
      currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
    }

    const nextDay = new Date(scheduleDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: scheduleDate, $lt: nextDay },
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = bookedAppointments.map(app => app.timeSlot);

    const finalSlots = slots.map(slot => {
      if (bookedTimes.includes(slot.time)) slot.available = false;
      return slot;
    });

    res.json(finalSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id }).populate('patientId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'superadmin' ? {} : { clinicId: req.clinicId };
    const appointments = await Appointment.find(query).populate('patientId').populate('userId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, paymentStatus },
      { new: true }
    );
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLastMonthAppointments = async (req, res) => {
  try {
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const query = {
      appointmentDate: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
    };
    if (req.user.role !== 'superadmin') {
      query.clinicId = req.clinicId;
    }

    const result = await Appointment.deleteMany(query);

    res.json({ message: `Deleted ${result.deletedCount} appointments` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

