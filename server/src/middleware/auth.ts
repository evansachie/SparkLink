import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import prisma from '../config/database';

/**
 * Authentication middleware that validates JWT tokens and attaches user to request
 * 
 * @description Extracts JWT token from Authorization header, validates it, and fetches user data
 * @param req - Express request object (will be extended with user property)
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @returns 401 if:
 * - No token provided
 * - Invalid or expired token
 * - User not found in database
 * 
 * @example
 * ```typescript
 * router.get('/protected', authenticateToken, (req, res) => {
 *   const user = req.user; // User is now available
 * });
 * ```
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Access token required'
      });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid token - user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid or expired token'
    });
  }
};
