import { Router } from 'express';
import { 
  getSubscriptionPlans, 
  getCurrentSubscription, 
  initializeSubscription, 
  verifySubscriptionPayment, 
  cancelSubscription,
  handlePaystackWebhook
} from '../controllers/subscriptionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/plans', getSubscriptionPlans as any);
router.get('/verify/:reference', verifySubscriptionPayment as any);
router.post('/webhook', handlePaystackWebhook as any);

// Protected routes
router.get('/current', authenticateToken as any, getCurrentSubscription as any);
router.post('/initialize', authenticateToken as any, initializeSubscription as any);
router.post('/cancel', authenticateToken as any, cancelSubscription as any);

export default router;
