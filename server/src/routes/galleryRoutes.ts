import { Router } from 'express';
import { 
  getGalleryItems,
  uploadGalleryItem,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems
} from '../controllers/galleryController';
import { authenticateToken } from '../middleware/auth';
import { galleryUpload } from '../config/cloudinary';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken as any, getGalleryItems as any);
router.get('/:itemId', authenticateToken as any, getGalleryItemById as any);
router.post('/upload', authenticateToken as any, galleryUpload.single('image'), uploadGalleryItem as any);
router.put('/:itemId', authenticateToken as any, updateGalleryItem as any);
router.delete('/:itemId', authenticateToken as any, deleteGalleryItem as any);
router.post('/reorder', authenticateToken as any, reorderGalleryItems as any);

export default router;
