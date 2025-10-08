import express from 'express';
import dotenv from 'dotenv';
import app from './app.js'; // Express app
import connectDB from './src/config/db.js';

dotenv.config();

const PORT: number | string = process.env.PORT || 3000;

// app.listen(PORT, async () => {
//   try {
//     await connectDB();
//     console.log(`Server running on http://localhost:${PORT}`);
//   } catch (err) {
//     console.error('Error connecting server', err);
//   }
// });

connectDB()
  .then(() => {
    // Стартуем сервер ТОЛЬКО после успешного подключения
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1); // чтобы процесс не висел без БД
  });

// сокет
// import http from 'http';
// import dotenv from 'dotenv';
// import { Server } from 'socket.io';
// import app from './app';
// import connectDB from './src/config/db';
// import { verifySocketToken } from './src/config/jwt';
// import Message from './src/models/MessageModel';

// dotenv.config();

// const PORT: number = Number(process.env.PORT) || 3000;

// // создаём http сервер поверх Express
// const server = http.createServer(app);

// // подключаем Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//     },
// //   transports: ['websocket', 'polling'],
//   },
// });

// // Middleware для аутентификации сокетов через JWT
// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error('No token'));

//     const decoded = verifySocketToken(token);
//     if (!decoded) return next(new Error('Invalid token'));

//     socket.data.userId = decoded.user_id;
//     next();
//   } catch (err) {
//     next(new Error('Unauthorized'));
//   }
// });

// // socket-события
// io.on('connection', (socket) => {
//   console.log(' User connected:', socket.data.userId);

//   // подключение к комнате (1:1)
//   socket.on('joinRoom', ({ targetUserId }) => {
//     const userId = socket.data.userId;
//     const roomId = [userId, targetUserId].sort().join('_');
//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);
//   });

//   // отправка сообщения
//   socket.on('sendMessage', async ({ targetUserId, text }) => {
//     try {
//       const senderId = socket.data.userId;
//       const roomId = [senderId, targetUserId].sort().join('_');

//       // сохраняем сообщение в MongoDB
//       const message = new Message({
//         sender: senderId,
//         recipient: targetUserId,
//         text,
//       });
//       await message.save();

//       // отправляем всем в комнате
//       io.to(roomId).emit('receiveMessage', {
//         _id: message._id,
//         sender: senderId,
//         recipient: targetUserId,
//         text: message.text,
//         createdAt: message.createdAt,
//       });
//     } catch (err) {
//       console.error('Ошибка при отправке сообщения:', err);
//       socket.emit('error', { message: 'Не удалось отправить сообщение' });
//     }
//   });

//   // отключение
//   socket.on('disconnect', () => {
//     console.log(' User disconnected:', socket.data.userId);
//   });
// });

// // подключение к базе и запуск сервера
// (async () => {
//   try {
//     await connectDB(); // MongoDB Atlas
//     server.listen(PORT, () => {
//       console.log(` Server running on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error(' Error starting server:', err);
//     process.exit(1);
//   }
// })();
