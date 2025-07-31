export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    socket.emit('connected', {
      message: 'Connected to ServiceSync real-time system',
      timestamp: new Date()
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};