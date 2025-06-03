import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import prisma from '../config/database';

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
