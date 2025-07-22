import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface TermsAndPrivacyProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  className?: string;
}

export default function TermsAndPrivacy({ 
  agreed, 
  onAgreedChange, 
  className = "" 
}: TermsAndPrivacyProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`flex items-start gap-3 ${className}`}
    >
      <motion.div
        className="relative mt-1"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <input
          type="checkbox"
          id="terms-agreement"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="w-4 h-4 text-primary bg-white border-2 border-gray-300 rounded focus:ring-primary/20 focus:ring-2 transition-all cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Custom checkmark animation */}
        {agreed && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>

      <motion.label
        htmlFor="terms-agreement"
        className="text-sm text-muted-foreground leading-relaxed cursor-pointer flex-1"
        animate={{ color: isHovered ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
        transition={{ duration: 0.2 }}
      >
        I agree to SparkLink's{" "}
        <Link
          to="/terms"
          className="text-primary hover:text-primary/80 underline underline-offset-2 hover:underline-offset-4 transition-all duration-200 font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link
          to="/privacy"
          className="text-primary hover:text-primary/80 underline underline-offset-2 hover:underline-offset-4 transition-all duration-200 font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Privacy Policy
        </Link>
      </motion.label>
    </motion.div>
  );
}
