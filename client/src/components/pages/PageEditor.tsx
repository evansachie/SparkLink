import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdClose,
  MdSave,
  MdLock,
  MdPublic,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { CreatePagePayload, UpdatePagePayload } from "../../services/api/pages";
import Input from "../common/Input";
import Button from "../common/Button";
import { Page, PageType } from "../../types/api";

interface PageEditorProps {
  page?: Page | null;
  pageTypes: Array<{ value: PageType; label: string; description: string }>;
  onSave: (data: CreatePagePayload | UpdatePagePayload) => void;
  onClose: () => void;
  loading?: boolean;
  canPasswordProtected?: boolean;
}

const pageSchema = z.object({
  type: z.nativeEnum(PageType),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  slug: z.string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  headline: z.string().max(200, "Headline must be less than 200 characters").optional(),
  subheading: z.string().max(300, "Subheading must be less than 300 characters").optional(),
  content: z.string().max(5000, "Content must be less than 5000 characters").optional(),
  isPublished: z.boolean(),
  isPasswordProtected: z.boolean(),
  password: z.string().optional(),
});

type PageFormData = z.infer<typeof pageSchema>;

export default function PageEditor({
  page,
  pageTypes,
  onSave,
  onClose,
  loading = false,
  canPasswordProtected = false
}: PageEditorProps) {
  const [showPasswordField, setShowPasswordField] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      type: PageType.CUSTOM,
      title: "",
      slug: "",
      headline: "",
      subheading: "",
      content: "",
      isPublished: false,
      isPasswordProtected: false,
      password: "",
    },
  });

  const watchTitle = watch("title");
  const watchPasswordProtected = watch("isPasswordProtected");

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !page) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [watchTitle, setValue, page]);

  // Show/hide password field based on protection setting
  useEffect(() => {
    setShowPasswordField(watchPasswordProtected);
    if (!watchPasswordProtected) {
      setValue("password", "");
    }
  }, [watchPasswordProtected, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (page) {
      const content = page.content as Record<string, unknown>;
      reset({
        type: page.type,
        title: page.title,
        slug: page.slug,
        headline: (content?.headline as string) || "",
        subheading: (content?.subheading as string) || "",
        content: (Array.isArray(content?.sections) && content.sections[0] && 
                  typeof content.sections[0] === 'object' && 
                  'content' in content.sections[0]) 
                  ? String(content.sections[0].content) : "",
        isPublished: page.isPublished,
        isPasswordProtected: page.isPasswordProtected,
        password: "",
      });
    }
  }, [page, reset]);

  const onSubmit = (data: PageFormData) => {
    const formattedData = {
      type: data.type,
      title: data.title,
      slug: data.slug,
      content: {
        headline: data.headline,
        subheading: data.subheading,
        sections: data.content ? [{ type: "text", content: data.content }] : [],
      },
      isPublished: data.isPublished,
      isPasswordProtected: data.isPasswordProtected,
      password: data.isPasswordProtected ? data.password : undefined,
    };

    onSave(formattedData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-hidden"
      style={{ position: 'fixed' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {page ? "Edit Page" : "Create New Page"}
            </h2>
            <p className="text-gray-600 mt-1">
              {page ? "Update your page content and settings" : "Create a new page for your portfolio"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ maxHeight: "calc(85vh - 140px)" }}>
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Type
                </label>
                <select
                  {...register("type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  {pageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              <Input
                label="Page Title"
                placeholder="About Me"
                error={errors.title?.message}
                {...register("title")}
              />
            </div>

            <div>
              <Input
                label="URL Slug"
                placeholder="about-me"
                error={errors.slug?.message}
                {...register("slug")}
              />
              <p className="text-xs text-gray-500 mt-1">This will be part of your page URL</p>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Page Content</h3>
              
              <Input
                label="Headline (Optional)"
                placeholder="Welcome to my portfolio"
                error={errors.headline?.message}
                {...register("headline")}
              />

              <Input
                label="Subheading (Optional)"
                placeholder="I'm a creative professional passionate about..."
                error={errors.subheading?.message}
                {...register("subheading")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Optional)
                </label>
                <textarea
                  {...register("content")}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none"
                  placeholder="Write your page content here..."
                />
                {errors.content && (
                  <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Page Settings</h3>
              
              <div className="space-y-3">
                {/* Publish Setting */}
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isPublished")}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-2">
                    {watch("isPublished") ? (
                      <MdVisibility className="text-green-600" size={20} />
                    ) : (
                      <MdVisibilityOff className="text-gray-400" size={20} />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">Publish Page</div>
                      <div className="text-sm text-gray-600">
                        Make this page visible on your public portfolio
                      </div>
                    </div>
                  </div>
                </label>

                {/* Password Protection */}
                {canPasswordProtected && (
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isPasswordProtected")}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                    />
                    <div className="flex items-center gap-2">
                      {watch("isPasswordProtected") ? (
                        <MdLock className="text-orange-600" size={20} />
                      ) : (
                        <MdPublic className="text-gray-400" size={20} />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">Password Protection</div>
                        <div className="text-sm text-gray-600">
                          Require a password to view this page
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                {!canPasswordProtected && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700">
                      <MdLock size={16} />
                      <span className="text-sm font-medium">
                        Password protection requires a RISE or BLAZE subscription
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <AnimatePresence>
                {showPasswordField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      label="Page Password"
                      type="password"
                      placeholder="Enter a password for this page"
                      error={errors.password?.message}
                      {...register("password", {
                        required: watchPasswordProtected ? "Password is required when protection is enabled" : false
                      })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!isDirty && !page}
                  className="flex items-center gap-2"
                >
                  <MdSave size={20} />
                  {loading ? "Saving..." : page ? "Update Page" : "Create Page"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
