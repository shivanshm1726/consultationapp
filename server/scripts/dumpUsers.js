import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor_consultation';

const listUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({}, 'email role fullName');
        console.log("Users in Database:");
        console.table(users.map(u => ({ email: u.email, role: u.role, fullName: u.fullName })));
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
listUsers();
