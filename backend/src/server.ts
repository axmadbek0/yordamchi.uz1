import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy orqali ruxsat berilmagan'));
    }
  },
  credentials: true
}));

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';

const httpServer = createServer(app);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/ai', aiRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Yordamchi Backend API ishlamoqda');
});

// Socket.io for Real-time chat & signals
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`[server]: Server http://localhost:${port} da ishga tushdi`);
});
