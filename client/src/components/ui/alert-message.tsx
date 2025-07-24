import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';

interface AlertProps {
  message: string | null;
  type: 'error' | 'success';
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  message,
  type,
  onClose
}) => {
  if (!message) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`p-4 rounded-xl flex items-center gap-3 ${
          type === 'error' ? "bg-red-50 text-red-700 border border-red-200" : 
          "bg-green-50 text-green-700 border border-green-200"
        }`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-auto p-1 hover:bg-white/50 rounded"
        >
          <MdClose size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
