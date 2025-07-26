import { MdWarning, MdError, MdInfo } from "react-icons/md";
import Button from "./Button";
import { getConfirmButtonVariant } from "../../utils/getConfirmButtonVariant";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  type?: "warning" | "danger" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  type = "warning"
}: ConfirmDialogProps) {
  
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <MdError className="text-red-500" size={24} />;
      case "info":
        return <MdInfo className="text-blue-500" size={24} />;
      default:
        return <MdWarning className="text-orange-500" size={24} />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="md"
      showCloseButton={false}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
          
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${getConfirmButtonVariant(type)}`}
          >
            {loading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
