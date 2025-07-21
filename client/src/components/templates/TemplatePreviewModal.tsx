import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdPalette, MdLock, MdCheck } from "react-icons/md";
import { Template } from "../../services/api/template";
import { Button } from "../../components/ui/button";

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  canAccess: boolean;
  applying: boolean;
}

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onApply,
  canAccess,
  applying,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  const getFeaturesList = () => {
    if (!template.features) return [];
    
    return Object.entries(template.features)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => ({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <MdPalette size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                  <p className="text-gray-600">{template.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-200px)]">
              {/* Preview Image */}
              <div className="lg:flex-1 p-6">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                  {!canAccess && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <div className="text-center text-white">
                        <MdLock size={48} className="mx-auto mb-3" />
                        <p className="text-lg font-medium">Requires {template.tier} Plan</p>
                        <p className="text-sm opacity-90">Upgrade to unlock this template</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Details */}
              <div className="lg:w-80 p-6 border-l border-gray-200 overflow-y-auto">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded capitalize">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tier:</span>
                        <span className={`px-2 py-1 text-sm rounded font-medium ${
                          template.tier === 'STARTER' ? 'bg-gray-100 text-gray-700' :
                          template.tier === 'RISE' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {template.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {getFeaturesList().length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                      <div className="space-y-2">
                        {getFeaturesList().map((feature) => (
                          <div key={feature.key} className="flex items-center gap-2">
                            <MdCheck size={16} className="text-green-600" />
                            <span className="text-gray-700 text-sm">{feature.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    {canAccess ? (
                      onApply && (
                        <Button
                          onClick={onApply}
                          disabled={applying}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <MdPalette size={20} />
                          {applying ? "Applying Template..." : "Apply This Template"}
                        </Button>
                      )
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                          <MdLock size={20} />
                          <span className="font-medium">Template Locked</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                          Upgrade to {template.tier} plan to unlock this template
                        </p>
                        <Button variant="outline" className="w-full">
                          Upgrade Plan
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
