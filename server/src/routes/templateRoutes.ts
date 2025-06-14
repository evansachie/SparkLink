import { Router } from 'express';
import { 
  getTemplates,
  getTemplateById,
  applyTemplate,
  updateColorScheme
} from '../controllers/templateController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes require authentication
router.get('/', authenticateToken as any, getTemplates as any);
router.get('/:templateId', getTemplateById as any);
router.post('/apply', authenticateToken as any, applyTemplate as any);
router.put('/colors', authenticateToken as any, updateColorScheme as any);

export default router;
