import { motion } from "framer-motion";
import { oauthService } from "../../services/auth/oauthService";

interface OAuthButtonProps {
  provider: 'google';
  action: 'login' | 'signup';
  disabled?: boolean;
  className?: string;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: 'https://www.svgrepo.com/show/475656/google-color.svg',
    bgColor: 'bg-white',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-50',
    textColor: 'text-gray-900'
  }
};

export default function OAuthButton({ 
  provider, 
  action, 
  disabled = false,
  className = "" 
}: OAuthButtonProps) {
  const config = providerConfig[provider];
  
  const handleOAuth = () => {
    if (disabled) return;
    
    switch (provider) {
      case 'google':
        oauthService.initiateGoogleAuth();
        break;
      default:
        console.warn(`Unsupported OAuth provider: ${provider}`);
    }
  };

  const actionText = action === 'login' ? 'Sign in' : 'Sign up';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={handleOAuth}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
        ${config.bgColor} ${config.borderColor} ${config.hoverColor} ${config.textColor}
        border shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      type="button"
    >
      <img
        src={config.icon}
        alt={`${config.name} logo`}
        className="w-5 h-5"
      />
      {actionText} with {config.name}
    </motion.button>
  );
}
