import { Router } from 'express';
import { 
  getAnalyticsSummary, 
  getVisitorTrends, 
  getGeoDistribution,
  getDeviceStats
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.get('/summary', authenticateToken as any, getAnalyticsSummary as any);
router.get('/trends', authenticateToken as any, getVisitorTrends as any);
router.get('/geo', authenticateToken as any, getGeoDistribution as any);
router.get('/devices', authenticateToken as any, getDeviceStats as any);

export default router;
