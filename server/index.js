import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import callRoutes from './routes/callRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Socket.io connections
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket', socket.id);
  
  socket.on('join_queue', ({ clinicId, doctorId }) => {
    const room = `${clinicId}_${doctorId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined queue room ${room}`);
  });

  socket.on('join_chat', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined chat room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor_consultation';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with WebSockets enabled`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
