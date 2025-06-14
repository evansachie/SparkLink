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
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/error` }),
  googleCallback as any
);

export default router;
