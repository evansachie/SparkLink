import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { oauthService } from '../services/auth/oauthService';

export interface UseOAuthResult {
  isProcessing: boolean;
  error: string | null;
  success: string | null;
}

export const useOAuth = (): UseOAuthResult => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    
    // Check if this is an OAuth callback
    if (urlParams.get('token') && urlParams.get('google')) {
      setIsProcessing(true);
      setError(null);
      
      const result = oauthService.parseOAuthCallback(urlParams);
      
      if (result.isValid && result.user && result.token) {
        login(result.user, result.token);
        
        const message = result.isNewUser 
          ? "Google account linked successfully! Redirecting to dashboard..."
          : "Google login successful! Redirecting to dashboard...";
        
        setSuccess(message);
        
        // Clean up URL and redirect
        setTimeout(() => {
          oauthService.cleanUpURL("/dashboard");
          navigate("/dashboard", { replace: true });
        }, 1500);
      } else {
        setError(result.error || "Authentication failed");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
      
      setIsProcessing(false);
    }
  }, [location.search, login, navigate]);

  return { isProcessing, error, success };
};
