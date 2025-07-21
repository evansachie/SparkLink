import { useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from "react-icons/md";
import { Toast, ToastContext } from "../../hooks/useToast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, description?: string): string => {
    return addToast({ type: "success", title, description });
  };

  const error = (title: string, description?: string): string => {
    return addToast({ type: "error", title, description });
  };

  const warning = (title: string, description?: string): string => {
    return addToast({ type: "warning", title, description });
  };

  const info = (title: string, description?: string): string => {
    return addToast({ type: "info", title, description });
  };

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: <MdCheckCircle className="h-5 w-5 text-green-500" />,
    error: <MdError className="h-5 w-5 text-red-500" />,
    warning: <MdWarning className="h-5 w-5 text-yellow-500" />,
    info: <MdInfo className="h-5 w-5 text-blue-500" />,
  };

  const backgroundColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative flex w-full items-start space-x-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${backgroundColors[toast.type]}`}
    >
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-600">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <div className="mt-2">
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => onRemove(toast.id)}
        >
          <span className="sr-only">Close</span>
          <MdClose className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
