import { Router } from 'express';
import { 
  getPages, getPageById, createPage, 
  updatePage, deletePage, reorderPages 
} from '../controllers/pageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', authenticateToken as any, getPages as any);
router.get('/:pageId', authenticateToken as any, getPageById as any);
router.post('/', authenticateToken as any, createPage as any);
router.put('/:pageId', authenticateToken as any, updatePage as any);
router.delete('/:pageId', authenticateToken as any, deletePage as any);
router.post('/reorder', authenticateToken as any, reorderPages as any);

export default router;
