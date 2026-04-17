import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor_consultation';

const resetPasswords = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Update target test users
        await User.updateMany(
            { email: { $in: ['doctor@clinic.com', 'assistant@clinic.com'] } },
            { $set: { password: hashedPassword } }
        );

        console.log("Passwords successfully reset to 'password123' for doctor@clinic.com and assistant@clinic.com");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
resetPasswords();
