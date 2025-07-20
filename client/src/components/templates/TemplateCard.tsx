import { motion } from "framer-motion";
import { MdCheck, MdLock, MdPreview, MdPalette } from "react-icons/md";
import { Template } from "../../services/api/template";
import { Button } from "../../components/ui/button";

interface TemplateCardProps {
  template: Template;
  isActive: boolean;
  canAccess: boolean;
  userTier: string;
  onApply: () => void;
  onPreview: () => void;
  applying: boolean;
  index: number;
}

export default function TemplateCard({
  template,
  isActive,
  canAccess,
  onApply,
  onPreview,
  applying,
  index,
}: TemplateCardProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'STARTER':
        return 'bg-gray-100 text-gray-700';
      case 'RISE':
        return 'bg-blue-100 text-blue-700';
      case 'BLAZE':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional':
        return 'bg-green-100 text-green-700';
      case 'creative':
        return 'bg-orange-100 text-orange-700';
      case 'premium':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
        isActive 
          ? 'border-primary bg-primary/5' 
          : canAccess 
            ? 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md' 
            : 'border-gray-200 bg-gray-50 opacity-75'
      }`}>
        
        {/* Template Preview Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={template.previewImage}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          
          {/* Overlay for locked templates */}
          {!canAccess && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <MdLock size={32} className="mx-auto mb-2" />
                <p className="text-sm font-medium">Requires {template.tier}</p>
              </div>
            </div>
          )}
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-2">
              <MdCheck size={16} />
            </div>
          )}
          
          {/* Preview button overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPreview}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <MdPreview size={16} className="mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
            <div className="flex gap-1 ml-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTierColor(template.tier)}`}>
                {template.tier}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
          
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
              {template.category}
            </span>
            
            {canAccess ? (
              isActive ? (
                <div className="flex items-center gap-2 text-primary">
                  <MdCheck size={16} />
                  <span className="text-sm font-medium">Active</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={onApply}
                  disabled={applying}
                  className="flex items-center gap-2"
                >
                  <MdPalette size={16} />
                  {applying ? "Applying..." : "Apply"}
                </Button>
              )
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <MdLock size={16} />
                <span className="text-sm">Locked</span>
              </div>
            )}
          </div>
          
          {/* Template Features */}
          {template.features && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {Object.entries(template.features)
                  .filter(([, value]) => Boolean(value))
                  .slice(0, 3)
                  .map(([key]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
