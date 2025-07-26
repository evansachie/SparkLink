import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { MdClose } from "react-icons/md";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
}

/**
 * Reusable Modal component with overlay that properly covers the entire screen
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  showCloseButton = true,
  size = "md"
}: ModalProps) {
  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full mx-4"
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] overflow-hidden">
      {/* Overlay - covers entire viewport */}
      <div 
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto pointer-events-auto ${className}`}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {showCloseButton && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <MdClose size={20} />
                    </Button>
                  )}
                </div>
              )}
              <div className={!title ? "p-4" : ""}>{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Modal;
