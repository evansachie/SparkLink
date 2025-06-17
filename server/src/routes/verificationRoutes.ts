import { Router } from 'express';
import { 
  getVerificationStatus,
  submitVerificationRequest,
  getVerificationRequirements,
  getVerificationHistory,
  cancelVerificationRequest,
  getPendingVerifications,
  approveVerification,
  rejectVerification
} from '../controllers/verificationController';
import { authenticateToken } from '../middleware/auth';
import { galleryUpload } from '../config/cloudinary';

const router = Router();

// User verification routes
router.get('/status', authenticateToken as any, getVerificationStatus as any);
router.get('/requirements', getVerificationRequirements as any);
router.get('/history', authenticateToken as any, getVerificationHistory as any);
router.post('/submit', authenticateToken as any, galleryUpload.array('documents', 5), submitVerificationRequest as any);
router.delete('/cancel/:requestId', authenticateToken as any, cancelVerificationRequest as any);

// Admin routes (in a real app, these would have admin middleware)
router.get('/admin/pending', authenticateToken as any, getPendingVerifications as any);
router.post('/admin/approve/:requestId', authenticateToken as any, approveVerification as any);
router.post('/admin/reject/:requestId', authenticateToken as any, rejectVerification as any);

export default router;
