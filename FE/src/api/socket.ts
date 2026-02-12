import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(apiBaseUrl: string, token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(apiBaseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
