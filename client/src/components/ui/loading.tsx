import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  color = "primary", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const colors = {
    primary: "text-primary",
    secondary: "text-gray-600",
    white: "text-white"
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

interface LoadingStateProps {
  text?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
  className?: string;
}

export function LoadingState({ 
  text = "Loading...", 
  description,
  size = "md",
  fullscreen = false,
  className = ""
}: LoadingStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-gray-900 font-medium">{text}</p>
      {description && (
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
}

interface LoadingSkeletonProps {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function LoadingSkeleton({ 
  variant = "text", 
  width = "100%", 
  height,
  className = ""
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200";
  
  const variants = {
    text: "rounded h-4",
    rectangular: "rounded-md",
    circular: "rounded-full"
  };

  const defaultHeights = {
    text: "1rem",
    rectangular: "8rem",
    circular: "3rem"
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: height || defaultHeights[variant]
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
    />
  );
}

interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function LoadingCard({ 
  lines = 3, 
  showAvatar = false, 
  className = ""
}: LoadingCardProps) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <LoadingSkeleton variant="circular" width={40} height={40} />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton width="75%" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <LoadingSkeleton 
              key={i} 
              width={i === lines - 2 ? "50%" : "100%"} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
