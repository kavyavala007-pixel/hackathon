import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import { socketHandler } from './socket/socketHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patient.js';
import doctorRoutes from './routes/doctor.js';
import hospitalRoutes from './routes/hospital.js';
import predictRoutes from './routes/predict.js';
import chatRoutes from './routes/chat.js';
import syncRoutes from './routes/sync.js';

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow any origin in development
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so controllers can access it if needed
app.set('io', io);

// Socket handler
socketHandler(io);

// Middleware
app.use(cors({
  origin: true, // Allow any origin in development to support Network ID URLs
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sync', syncRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🏥 Healthcare Backend running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
