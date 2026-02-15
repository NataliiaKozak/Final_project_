import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './src/config/db.js';
import { verifySocketToken } from './src/config/jwt.js';
import { ENV } from './src/config/env.js';
import Message from './src/models/MessageModel.js';
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ENV.CLIENT_URL,
        credentials: true,
    },
});
// JWT authentication for sockets
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('No token'));
        const decoded = verifySocketToken(token);
        if (!decoded)
            return next(new Error('Invalid token'));
        socket.data.userId = decoded.user_id;
        next();
    }
    catch {
        next(new Error('Unauthorized'));
    }
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Message send error:', msg);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.data.userId);
    });
});
connectDB()
    .then(() => {
    server.listen(ENV.PORT, () => {
        console.log(`Server running on http://localhost:${ENV.PORT}`);
    });
})
    .catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('DB connection failed:', msg);
    process.exit(1);
});
//# sourceMappingURL=server.js.map