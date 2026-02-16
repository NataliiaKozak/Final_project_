import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './src/config/db.js';
import { verifySocketToken } from './src/config/jwt.js';
import { ENV } from './src/config/env.js';
import logger from './src/config/logger.js';
import Message from './src/models/MessageModel.js';

// ---- Socket.IO typed events ----
interface ClientToServerEvents {
  joinRoom: (data: { targetUserId: string }) => void;
  sendMessage: (data: { targetUserId: string; text: string }) => void;
}

interface ServerToClientEvents {
  receiveMessage: (message: unknown) => void;
  error: (data: { message: string }) => void;
}

interface SocketData {
  userId: string;
}

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true,
  },
});

// JWT authentication for sockets
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('No token'));

    const decoded = verifySocketToken(token);
    if (!decoded) return next(new Error('Invalid token'));

    socket.data.userId = decoded.user_id;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.data.userId}`);

  // Auto-join personal notification room so badge notifications can reach the user
  socket.join(`user_${socket.data.userId}`);

  socket.on('joinRoom', ({ targetUserId }) => {
    const userId = socket.data.userId;
    const roomId = [userId, targetUserId].sort().join('_');
    socket.join(roomId);
  });

  socket.on('sendMessage', async ({ targetUserId, text }) => {
    try {
      const senderId = socket.data.userId;
      const roomId = [senderId, targetUserId].sort().join('_');

      const message = new Message({
        sender: senderId,
        recipient: targetUserId,
        text,
      });
      await message.save();

      const populated = await message.populate([
        { path: 'sender', select: 'username profileImage' },
        { path: 'recipient', select: 'username profileImage' },
      ]);

      io.to(roomId).emit('receiveMessage', populated);
      // Also notify the recipient via their personal room (for badge counter)
      io.to(`user_${targetUserId}`).emit('receiveMessage', populated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Message send error:', { error: msg });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.data.userId}`);
  });
});

connectDB()
  .then(() => {
    server.listen(ENV.PORT, () => {
      logger.info(`Server running on http://localhost:${ENV.PORT}`);
    });
  })
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('DB connection failed:', { error: msg });
    process.exit(1);
  });
