import { Router, RequestHandler } from 'express';
import passport from '../config/passport';
import { register, login, verifyEmail, resendVerificationCode, googleCallback } from '../controllers/authController';

const router = Router();

// Email/Password Auth
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/verify-email', verifyEmail as RequestHandler);
router.post('/resend-verification', resendVerificationCode as RequestHandler);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/error` }),
  googleCallback as RequestHandler
);

export default router;
