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

// Import enhanced socket handlers
import { setupSocketHandlers } from './sockets/handlers.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting with different tiers
const createRateLimit = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks and socket.io
      return req.path === '/health' || req.path.startsWith('/socket.io');
    }
  });

// Apply different rate limits to different endpoints
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 10, 'Too many auth attempts'));
app.use('/api', createRateLimit(15 * 60 * 1000, 100, 'Too many API requests'));
app.use(createRateLimit(15 * 60 * 1000, 200, 'Too many requests'));

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Health check with comprehensive system status
app.get('/health', async (req, res) => {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // Test database connection
    try {
      const { db } = await import('./config/database.js');
      await db.raw('SELECT 1');
      healthData.database = {
        status: 'Connected',
        type: 'PostgreSQL',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'servicesync'
      };
    } catch (dbError) {
      healthData.database = {
        status: 'Disconnected',
        error: dbError.message
      };
      healthData.status = 'Degraded';
    }

    // Socket.IO status
    healthData.socketIO = {
      status: 'Active',
      connectedClients: io.engine.clientsCount,
      transport: 'websocket, polling'
    };

    res.status(healthData.status === 'OK' ? 200 : 503).json(healthData);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'Error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Documentation endpoint with enhanced info
app.get('/', (req, res) => {
  res.json({
    message: '🏥 ServiceSync Backend API',
    version: '1.0.0',
    status: 'Running',
    description: 'Hospital Meal Delivery Tracking System with Real-time Updates',
    features: [
      'Real-time meal delivery tracking',
      'QR code scanning integration',
      'Nurse notification system',
      'Comprehensive reporting dashboard',
      'Socket.IO real-time updates',
      'JWT authentication',
      'PostgreSQL database',
      'Rate limiting & security'
    ],
    endpoints: {
      system: {
        health: 'GET /health',
        docs: 'GET /'
      },
      auth: {
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      sessions: {
        create: 'POST /api/sessions',
        get: 'GET /api/sessions/:sessionId',
        update: 'PUT /api/sessions/:sessionId'
      },
      qr: {
        scan: 'POST /api/qr/scan'
      },
      nurse: {
        alert: 'POST /api/nurse/alert'
      },
      upload: {
        dietSheet: 'POST /api/upload/diet-sheet'
      },
      reports: {
        dashboard: 'GET /api/reports/dashboard',
        session: 'GET /api/reports/session/:sessionId',
        analytics: 'GET /api/reports/analytics',
        export: 'GET /api/reports/export/:type'
      }
    },
    socketEvents: {
      client: ['register', 'sessionStart', 'locationUpdate', 'nurseAlert', 'qrScan'],
      server: ['connected', 'nurseAlert', 'nurseResponse', 'servingProgress', 'emergencyAlert']
    },
    defaultCredentials: {
      hostess: { employeeId: 'H001', password: 'password123' },
      hostess2: { employeeId: 'H002', password: 'password123' },
      nurse: { employeeId: 'N001', password: 'password123' },
      admin: { employeeId: 'ADMIN001', password: 'password123' }
    },
    sampleSession: {
      hospitalId: '123e4567-e89b-12d3-a456-426614174001',
      wardId: '223e4567-e89b-12d3-a456-426614174001',
      mealType: 'breakfast',
      mealCount: 12
    }
  });
});

// API Routes with middleware
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/reports', reportsRoutes);

// Additional utility endpoints
app.get('/api/system/stats', async (req, res) => {
  try {
    const { db } = await import('./config/database.js');

    const stats = await db.raw(`
      SELECT
        (SELECT COUNT(*) FROM delivery_sessions) as total_sessions,
        (SELECT COUNT(*) FROM delivery_sessions WHERE status = 'completed') as completed_sessions,
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
        (SELECT COUNT(*) FROM hospitals WHERE status = 'active') as active_hospitals,
        (SELECT COUNT(*) FROM wards WHERE status = 'active') as active_wards
    `);

    res.json({
      success: true,
      stats: stats[0] || {},
      connectedClients: io.engine.clientsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Enhanced Socket.IO setup
setupSocketHandlers(io);
app.set('io', io);

// Log socket connections for monitoring
io.engine.on('connection_error', (error) => {
  logger.error('Socket.IO connection error:', error);
});

// Initialize services and start server
async function startServer() {
  try {
    logger.info('🏥 Initializing ServiceSync Backend...');

    // Initialize database with retries
    let dbRetries = 3;
    while (dbRetries > 0) {
      try {
        await initializeDatabase();
        logger.info('✅ Database connected and migrations completed');
        break;
      } catch (error) {
        dbRetries--;
        if (dbRetries === 0) throw error;
        logger.warn(`Database connection failed, retrying... (${dbRetries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Start server with error handling
    server.listen(PORT, () => {
      logger.info(`🚀 ServiceSync Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🏥 Hospital Meal Delivery System Ready`);
      logger.info(`🌐 API Documentation: http://localhost:${PORT}`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🔌 Socket.IO enabled with enhanced handlers`);

      console.log('\n🎉 SUCCESS! ServiceSync Backend is running!');
      console.log(`📱 Connect your React app to: http://localhost:${PORT}`);
      console.log(`🔐 Default Login: H001 / password123`);
      console.log(`🏥 Sample Hospital ID: 123e4567-e89b-12d3-a456-426614174001`);
      console.log(`🏥 Sample Ward ID: 223e4567-e89b-12d3-a456-426614174001\n`);
    });

    server.on('error', (error) => {
      logger.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please use a different port or stop the existing process.`);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    console.error('\n🚨 STARTUP ERROR:', error.message);

    if (error.message.includes('database')) {
      console.error('💡 Database connection failed. Please ensure:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Database "servicesync" exists');
      console.error('   3. User credentials are correct');
      console.error('   4. Check your .env file configuration\n');
    }

    process.exit(1);
  }
}

// Enhanced graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close Socket.IO connections
  io.close(() => {
    logger.info('Socket.IO connections closed');
  });

  // Close HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connections
    try {
      const { db } = await import('./config/database.js');
      await db.destroy();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database:', error);
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production - just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();