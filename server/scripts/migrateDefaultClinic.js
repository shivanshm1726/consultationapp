import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Call from '../models/Call.js';
import Message from '../models/Message.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor_consultation';

const migrate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Migration');

    // 1. Create or Find the Default Clinic
    let defaultClinic = await Clinic.findOne({ name: 'Default Medical Clinic' });
    if (!defaultClinic) {
      defaultClinic = await Clinic.create({
        name: 'Default Medical Clinic',
        subscriptionPlan: 'pro',
        limits: { maxDoctors: 10, maxPatients: 5000 },
      });
      console.log('Created Default Clinic:', defaultClinic._id);
    } else {
      console.log('Default Clinic already exists:', defaultClinic._id);
    }

    const clinicId = defaultClinic._id;

    // 2. Assign clinicId to all Users (excluding superadmins if any, but currently none exist)
    const userResult = await User.updateMany(
      { clinicId: { $exists: false } },
      { $set: { clinicId } }
    );
    console.log(`Updated ${userResult.modifiedCount} Users.`);

    // 3. Assign clinicId to Patients
    const patientResult = await Patient.updateMany(
      { clinicId: { $exists: false } },
      { $set: { clinicId } }
    );
    console.log(`Updated ${patientResult.modifiedCount} Patients.`);

    // 4. Assign clinicId to Appointments
    const apptResult = await Appointment.updateMany(
      { clinicId: { $exists: false } },
      { $set: { clinicId } }
    );
    console.log(`Updated ${apptResult.modifiedCount} Appointments.`);

    // 5. Calls & Messages
    const callResult = await Call.updateMany(
      { clinicId: { $exists: false } },
      { $set: { clinicId } }
    );
    const msgResult = await Message.updateMany(
      { clinicId: { $exists: false } },
      { $set: { clinicId } }
    );
    console.log(`Updated ${callResult.modifiedCount} Calls and ${msgResult.modifiedCount} Messages.`);

    // Bonus: Elevate 'doctor@medicalclinic.com' to superadmin just so the user has full access if needed
    await User.updateOne({ email: 'doctor@medicalclinic.com' }, { role: 'superadmin' });
    console.log('Elevated doctor@medicalclinic.com to superadmin.');

    console.log('Migration Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
