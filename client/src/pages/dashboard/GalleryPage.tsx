import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPhotoLibrary,
  MdAdd,
  MdEdit,
  MdDelete,
  MdDragIndicator,
  MdVisibility,
  MdVisibilityOff,
  MdClose,
  MdCloudUpload,
} from "react-icons/md";
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useToast } from "../../hooks/useToast";
import {
  getGalleryItems,
  uploadGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  GalleryItem,
  CreateGalleryItemPayload,
  UpdateGalleryItemPayload,
} from "../../services/api/gallery";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingCard } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import ConfirmDialog from "../../components/common/ConfirmDialog";

interface SortableGalleryItemProps {
  item: GalleryItem;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

function SortableGalleryItem({ item, onEdit, onDelete, onToggleVisibility }: SortableGalleryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-gray-100">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(item)}
              >
                <MdEdit size={16} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onToggleVisibility(item.id, !item.isVisible)}
              >
                {item.isVisible ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(item.id)}
              >
                <MdDelete size={16} />
              </Button>
            </div>
          </div>

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 bg-white/90 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MdDragIndicator size={16} className="text-gray-600" />
          </div>

          {/* Visibility indicator */}
          {!item.isVisible && (
            <div className="absolute top-2 right-2 p-1 bg-red-100 rounded">
              <MdVisibilityOff size={16} className="text-red-600" />
            </div>
          )}
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm truncate">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          )}
          {item.category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
              {item.category}
            </span>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata: CreateGalleryItemPayload) => Promise<void>;
  uploading: boolean;
}

function GalleryUploadModal({ isOpen, onClose, onUpload, uploading }: GalleryUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.split('.')[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const metadata: CreateGalleryItemPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      isVisible: true,
    };

    await onUpload(file, metadata);
    
    // Reset form
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setTags("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Image</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <MdClose size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : file 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="mx-auto h-20 w-20 object-cover rounded"
                />
                <p className="text-sm text-green-600 font-medium">{file.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <MdCloudUpload size={32} className="mx-auto text-gray-400" />
                <p className="text-gray-600">Drag and drop an image, or</p>
                <label className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80 font-medium">browse files</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Projects, Products"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!file || !title.trim() || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface GalleryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateGalleryItemPayload) => Promise<void>;
  item: GalleryItem | null;
  updating?: boolean;
}

function GalleryEditModal({ isOpen, onClose, onUpdate, item, updating = false }: GalleryEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setCategory(item.category || "");
      setTags(item.tags?.join(", ") || "");
      setIsVisible(item.isVisible);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !title.trim()) return;

    const data: UpdateGalleryItemPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      isVisible,
    };

    await onUpdate(item.id, data);
    onClose();
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setTags("");
    setIsVisible(true);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Image</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <MdClose size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image Preview */}
          <div className="flex justify-center">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-32 w-32 object-cover rounded-lg border"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Projects, Products"
              />
            </div>

            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated tags"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-visible"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-visible">Visible in gallery</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || updating}
            >
              {updating ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function GalleryPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load gallery items
  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        const { items: galleryItems } = await getGalleryItems();
        setItems(galleryItems.sort((a, b) => a.order - b.order));
      } catch (err) {
        error("Failed to load gallery", getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadGalleryItems();
  }, [error]);

  const handleUpload = async (file: File, metadata: CreateGalleryItemPayload) => {
    try {
      setUploading(true);
      const newItem = await uploadGalleryItem(file, metadata);
      setItems(prev => [...prev, newItem]);
      success("Image uploaded successfully!");
      setShowUploadModal(false);
    } catch (err) {
      error("Failed to upload image", getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (id: string, data: UpdateGalleryItemPayload) => {
    try {
      setUpdating(true);
      const updatedItem = await updateGalleryItem(id, data);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      success("Image updated successfully!");
      setShowEditModal(false);
      setEditingItem(null);
    } catch (err) {
      error("Failed to update image", getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      success("Image deleted successfully!");
      setDeleteConfirm(null);
    } catch (err) {
      error("Failed to delete image", getErrorMessage(err));
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      await handleUpdate(id, { isVisible });
    } catch (err) {
      error("Failed to update visibility", getErrorMessage(err));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order on server
      const itemOrders = newItems.map((item, index) => ({
        id: item.id,
        order: index
      }));

      try {
        await reorderGalleryItems({ itemOrders });
        success("Gallery order updated!");
      } catch (err) {
        error("Failed to update order", getErrorMessage(err));
        // Revert on failure
        const { items: galleryItems } = await getGalleryItems();
        setItems(galleryItems.sort((a, b) => a.order - b.order));
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600">Manage your media and images</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingCard key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MdPhotoLibrary size={28} className="text-primary" />
            Gallery
          </h1>
          <p className="text-gray-600">Manage your media and images ({items.length} items)</p>
        </div>
        
        <Button onClick={() => setShowUploadModal(true)}>
          <MdAdd size={20} className="mr-2" />
          Upload Image
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <MdPhotoLibrary size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Start building your gallery by uploading your first image. You can organize them by categories and tags.
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <MdAdd size={20} className="mr-2" />
            Upload Your First Image
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {items.map((item) => (
                  <SortableGalleryItem
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteConfirm(id)}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Modal */}
      <GalleryUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />

      {/* Edit Modal */}
      <GalleryEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onUpdate={handleUpdate}
        item={editingItem}
        updating={updating}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
