import { motion } from "framer-motion";
import { MdCheck } from "react-icons/md";
import { ColorScheme } from "../../services/api/template";

interface ColorSchemeSelectorProps {
  colorSchemes: ColorScheme[];
  selectedScheme: ColorScheme | null;
  onSchemeChange: (scheme: ColorScheme) => void;
  updating: boolean;
}

export default function ColorSchemeSelector({
  colorSchemes,
  selectedScheme,
  onSchemeChange,
  updating,
}: ColorSchemeSelectorProps) {
  if (colorSchemes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">No color schemes available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {colorSchemes.map((scheme) => {
          const isSelected = selectedScheme?.id === scheme.id;
          
          return (
            <motion.div
              key={scheme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => !updating && onSchemeChange(scheme)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Color Preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: scheme.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: scheme.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: scheme.colors.accent }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{scheme.name}</h4>
                    <p className="text-gray-600 text-sm">{scheme.description}</p>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="text-primary">
                    <MdCheck size={20} />
                  </div>
                )}
              </div>
              
              {/* Color Details */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div 
                      className="w-full h-6 rounded border border-gray-200 mb-1"
                      style={{ backgroundColor: scheme.colors.primary }}
                    />
                    <span className="text-gray-600">Primary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-full h-6 rounded border border-gray-200 mb-1"
                      style={{ backgroundColor: scheme.colors.secondary }}
                    />
                    <span className="text-gray-600">Secondary</span>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-full h-6 rounded border border-gray-200 mb-1"
                      style={{ backgroundColor: scheme.colors.accent }}
                    />
                    <span className="text-gray-600">Accent</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {updating && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-primary">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Updating color scheme...</span>
          </div>
        </div>
      )}
    </div>
  );
}
