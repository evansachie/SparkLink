import { Router } from 'express';
import passport from '../config/passport';
import { register, login, verifyEmail, resendVerificationCode, googleCallback } from '../controllers/authController';

const router = Router();

// Email/Password Auth
router.post('/register', register as any);
router.post('/login', login as any);
router.post('/verify-email', verifyEmail as any);
router.post('/resend-verification', resendVerificationCode as any);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: true
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'https://sparklink-lyart.vercel.app/login?error=google_auth_failed',
    session: true
  }),
  googleCallback as any
);

export default router;
