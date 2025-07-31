import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';

// Import utilities first
import logger from './utils/logger.js';

// Import configurations and middleware
import { initializeDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import qrRoutes from './routes/qr.js';
import uploadRoutes from './routes/upload.js';
import nurseRoutes from './routes/nurse.js';
import reportsRoutes from './routes/reports.js';

import { setupSocketHandlers } from './sockets/index.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { db } = await import('./config/database.js');
    await db.raw('SELECT 1');
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'Connected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'Error',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API Documentation endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏥 ServiceSync Backend API',
    version: '1.0.0',
    status: 'Running',
    description: 'Hospital Meal Delivery Tracking System',
    endpoints: {
      health: 'GET /health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      sessions: {
        create: 'POST /api/sessions',
        get: 'GET /api/sessions/:sessionId'
      },
      qr: {
        scan: 'POST /api/qr/scan'
      },
      nurse: {
        alert: 'POST /api/nurse/alert'
      },
      reports: {
        dashboard: 'GET /api/reports/dashboard'
      }
    },
    defaultCredentials: {
      hostess: { employeeId: 'H001', password: 'password123' },
      nurse: { employeeId: 'N001', password: 'password123' },
      admin: { employeeId: 'ADMIN001', password: 'password123' }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.IO setup
setupSocketHandlers(io);
app.set('io', io);

// Initialize services and start server
async function startServer() {
  try {
    logger.info('🏥 Initializing ServiceSync Backend...');
    
    // Initialize database
    await initializeDatabase();
    logger.info('✅ Database connected and migrations completed');
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 ServiceSync Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🏥 Hospital Meal Delivery System Ready`);
      logger.info(`🌐 API Documentation: http://localhost:${PORT}`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
      
      console.log('\n🎉 SUCCESS! ServiceSync Backend is running!');
      console.log(`📱 Connect your React app to: http://localhost:${PORT}`);
      console.log(`🔐 Default Login: H001 / password123\n`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    console.error('\n🚨 STARTUP ERROR:', error.message);
    console.error('💡 Check your database connection and try again\n');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');  
    process.exit(0);
  });
});

startServer();