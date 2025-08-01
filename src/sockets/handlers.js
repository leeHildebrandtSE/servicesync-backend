// ========================================
// ENHANCED SOCKET.IO HANDLERS - src/sockets/handlers.js
// ========================================

import logger from '../utils/logger.js';

// Store active connections and sessions
const activeConnections = new Map();
const activeSessions = new Map();
const nurseStations = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to ServiceSync real-time system',
      timestamp: new Date(),
      socketId: socket.id
    });

    // Handle user registration (hostess, nurse, admin)
    socket.on('register', (data) => {
      const { userId, userType, employeeId, wardId, hospitalId } = data;

      activeConnections.set(socket.id, {
        userId,
        userType,
        employeeId,
        wardId,
        hospitalId,
        connectedAt: new Date()
      });

      // Join user-specific room
      socket.join(`user_${userId}`);

      // Join type-specific rooms
      if (userType === 'hostess') {
        socket.join('hostesses');
      } else if (userType === 'nurse') {
        socket.join('nurses');
        socket.join(`ward_${wardId}`);
        nurseStations.set(socket.id, { userId, wardId, employeeId });
      } else if (userType === 'admin') {
        socket.join('admins');
      }

      logger.info(`✅ User registered: ${employeeId} (${userType}) in ward ${wardId || 'N/A'}`);

      socket.emit('registered', {
        success: true,
        userType,
        rooms: [...socket.rooms],
        message: `Registered as ${userType}`
      });
    });

    // Handle session start
    socket.on('sessionStart', (sessionData) => {
      const { sessionId, hostessId, wardId } = sessionData;

      activeSessions.set(sessionId, {
        ...sessionData,
        hostessSocketId: socket.id,
        startTime: new Date(),
        status: 'active'
      });

      // Join session room
      socket.join(`session_${sessionId}`);

      // Notify administrators
      io.to('admins').emit('sessionStarted', {
        sessionId,
        hostessId,
        wardId,
        startTime: new Date(),
        message: 'New meal delivery session started'
      });

      logger.info(`🚀 Session started: ${sessionId} by ${hostessId}`);
    });

    // Handle location updates from hostess
    socket.on('locationUpdate', (data) => {
      const { sessionId, location, timestamp, coordinates } = data;

      const session = activeSessions.get(sessionId);
      if (session) {
        session.currentLocation = location;
        session.lastUpdate = new Date(timestamp);

        // Broadcast to session participants and admins
        io.to(`session_${sessionId}`).emit('hostessLocation', {
          sessionId,
          location,
          timestamp,
          coordinates
        });

        io.to('admins').emit('hostessLocation', {
          sessionId,
          hostessId: session.hostessId,
          location,
          timestamp,
          coordinates
        });
      }
    });

    // Handle nurse alert
    socket.on('nurseAlert', async (alertData) => {
      const { sessionId, wardId, mealType, mealCount, urgency = 'normal' } = alertData;

      const session = activeSessions.get(sessionId);
      if (!session) {
        socket.emit('alertError', { message: 'Session not found' });
        return;
      }

      const alertId = `ALERT_${Date.now()}`;
      const alertPayload = {
        alertId,
        sessionId,
        wardId,
        mealType,
        mealCount,
        urgency,
        sentAt: new Date(),
        status: 'sent',
        hostessId: session.hostessId
      };

      // Send to all nurses in the ward
      io.to(`ward_${wardId}`).emit('nurseAlert', alertPayload);

      // Send to admins
      io.to('admins').emit('nurseAlert', alertPayload);

      // Confirm to hostess
      socket.emit('alertSent', {
        alertId,
        sentAt: new Date(),
        message: 'Nurse alert sent successfully'
      });

      logger.info(`🚨 Nurse alert sent: ${alertId} for session ${sessionId} in ward ${wardId}`);
    });

    // Handle nurse acknowledgment
    socket.on('acknowledgeAlert', (ackData) => {
      const { alertId, sessionId, nurseId, responseTime } = ackData;

      const session = activeSessions.get(sessionId);
      if (session) {
        session.nurseResponse = {
          nurseId,
          responseTime: new Date(),
          alertId
        };

        // Notify hostess
        if (session.hostessSocketId) {
          io.to(session.hostessSocketId).emit('nurseResponse', {
            sessionId,
            nurseId,
            responseTime: new Date(),
            message: 'Nurse acknowledged and is ready'
          });
        }

        // Notify admins
        io.to('admins').emit('nurseResponse', {
          sessionId,
          nurseId,
          alertId,
          responseTime: new Date()
        });

        logger.info(`✅ Nurse acknowledgment: ${nurseId} responded to ${alertId}`);
      }
    });

    // Handle QR code scans
    socket.on('qrScan', (scanData) => {
      const { sessionId, qrCode, location, timestamp } = scanData;

      const session = activeSessions.get(sessionId);
      if (session) {
        session.lastQRScan = {
          qrCode,
          location,
          timestamp: new Date(timestamp)
        };

        // Broadcast to session and admins
        io.to(`session_${sessionId}`).emit('qrScanned', {
          sessionId,
          qrCode,
          location,
          timestamp,
          hostessId: session.hostessId
        });

        io.to('admins').emit('qrScanned', {
          sessionId,
          qrCode,
          location,
          timestamp,
          hostessId: session.hostessId
        });
      }
    });

    // Handle meal serving updates
    socket.on('servingUpdate', (updateData) => {
      const { sessionId, mealsServed, totalMeals, currentPatient } = updateData;

      const session = activeSessions.get(sessionId);
      if (session) {
        session.mealsServed = mealsServed;
        session.lastServingUpdate = new Date();

        const progress = Math.round((mealsServed / totalMeals) * 100);

        // Broadcast progress
        io.to(`session_${sessionId}`).emit('servingProgress', {
          sessionId,
          mealsServed,
          totalMeals,
          progress,
          currentPatient,
          timestamp: new Date()
        });

        io.to('admins').emit('servingProgress', {
          sessionId,
          hostessId: session.hostessId,
          mealsServed,
          totalMeals,
          progress,
          timestamp: new Date()
        });
      }
    });

    // Handle session completion
    socket.on('sessionComplete', (completionData) => {
      const { sessionId, completedAt, summary } = completionData;

      const session = activeSessions.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.completedAt = new Date(completedAt);
        session.summary = summary;

        // Notify all relevant parties
        io.to(`session_${sessionId}`).emit('sessionCompleted', {
          sessionId,
          completedAt,
          summary,
          duration: new Date(completedAt) - session.startTime
        });

        io.to('admins').emit('sessionCompleted', {
          sessionId,
          hostessId: session.hostessId,
          completedAt,
          summary,
          duration: new Date(completedAt) - session.startTime
        });

        logger.info(`✅ Session completed: ${sessionId} by ${session.hostessId}`);
      }
    });

    // Handle emergency alerts
    socket.on('emergency', (emergencyData) => {
      const { sessionId, type, description, location } = emergencyData;

      const emergencyAlert = {
        id: `EMERGENCY_${Date.now()}`,
        sessionId,
        type,
        description,
        location,
        timestamp: new Date(),
        status: 'active'
      };

      // Broadcast to all users
      io.emit('emergencyAlert', emergencyAlert);

      logger.warn(`🚨 EMERGENCY ALERT: ${type} at ${location} - Session: ${sessionId}`);
    });

    // Handle requests for system status
    socket.on('getSystemStatus', () => {
      socket.emit('systemStatus', {
        connectedUsers: activeConnections.size,
        activeSessions: activeSessions.size,
        activeNurses: nurseStations.size,
        timestamp: new Date(),
        server: 'ServiceSync Backend v1.0'
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      const userInfo = activeConnections.get(socket.id);

      if (userInfo) {
        logger.info(`🔌 User disconnected: ${userInfo.employeeId} (${userInfo.userType}) - Reason: ${reason}`);

        // Clean up nurse stations
        if (userInfo.userType === 'nurse') {
          nurseStations.delete(socket.id);
        }

        // Handle active sessions
        activeSessions.forEach((session, sessionId) => {
          if (session.hostessSocketId === socket.id) {
            session.status = 'disconnected';
            session.disconnectedAt = new Date();

            // Notify admins of disconnection
            io.to('admins').emit('hostessDisconnected', {
              sessionId,
              hostessId: session.hostessId,
              disconnectedAt: new Date(),
              reason
            });
          }
        });

        activeConnections.delete(socket.id);
      } else {
        logger.info(`🔌 Client disconnected: ${socket.id} - Reason: ${reason}`);
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`🚨 Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic cleanup of inactive sessions
  setInterval(() => {
    const now = new Date();
    let cleanedSessions = 0;

    activeSessions.forEach((session, sessionId) => {
      const inactiveTime = now.getTime() - (session.lastUpdate || session.startTime).getTime();

      // Remove sessions inactive for more than 4 hours
      if (inactiveTime > 4 * 60 * 60 * 1000) {
        activeSessions.delete(sessionId);
        cleanedSessions++;
      }
    });

    if (cleanedSessions > 0) {
      logger.info(`🧹 Cleaned up ${cleanedSessions} inactive sessions`);
    }
  }, 30 * 60 * 1000); // Run every 30 minutes

  logger.info('✅ Socket.IO handlers initialized');
  return io;
};