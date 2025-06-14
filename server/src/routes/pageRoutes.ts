import { Router } from 'express';
import { 
  getPages, 
  getPageById, 
  createPage, 
  updatePage, 
  deletePage, 
  reorderPages, 
  verifyPagePassword 
} from '../controllers/pageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes require authentication
router.get('/', authenticateToken as any, getPages as any);
router.get('/:pageId', authenticateToken as any, getPageById as any);
router.post('/', authenticateToken as any, createPage as any);
router.put('/:pageId', authenticateToken as any, updatePage as any);
router.delete('/:pageId', authenticateToken as any, deletePage as any);

// Reorder pages
router.post('/reorder', authenticateToken as any, reorderPages as any);

// Verify password for password-protected page
router.post('/verify-password', verifyPagePassword as any);

export default router;
