import 'dotenv/config';

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { allowedOrigins } from './config/cors';
import { assertJwtSecrets } from './utils/jwt';
import { registerProcessHandlers } from './lib/gracefulShutdown';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import dailyLogRoutes from './routes/dailyLog.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';

// JWT kalitlari yo'q bo'lsa — darhol to'xtatish
assertJwtSecrets();

const app: Express = express();
const port = Number(process.env.PORT) || 5000;
const isProduction = process.env.NODE_ENV === 'production';

if (process.env.TRUST_PROXY === 'true' || isProduction) {
  app.set('trust proxy', 1);
}

// 1) CORS — barcha middleware va routelardan OLDIN
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:5174',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', apiRateLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Yordamchi Backend API ishlamoqda',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/daily-logs', dailyLogRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  if (!isProduction) {
    console.log('[socket.io] Ulandi:', socket.id);
  }

  socket.on('disconnect', () => {
    if (!isProduction) {
      console.log('[socket.io] Uzildi:', socket.id);
    }
  });
});

registerProcessHandlers(httpServer, io);

httpServer.listen(port, () => {
  console.log(
    `[server] ${isProduction ? 'production' : 'development'} rejimida http://localhost:${port}`
  );
  console.log(`[cors] http://localhost:3000 ruxsat berilgan (credentials: true)`);
});

export { app, httpServer, io };
