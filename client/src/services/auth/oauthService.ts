import { User } from "../api/auth";

export interface OAuthTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class OAuthService {
  private static instance: OAuthService;
  
  private constructor() {}
  
  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }


  /**
   * Initiate Google OAuth flow
   */
  initiateGoogleAuth(): void {
    window.location.href = "https://sparklink.onrender.com/api/auth/google";
  }

  /**
   * Parse and validate OAuth token from URL parameters
   */
  parseOAuthCallback(searchParams: URLSearchParams): {
    isValid: boolean;
    user?: User;
    token?: string;
    isNewUser?: boolean;
    error?: string;
  } {
    const token = searchParams.get('token');
    const isGoogle = searchParams.get('google');
    const isNewUser = searchParams.get('new_user');

    if (!token || !isGoogle) {
      return {
        isValid: false,
        error: 'Missing OAuth parameters'
      };
    }

    try {
      // Decode and validate JWT token
      const payload = this.decodeJWT(token);
      
      if (!payload.userId || !payload.email) {
        return {
          isValid: false,
          error: 'Invalid token payload'
        };
      }

      const user: User = {
        id: payload.userId,
        email: payload.email
      };

      return {
        isValid: true,
        user,
        token,
        isNewUser: isNewUser === 'true'
      };
    } catch (error) {
      console.error('Failed to parse OAuth token:', error);
      return {
        isValid: false,
        error: 'Failed to decode authentication token'
      };
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeJWT(token: string): OAuthTokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload) as OAuthTokenPayload;
  }

  /**
   * Clean OAuth parameters from URL
   */
  cleanUpURL(pathname: string): void {
    window.history.replaceState({}, document.title, pathname);
  }
}

export const oauthService = OAuthService.getInstance();
