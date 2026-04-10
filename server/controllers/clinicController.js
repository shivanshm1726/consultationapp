import Clinic from '../models/Clinic.js';
import User from '../models/User.js';

// @desc    Get all clinics (SuperAdmin only)
// @route   GET /api/clinics
// @access  Private/SuperAdmin
export const getClinics = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized as superadmin' });
    }
    const clinics = await Clinic.find({});
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new clinic (SuperAdmin only)
// @route   POST /api/clinics
// @access  Private/SuperAdmin
export const createClinic = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized as superadmin' });
    }
    const { name, address, contactEmail, contactPhone, subscriptionPlan } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Clinic name is required' });

    const clinic = await Clinic.create({
      name,
      address,
      contactEmail,
      contactPhone,
      subscriptionPlan
    });

    res.status(201).json(clinic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign user to clinic
// @route   PUT /api/clinics/:id/assign
// @access  Private/SuperAdmin
export const assignUserToClinic = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized as superadmin' });
    }
    const { email } = req.body;
    const { id: clinicId } = req.params;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { clinicId } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'Assigned successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
