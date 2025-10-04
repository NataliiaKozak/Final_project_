import express from 'express';
import dotenv from 'dotenv';
import app from './app.js'; // Express app (см. ниже)
import connectDB from './src/config/db.js';

dotenv.config();

const PORT: number | string = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Error connecting server', err);
  }
});

// замена entry point; запускает express + socket.io
// CHANGED: запускает express app и socket.io, подключает обработчики сокетов
// import http from 'http';
// import dotenv from 'dotenv';
// import app from './app.js'; // Express app (см. ниже)
// import connectDB from './config/db.js';
// import { Server } from 'socket.io';
// import { socketSetup } from './sockets/index.js';

// dotenv.config();

// const PORT : number | string = process.env.PORT || 3000;

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:3001',
//     credentials: true,
//   },
//   transports: ['websocket', 'polling'],
// });

// // сохраняем io в app, чтобы контроллеры могли отправлять уведомления
// app.set('io', io);

// // Подключаем socket handlers (в отдельном файле)
// socketSetup(io);

// (async function start() {
//   try {
//     await connectDB();
//     server.listen(PORT, () => {
//       console.log(`Server listening on http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error('Failed to start server:', err);
//     process.exit(1);
//   }
// })();

// 2.10 jwt и Socket.io
// verifySocketToken from "./config/jwt"

// import { Server } from "socket.io";
// import { verifySocketToken } from "./config/jwt";

// const io = new Server(server, {
//   cors: { origin: "http://localhost:5173" },
// });

// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) return next(new Error("No token"));

//     const decoded = verifySocketToken(token);
//     socket.data.userId = decoded.user_id; // сохраним id в сокете
//     next();
//   } catch (err) {
//     next(new Error("Invalid token"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.data.userId);

//   socket.on("message", (msg) => {
//     console.log("Message from user:", socket.data.userId, msg);
//   });
// });
