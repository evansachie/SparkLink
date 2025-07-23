import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from './database';
import { JWTPayload } from '../types';

// Google OAuth Strategy with proper callback URL configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.NODE_CALLBACK_URL
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with this email
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            isVerified: true
          }
        });
        return done(null, user);
      }
    }

    // Create new user
    if (email) {
      const firstName = profile.name?.givenName || undefined;
      const lastName = profile.name?.familyName || undefined;
      
      user = await prisma.user.create({
        data: {
          email,
          googleId: profile.id,
          firstName,
          lastName,
          profilePicture: profile.photos?.[0]?.value,
          isVerified: true,
          subscription: 'STARTER' // Default subscription
        }
      });
      return done(null, user);
    }

    console.error('No email provided by Google');
    return done(new Error('No email provided by Google'), false);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!
}, async (payload: JWTPayload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

export default passport;
