import { Request } from 'express';
import type { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface GoogleProfile {
  id: string;
  emails: Array<{ value: string; verified: boolean }>;
  name: {
    givenName: string;
    familyName: string;
  };
  photos: Array<{ value: string }>;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  country?: string;
  phone?: string;
  googleId?: string;
  profilePicture?: string;
}
