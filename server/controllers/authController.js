import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, fullName, age, phone, clinicId } = req.body;
    
    // Import Clinic dynamically or at top-level (will import at top)
    // Actually, to avoid breaking, let's just do it directly.

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Find default clinic if none provided
    let assignedClinicId = clinicId;
    if (!assignedClinicId) {
      const { default: Clinic } = await import('../models/Clinic.js');
      const defaultClinic = await Clinic.findOne({ name: 'Default Medical Clinic' });
      if (defaultClinic) assignedClinicId = defaultClinic._id;
    }

    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      age,
      phone,
      clinicId: assignedClinicId,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        clinicId: user.clinicId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoleByEmail = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.age = req.body.age || user.age;
      user.phone = req.body.phone || user.phone;
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        age: updatedUser.age,
        phone: updatedUser.phone,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(404).json({ message: 'Doctor not found or unauthorized' });
    }
    
    // Accept explicit boolean if sent, otherwise toggle current status
    if (req.body.isAvailableOnline !== undefined) {
      user.isAvailableOnline = req.body.isAvailableOnline;
    } else {
      user.isAvailableOnline = !user.isAvailableOnline;
    }
    
    const updatedUser = await user.save();
    res.json({ isAvailableOnline: updatedUser.isAvailableOnline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
