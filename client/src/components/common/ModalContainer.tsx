import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ModalContainerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export default function ModalContainer({ children, isOpen, onClose }: ModalContainerProps) {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm"
      />
      
      {/* Modal container */}
      <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-h-[90vh] overflow-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
