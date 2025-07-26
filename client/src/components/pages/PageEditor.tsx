import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdSave,
  MdLock,
  MdPublic,
  MdVisibility,
  MdVisibilityOff,
  MdClose,
} from "react-icons/md";
import { CreatePagePayload, UpdatePagePayload } from "../../services/api/pages";
import Input from "../common/Input";
import Button from "../common/Button";
import { Page, PageType } from "../../types/api";
import { CustomCheckbox } from "../ui/custom-checkbox";
import { CustomScrollbar } from "../ui/custom-scrollbar";
import { Modal } from "../common/Modal";

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
    control,
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
    <Modal
      isOpen={true}
      onClose={onClose}
      size="5xl"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shrink-0">
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <MdClose size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form Content with Custom Scrollbar */}
        <CustomScrollbar className="flex-1 min-h-0">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 p-6 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Type
                    </label>
                    <select
                      {...register("type")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors duration-200 bg-white"
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
              </div>

              {/* Content Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Page Content</h3>
                  <p className="text-sm text-gray-600 mt-1">Add your page content and structure</p>
                </div>
                
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-colors duration-200"
                    placeholder="Write your page content here..."
                  />
                  {errors.content && (
                    <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Page Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure page visibility and access</p>
                </div>
                
                <div className="space-y-4">
                  {/* Publish Setting */}
                  <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                    <Controller
                      control={control}
                      name="isPublished"
                      render={({ field }) => (
                        <CustomCheckbox
                          checked={field.value}
                          onChange={field.onChange}
                          label={
                            <div className="flex items-center gap-3">
                              {watch("isPublished") ? (
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <MdVisibility className="text-green-600" size={20} />
                                </div>
                              ) : (
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <MdVisibilityOff className="text-gray-400" size={20} />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">Publish Page</div>
                                <div className="text-sm text-gray-600">
                                  Make this page visible on your public portfolio
                                </div>
                              </div>
                            </div>
                          }
                        />
                      )}
                    />
                  </div>

                  {/* Password Protection */}
                  {canPasswordProtected && (
                    <div className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                      <Controller
                        control={control}
                        name="isPasswordProtected"
                        render={({ field }) => (
                          <CustomCheckbox
                            checked={field.value}
                            onChange={field.onChange}
                            label={
                              <div className="flex items-center gap-3">
                                {watch("isPasswordProtected") ? (
                                  <div className="p-2 bg-orange-100 rounded-lg">
                                    <MdLock className="text-orange-600" size={20} />
                                  </div>
                                ) : (
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <MdPublic className="text-gray-400" size={20} />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900">Password Protection</div>
                                  <div className="text-sm text-gray-600">
                                    Require a password to view this page
                                  </div>
                                </div>
                              </div>
                            }
                          />
                        )}
                      />
                    </div>
                  )}

                  {!canPasswordProtected && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
                      <div className="flex items-center gap-3 text-orange-700">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MdLock size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            Password protection requires a RISE or BLAZE subscription
                          </span>
                          <p className="text-xs text-orange-600 mt-1">
                            Upgrade to unlock this premium feature
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                {showPasswordField && (
                  <div className="transition-all duration-300 ease-in-out transform">
                    <Input
                      label="Page Password"
                      type="password"
                      placeholder="Enter a secure password for this page"
                      error={errors.password?.message}
                      {...register("password", {
                        required: watchPasswordProtected ? "Password is required when protection is enabled" : false
                      })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 border-t border-gray-200 bg-white shrink-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={(!isDirty && !page) || loading}
                    className="px-8 py-2.5 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 min-w-[140px] justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <MdSave size={18} />
                        <span>{page ? "Update Page" : "Create Page"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CustomScrollbar>
      </div>
    </Modal>
  );
}
