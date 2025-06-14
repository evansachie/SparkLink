import { Router } from 'express';
import { 
  getPublicProfile, 
  getPublicPages, 
  getPublicPageBySlug 
} from '../controllers/publicController';

const router = Router();

// Public profile routes (no auth needed)
router.get('/:username', getPublicProfile as any);
router.get('/:username/pages', getPublicPages as any);
router.get('/:username/pages/:slug', getPublicPageBySlug as any);

export default router;
