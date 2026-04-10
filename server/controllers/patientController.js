import Patient from '../models/Patient.js';

export const getPatients = async (req, res) => {
  try {
    const query = req.user.role === 'superadmin' ? {} : { clinicId: req.clinicId };
    const patients = await Patient.find(query);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, gender, age } = req.body;

    const patient = await Patient.create({
      linkedToId: req.user._id,
      clinicId: req.clinicId,
      firstName,
      lastName,
      phone,
      email,
      gender,
      age,
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
