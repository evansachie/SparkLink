import { Router } from 'express';
import { 
  getCurrentProfile, updateUserProfile, checkUsername,
  updateSocialLinks, uploadProfilePicture, uploadBackgroundImage,
  toggleProfilePublication
} from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../config/cloudinary';

const router = Router();

// Protected profile routes
router.get('/', authenticateToken as any, getCurrentProfile as any);
router.put('/', authenticateToken as any, updateUserProfile as any);
router.put('/social-links', authenticateToken as any, updateSocialLinks as any);
router.post('/publish', authenticateToken as any, toggleProfilePublication as any);

// File upload routes
router.post('/upload/profile-picture', 
  authenticateToken as any,
  upload.single('image'), 
  uploadProfilePicture as any
);

router.post('/upload/background-image', 
  authenticateToken as any,
  upload.single('image'), 
  uploadBackgroundImage as any
);

// Public routes (no auth required)
router.get('/check-username', checkUsername as any);

export default router;
