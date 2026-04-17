import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config({ path: './.env' });

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        
        // Clean up previous test users to prevent duplicate key errors
        await User.deleteMany({ email: { $in: ['assistant@clinic.com', 'house@clinic.com', 'wilson@clinic.com', 'testpatient@clinic.com'] } });
        
        // Create an Assistant
        const assistant = new User({
            fullName: "Clinic Assistant",
            email: "assistant@clinic.com",
            password: hashedPassword,
            role: "receptionist",
            age: 25,
            phone: "1234567890"
        });
        await assistant.save();
        console.log("Assistant created.");

        // Create Dummy Doctors
        const dr1 = new User({
            fullName: "Dr. Gregory House",
            email: "house@clinic.com",
            password: hashedPassword,
            role: "doctor",
            specialization: "Diagnostics",
            isApproved: true,
            isAvailableOnline: true,
            age: 50,
            phone: "1234567891"
        });
        await dr1.save();
        
        const dr2 = new User({
            fullName: "Dr. James Wilson",
            email: "wilson@clinic.com",
            password: hashedPassword,
            role: "doctor",
            specialization: "Oncology",
            isApproved: true,
            isAvailableOnline: true,
            age: 48,
            phone: "1234567892"
        });
        await dr2.save();
        console.log("Doctors created.");

        // Create Test Patient
        const patient = new User({
            fullName: "Test Patient",
            email: "testpatient@clinic.com",
            password: hashedPassword,
            role: "patient",
            age: 30,
            phone: "1234561234"
        });
        await patient.save();
        console.log("Test Patient created.");

        process.exit(0);
    } catch (err) {
        console.error("Error Seeding DB:", err);
        process.exit(1);
    }
};

seedDB();
