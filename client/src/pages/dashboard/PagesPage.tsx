import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAuth } from "../../context/AuthContext";
import { 
  getPages, 
  createPage, 
  updatePage, 
  deletePage, 
  reorderPages,
  CreatePagePayload,
  UpdatePagePayload} from "../../services/api/pages";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { useToast } from "../../hooks/useToast";
import PageEditor from "../../components/pages/PageEditor";
import SortablePageCard from "../../components/pages/SortablePageCard";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { CustomScrollbar } from "../../components/ui/custom-scrollbar";
import { Alert } from "../../components/ui/alert-message";
import { PageHeader } from "../../components/pages/PageHeader";
import { EmptyPagesState } from "../../components/pages/EmptyPagesState";
import { PageType, Page } from "../../types/api";
import { PAGE_TYPE_OPTIONS } from "../../constants/pageTypes";

export default function PagesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);

  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPages();
      const convertedPages = data.pages.map(page => ({
        ...page,
        type: page.type as unknown as PageType
      }));
      setPages(convertedPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load pages"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowEditor(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleSavePage = async (pageData: CreatePagePayload | UpdatePagePayload) => {
    try {
      setEditorLoading(true);
      setError(null);

      if (editingPage) {
        const updatedPage = await updatePage(editingPage.id, pageData as UpdatePagePayload);
        const convertedPage = {
          ...updatedPage.page,
          type: updatedPage.page.type as unknown as PageType
        };
        setPages(prev => prev.map(p => p.id === editingPage.id ? convertedPage : p));
        setSuccess("Page updated successfully!");
      } else {
        // Create new page
        const newPage = await createPage(pageData as CreatePagePayload);
        const convertedPage = {
          ...newPage.page,
          type: newPage.page.type as unknown as PageType
        };
        setPages(prev => [...prev, convertedPage]);
        setSuccess("Page created successfully!");
      }

      setShowEditor(false);
      setEditingPage(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save page"));
    } finally {
      setEditorLoading(false);
    }
  };

  const handleDeletePage = async () => {
    if (!pageToDelete) return;

    try {
      setDeleting(true);
      await deletePage(pageToDelete.id);
      setPages(prev => prev.filter(p => p.id !== pageToDelete.id));
      setSuccess("Page deleted successfully!");
      setPageToDelete(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete page"));
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      const updatedPage = await updatePage(page.id, {
        isPublished: !page.isPublished
      });
      const convertedPage = {
        ...updatedPage.page,
        type: updatedPage.page.type as unknown as PageType
      };
      setPages(prev => prev.map(p => p.id === page.id ? convertedPage : p));
      setSuccess(`Page ${!page.isPublished ? 'published' : 'unpublished'} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update page"));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = pages.findIndex((page) => page.id === active.id);
      const newIndex = pages.findIndex((page) => page.id === over?.id);

      const newPages = arrayMove(pages, oldIndex, newIndex);
      
      // Update local state immediately for better UX
      setPages(newPages);

      try {
        // Update order numbers
        const pageOrders = newPages.map((page, index) => ({
          id: page.id,
          order: index
        }));

        await reorderPages({ pageOrders });
        setSuccess("Pages reordered successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        // Revert on error
        loadPages();
        setError(getErrorMessage(err, "Failed to reorder pages"));
      }
    }
  };

  const getPublicUrl = (page: Page) => {
    const baseUrl = window.location.origin;
    const username = (user && typeof user === "object" && "username" in user && typeof user.username === "string")
      ? user.username
      : "username";
    return `${baseUrl}/public/${username}/pages/${page.slug}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Using toast instead of success state
    toast.success("URL copied to clipboard!");
  };

  const getSubscriptionLimits = () => {
    const subscription = (user && typeof user === "object" && "subscription" in user && typeof user.subscription === "string")
      ? user.subscription
      : "STARTER";
    switch (subscription) {
      case 'STARTER':
        return { maxPages: 3, passwordProtection: false };
      case 'RISE':
        return { maxPages: 10, passwordProtection: true };
      case 'BLAZE':
        return { maxPages: Infinity, passwordProtection: true };
      default:
        return { maxPages: 3, passwordProtection: false };
    }
  };

  const limits = getSubscriptionLimits();
  const canCreatePage = pages.length < limits.maxPages;

  const userSubscription = (user && typeof user === "object" && "subscription" in user && typeof user.subscription === "string")
    ? user.subscription
    : "STARTER";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // We can use toast instead of the error/success states in future

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader 
        title="Page Management"
        subtitle="Create and manage your portfolio pages"
        count={pages.length}
        maxCount={limits.maxPages}
        onCreateClick={handleCreatePage}
        canCreate={canCreatePage}
        userSubscription={userSubscription}
      />

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <Alert
            message={error}
            type="error"
            onClose={() => setError(null)}
          />
        )}

        {success && (
          <Alert
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}
      </AnimatePresence>

      {/* Pages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Your Pages</h2>
          <p className="text-gray-600 text-sm mt-1">
            Drag and drop to reorder pages
          </p>
        </div>

        <CustomScrollbar className="p-6 max-h-[500px]">
          {pages.length === 0 ? (
            <EmptyPagesState onCreateClick={handleCreatePage} />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pages.map(page => page.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {pages.map((page) => (
                    <SortablePageCard
                      key={page.id}
                      page={page}
                      onEdit={handleEditPage}
                      onDelete={(page) => setPageToDelete(page)}
                      onTogglePublish={handleTogglePublish}
                      onCopyUrl={(page) => copyToClipboard(getPublicUrl(page))}
                      canPasswordProtected={limits.passwordProtection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CustomScrollbar>
      </motion.div>

      {/* Page Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <PageEditor
            page={editingPage}
            pageTypes={PAGE_TYPE_OPTIONS}
            onSave={handleSavePage}
            onClose={() => {
              setShowEditor(false);
              setEditingPage(null);
            }}
            loading={editorLoading}
            canPasswordProtected={limits.passwordProtection}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pageToDelete}
        title="Delete Page"
        message={`Are you sure you want to delete "${pageToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeletePage}
        onCancel={() => setPageToDelete(null)}
        loading={deleting}
        type="danger"
      />
    </div>
  );
}
