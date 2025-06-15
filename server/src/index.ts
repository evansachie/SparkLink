import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './config/database';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import pageRoutes from './routes/pageRoutes';
import publicRoutes from './routes/publicRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import templateRoutes from './routes/templateRoutes';
import passport from './config/passport';
import { initializeTemplates } from './controllers/templateController';
import galleryRoutes from './routes/galleryRoutes';
import verificationRoutes from './routes/verificationRoutes';

dotenv.config();

setTimeout(() => {
  initializeTemplates()
    .then(() => console.log('✅ Templates initialization complete'))
    .catch((err) => console.error('❌ Templates initialization failed:', err));
}, 5000);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/verification', verificationRoutes);

// Base route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'SparkLink API is running',
    version: '1.0.0',
    health: '/api/health'
  });
});

// Basic health check route
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      message: 'SparkLink API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});

export default app;
