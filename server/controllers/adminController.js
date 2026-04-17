import User from '../models/User.js';

export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ role: 'doctor', isApproved: false }).select('-password');
    res.json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findById(id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = true;
    await doctor.save();

    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findById(id);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await User.deleteOne({ _id: id });
    
    res.json({ message: 'Doctor application rejected and registration deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
