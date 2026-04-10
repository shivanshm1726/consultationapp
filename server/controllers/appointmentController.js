import Appointment from '../models/Appointment.js';

export const createAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate, reason, amount } = req.body;
    const appointment = await Appointment.create({
      clinicId: req.clinicId,
      patientId,
      userId: req.user._id,
      appointmentDate,
      reason,
      amount,
    });
    res.status(201).json(appointment);
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

