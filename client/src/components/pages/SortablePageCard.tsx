import { motion } from "framer-motion";
import {
  MdDragHandle,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdVisibilityOff,
  MdLock,
  MdPublic,
  MdContentCopy,
} from "react-icons/md";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Page } from "../../types/api";
import { PAGE_TYPE_COLORS, PAGE_TYPE_LABELS } from "../../constants/pageTypes";

interface SortablePageCardProps {
  page: Page;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
  onTogglePublish: (page: Page) => void;
  onCopyUrl: (page: Page) => void;
  canPasswordProtected?: boolean;
}

export default function SortablePageCard({
  page,
  onEdit,
  onDelete,
  onTogglePublish,
  onCopyUrl}: SortablePageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg opacity-50' : ''
      }`}
      whileHover={{ y: isDragging ? 0 : -2 }}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <MdDragHandle size={20} />
        </div>

        {/* Page Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {page.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    PAGE_TYPE_COLORS[page.type]
                  }`}
                >
                  {PAGE_TYPE_LABELS[page.type]}
                </span>
                {page.isPasswordProtected && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <MdLock size={16} />
                    <span className="text-xs font-medium">Protected</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <span>/{page.slug}</span>
                <span>•</span>
                <span>Created {formatDate(page.createdAt)}</span>
                <span>•</span>
                <span>Updated {formatDate(page.updatedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  page.isPublished
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {page.isPublished ? <MdPublic size={14} /> : <MdVisibilityOff size={14} />}
                  {page.isPublished ? "Published" : "Draft"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              {page.isPublished && (
                <motion.button
                  onClick={() => onCopyUrl(page)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Copy public URL"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MdContentCopy size={18} />
                </motion.button>
              )}

              <motion.button
                onClick={() => onTogglePublish(page)}
                className={`p-2 rounded-lg transition-colors ${
                  page.isPublished
                    ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                    : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                }`}
                title={page.isPublished ? "Unpublish" : "Publish"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {page.isPublished ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
              </motion.button>

              <motion.button
                onClick={() => onEdit(page)}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Edit page"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdEdit size={18} />
              </motion.button>

              <motion.button
                onClick={() => onDelete(page)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete page"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdDelete size={18} />
              </motion.button>
            </div>
          </div>

          {/* Page Content Preview */}
          {page.content && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                {typeof page.content === 'object' && 'headline' in page.content && (
                  <div className="font-medium text-gray-900 mb-1">
                    {String(page.content.headline)}
                  </div>
                )}
                {typeof page.content === 'object' && 'subheading' in page.content && (
                  <div className="text-gray-600">
                    {String(page.content.subheading)}
                  </div>
                )}
                {(!page.content || 
                  (typeof page.content === 'object' && !('headline' in page.content) && !('subheading' in page.content))
                ) && (
                  <div className="text-gray-400 italic">
                    No content preview available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
