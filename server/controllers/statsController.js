import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Stats calculations
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });
    
    // Revenue from completed appointments
    const completedAppointments = await Appointment.find({ status: 'completed' });
    const doctorFee = 500; // Fallback or from config
    const totalRevenue = completedAppointments.length * doctorFee;

    // Active patients (distinct patientIds in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activePatients = await Appointment.distinct('patientId', {
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalAppointments,
      todayAppointments,
      totalRevenue,
      activePatients: activePatients.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId')
      .sort({ createdAt: -1 })
      .limit(5);

    const activities = appointments.map(app => ({
      id: app._id,
      type: 'appointment',
      patient: app.patientId ? `${app.patientId.firstName} ${app.patientId.lastName}` : 'Unknown Patient',
      time: new Date(app.createdAt).toLocaleTimeString(),
      status: app.status
    }));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getRevenueDetails = async (req, res) => {
  try {
    const appointments = await Appointment.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 });

    const payments = appointments.map(app => ({
      id: app._id,
      patientName: `${app.firstName} ${app.lastName}`,
      contactNumber: app.phone,
      amount: 500, // Default fee
      timeSlot: app.time,
      paymentMethod: 'Online',
      transactionId: app._id.toString().substring(0, 10),
      createdAt: app.createdAt
    }));

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
