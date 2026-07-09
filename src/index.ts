/**
 * Icon Radar AI Agents Microservice
 * Main entry point for the AI agents service
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import agentRoutes from './routes/agents';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Create Express application
const app: Application = express();
const PORT = process.env.PORT || 3009;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] as string || `req-${Date.now()}`;
  req.headers['x-correlation-id'] = correlationId;

  logger.info(`${req.method} ${req.path}`, {
    correlationId,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  next();
});

// Health check endpoints
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'healthy',
      service: 'ai-agents',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: 'healthy',
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'ai-agents',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

app.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

// API routes
app.use('/api/v1/agents', agentRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  try {
    // Close Prisma connection
    await prisma.$disconnect();
    logger.info('Database connections closed');

    // Close server
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`AI Agents Service running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT,
        pid: process.pid
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
