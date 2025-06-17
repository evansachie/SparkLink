import { Router } from 'express';
import { 
  uploadResume,
  getResumeInfo,
  updateResumeSettings,
  deleteResume,
  downloadResume,
  getPublicResumeInfo
} from '../controllers/resumeController';
import { authenticateToken } from '../middleware/auth';
import { resumeUpload } from '../config/cloudinary';

const router = Router();

// Authenticated routes
router.post('/upload', authenticateToken as any, resumeUpload.single('resume'), uploadResume as any);
router.get('/info', authenticateToken as any, getResumeInfo as any);
router.put('/settings', authenticateToken as any, updateResumeSettings as any);
router.delete('/', authenticateToken as any, deleteResume as any);

// Public routes
router.get('/public/:username/info', getPublicResumeInfo as any);
router.get('/download/:username', downloadResume as any);

export default router;
