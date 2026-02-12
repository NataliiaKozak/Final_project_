import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './src/config/db.js';
import { verifySocketToken } from './src/config/jwt.js';
import Message from './src/models/MessageModel.js';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

// HTTP-сервер поверх Express
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// JWT-аутентификация сокетов
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

// Socket-события
io.on('connection', (socket) => {
  console.log('User connected:', socket.data.userId);

  // Подключение к комнате (1:1 чат)
  socket.on('joinRoom', ({ targetUserId }: { targetUserId: string }) => {
    const userId = socket.data.userId;
    const roomId = [userId, targetUserId].sort().join('_');
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Отправка сообщения через сокет
  socket.on('sendMessage', async ({ targetUserId, text }: { targetUserId: string; text: string }) => {
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

      // Отправляем всем в комнате (включая отправителя)
      io.to(roomId).emit('receiveMessage', populated);
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
      socket.emit('error', { message: 'Не удалось отправить сообщение' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.data.userId);
  });
});

// Запуск
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
