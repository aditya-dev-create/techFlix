import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import { initializeEventListener } from './services/blockchain/eventListener';
import apiRouter from './routes/api';
import { logger, requestLogger } from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

export const prisma = new PrismaClient();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Basic rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  }),
);

// API routes
app.use('/api', apiRouter(io));

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  logger.info(`TrustyCrowdFlow backend running on ${PORT}`);
  // initialize blockchain event listener
  try {
    await initializeEventListener(io);
  } catch (e) {
    logger.error('Failed to initialize blockchain event listener', e);
  }
});
