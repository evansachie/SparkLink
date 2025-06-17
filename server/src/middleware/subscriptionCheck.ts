import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SubscriptionTier } from '@prisma/client';

/**
 * Middleware to check if a user's subscription tier meets the minimum required level
 * @param requiredTier The minimum subscription tier required
 */
export const checkSubscriptionTier = (requiredTier: SubscriptionTier) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          status: 'ERROR',
          message: 'User not authenticated'
        });
      }

      // Define tier hierarchy
      const tierLevels: { [key in SubscriptionTier]: number } = {
        STARTER: 0,
        RISE: 1,
        BLAZE: 2
      };

      const userTierLevel = tierLevels[user.subscription];
      const requiredTierLevel = tierLevels[requiredTier];

      if (userTierLevel < requiredTierLevel) {
        return res.status(403).json({
          status: 'ERROR',
          message: `This feature requires a ${requiredTier} subscription or higher`,
          requiredTier,
          currentTier: user.subscription
        });
      }

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Error checking subscription permissions'
      });
    }
  };
};
