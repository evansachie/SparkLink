import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  id = `checkbox-${Math.random().toString(36).substring(2, 9)}`,
  disabled = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="relative"
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 appearance-none border-2 border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 checked:bg-primary/90 checked:border-primary/90 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Custom checkmark animation */}
        {checked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg
              className="w-3 h-3 text-primary"
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

      {label && (
        <motion.label
          htmlFor={id}
          className="text-sm text-gray-700 cursor-pointer flex-1"
          animate={{ color: isHovered && !disabled ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
    </div>
  );
};
