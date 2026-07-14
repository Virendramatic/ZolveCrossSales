import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import commentRoutes from './routes/comment.routes';
import productRoutes from './routes/product.routes';
import bulkRoutes from './routes/bulk.routes';
import educationLoanRoutes from './routes/education-loan.routes';
import documentRoutes from './routes/document.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions: any = {
  origin: [
    'https://zolve-cross-sales-staging.web.app',
    'https://zolve-cross-sales-f20up5jt7-mantis-forex.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Allow all origins in production (Vercel serverless)
if (process.env.VERCEL === '1') {
  corsOptions.origin = '*';
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/leads', commentRoutes);
app.use('/api/leads', productRoutes);
app.use('/api/leads', bulkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/loans', educationLoanRoutes);
app.use('/api', documentRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server only if not in Vercel/serverless environment
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
    });
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
    });
    await prisma.$disconnect();
    process.exit(0);
  });
}

export { app, prisma };
