// Минимальный singleton-клиент под твой бэк (auth через token, события joinRoom/sendMessage/receiveMessage)
// import { io, Socket } from 'socket.io-client';
// import type { IMessage } from '../interfaces/message.interface';

// let socket: Socket | null = null;

// export function connectSocket(apiBaseUrl: string, token: string): Socket {
//   if (socket?.connected) return socket;

//   socket = io(apiBaseUrl, {
//     auth: { token },               // твой middleware читает socket.handshake.auth.token
//     transports: ['websocket'],     // без лишнего «улучшайзинга»
//   });

//   return socket;
// }

// export function getSocket(): Socket | null {
//   return socket;
// }

// export function disconnectSocket(): void {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// }

// // Тип входящего сообщения из io.to(roomId).emit('receiveMessage', {...})
// export type IncomingMessagePayload = Pick<
//   IMessage,
//   '_id' | 'text' | 'createdAt'
// > & {
//   sender: string;     // на бэке эмитится id
//   recipient: string;  // на бэке эмитится id
// };