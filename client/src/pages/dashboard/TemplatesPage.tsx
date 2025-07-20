import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPalette, MdCheck } from "react-icons/md";

import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";
import {
  getTemplates,
  getTemplate,
  applyTemplate,
  updateColorScheme,
  Template,
  ColorScheme,
  ApplyTemplatePayload,
  UpdateColorsPayload,
} from "../../services/api/template";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";

import TemplateCard from "../../components/templates/TemplateCard";
import TemplatePreviewModal from "../../components/templates/TemplatePreviewModal";
import ColorSchemeSelector from "../../components/templates/ColorSchemeSelector";
import TemplateFilters from "../../components/templates/TemplateFilters";

interface TemplatePageState {
  templates: Template[];
  currentTemplate: Template | null;
  colorSchemes: ColorScheme[];
  selectedColorScheme: ColorScheme | null;
  loading: boolean;
  applying: boolean;
  updating: boolean;
}

export default function TemplatesPage() {
  const { success, error } = useToast();
  const { user } = useAuth();
  
  const [state, setState] = useState<TemplatePageState>({
    templates: [],
    currentTemplate: null,
    colorSchemes: [],
    selectedColorScheme: null,
    loading: true,
    applying: false,
    updating: false,
  });

  const [filters, setFilters] = useState({
    category: "all",
    tier: "all",
    search: "",
  });

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load templates and color schemes
  useEffect(() => {
    const loadTemplateData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await getTemplates();
        
        setState(prev => ({
          ...prev,
          templates: response.templates || [],
          colorSchemes: response.colorSchemes || [],
          loading: false,
        }));
        
        // Set current template if user has one
        const userProfile = user?.profile as { templateId?: string; colorScheme?: string } | undefined;
        if (userProfile?.templateId) {
          const current = response.templates.find((t: Template) => t.id === userProfile.templateId);
          if (current) {
            setState(prev => ({ ...prev, currentTemplate: current }));
          }
        }
        
        // Set current color scheme
        if (userProfile?.colorScheme) {
          const currentScheme = response.colorSchemes.find((cs: ColorScheme) => cs.id === userProfile.colorScheme);
          if (currentScheme) {
            setState(prev => ({ ...prev, selectedColorScheme: currentScheme }));
          }
        }
      } catch (err) {
        error("Failed to load templates", getErrorMessage(err));
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadTemplateData();
  }, [error, user?.profile]);

  // Filter templates based on current filters
  const filteredTemplates = state.templates.filter(template => {
    if (filters.category !== "all" && template.category !== filters.category) {
      return false;
    }
    
    if (filters.tier !== "all" && template.tier !== filters.tier) {
      return false;
    }
    
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !template.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return template.isActive;
  });

  // Check if user can access template based on subscription
  const canAccessTemplate = (template: Template): boolean => {
    const userTier = (user?.subscription as string) || 'STARTER';
    
    switch (userTier) {
      case 'BLAZE':
        return true;
      case 'RISE':
        return ['RISE', 'STARTER'].includes(template.tier);
      case 'STARTER':
      default:
        return template.tier === 'STARTER';
    }
  };

  // Handle template application
  const handleApplyTemplate = async (template: Template) => {
    if (!canAccessTemplate(template)) {
      error(`This template requires a ${template.tier} subscription`);
      return;
    }

    try {
      setState(prev => ({ ...prev, applying: true }));
      
      const payload: ApplyTemplatePayload = {
        templateId: template.id,
        colorScheme: state.selectedColorScheme?.id,
      };

      await applyTemplate(payload);
      
      setState(prev => ({
        ...prev,
        currentTemplate: template,
        applying: false,
      }));
      
      success(`${template.name} template applied successfully!`);
    } catch (err) {
      error("Failed to apply template", getErrorMessage(err));
      setState(prev => ({ ...prev, applying: false }));
    }
  };

  // Handle color scheme update
  const handleColorSchemeChange = async (colorScheme: ColorScheme) => {
    try {
      setState(prev => ({ ...prev, updating: true }));
      
      const payload: UpdateColorsPayload = {
        colorScheme: colorScheme.id,
      };

      await updateColorScheme(payload);
      
      setState(prev => ({
        ...prev,
        selectedColorScheme: colorScheme,
        updating: false,
      }));
      
      success("Color scheme updated successfully!");
    } catch (err) {
      error("Failed to update color scheme", getErrorMessage(err));
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  // Handle template preview
  const handlePreviewTemplate = async (template: Template) => {
    try {
      const fullTemplate = await getTemplate(template.id);
      setPreviewTemplate(fullTemplate);
      setShowPreview(true);
    } catch (err) {
      error("Failed to load template preview", getErrorMessage(err));
    }
  };

  if (state.loading) {
    return <LoadingState text="Loading templates..." fullscreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
            <MdPalette size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600">Choose a design that represents your style</p>
          </div>
        </div>
      </motion.div>

      {/* Current Template & Color Scheme */}
      {state.currentTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Design</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={state.currentTemplate.previewImage}
                  alt={state.currentTemplate.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{state.currentTemplate.name}</h3>
                  <p className="text-gray-600 text-sm">{state.currentTemplate.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {state.currentTemplate.tier}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {state.currentTemplate.category}
                    </span>
                  </div>
                </div>
                <div className="text-green-600">
                  <MdCheck size={24} />
                </div>
              </div>
            </div>
            
            <div className="lg:w-80">
              <ColorSchemeSelector
                colorSchemes={state.colorSchemes}
                selectedScheme={state.selectedColorScheme}
                onSchemeChange={handleColorSchemeChange}
                updating={state.updating}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <TemplateFilters
          filters={filters}
          onFiltersChange={setFilters}
          templates={state.templates}
        />
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Templates</h2>
          <p className="text-gray-600">{filteredTemplates.length} templates found</p>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <MdPalette size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more templates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isActive={state.currentTemplate?.id === template.id}
                  canAccess={canAccessTemplate(template)}
                  userTier={(user?.subscription as string) || 'STARTER'}
                  onApply={() => handleApplyTemplate(template)}
                  onPreview={() => handlePreviewTemplate(template)}
                  applying={state.applying && state.currentTemplate?.id !== template.id}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewTemplate(null);
        }}
        onApply={previewTemplate ? () => handleApplyTemplate(previewTemplate) : undefined}
        canAccess={previewTemplate ? canAccessTemplate(previewTemplate) : false}
        applying={state.applying}
      />
    </div>
  );
}
