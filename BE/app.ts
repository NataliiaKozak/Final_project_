import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './src/middlewares/rateLimiter.js';
import { ENV } from './src/config/env.js';
import logger from './src/config/logger.js';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import likeRoutes from './src/routes/likeRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import followRoutes from './src/routes/followRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

const app: Application = express();

// За прокси Render доверяем одному прокси-хопу, чтобы req.ip был реальным IP клиента (нужно для rate limiter)
if (ENV.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

// HTTP request logging
const morganStream = { write: (msg: string) => logger.info(msg.trim()) };
app.use(morgan('short', { stream: morganStream }));

app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Server error:', { message: err.message, stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
