import { Router } from 'express';
import { 
  getPublicProfile, 
  getPublicPages, 
  getPublicPageBySlug,
  accessProtectedPage
} from '../controllers/publicController';

const router = Router();

// Public profile routes
router.get('/:username', getPublicProfile as any);
router.get('/:username/pages', getPublicPages as any);
router.get('/:username/pages/:slug', getPublicPageBySlug as any);

// Password protected page access
router.post('/access-protected', accessProtectedPage as any);

export default router;
