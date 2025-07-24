import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  MdPhotoLibrary,
  MdAdd,
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

import { useToast } from "../../hooks/useToast";
import {
  getGalleryItems,
  uploadGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  CreateGalleryItemPayload,
  UpdateGalleryItemPayload,
} from "../../services/api/gallery";
import { GalleryItem } from "../../types/api";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingCard } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { SortableGalleryItem } from "../../components/gallery/SortableGalleryItem";
import { GalleryUploadModal } from "../../components/gallery/GalleryUploadModal";
import { GalleryEditModal } from "../../components/gallery/GalleryEditModal";

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
        setItems(galleryItems.sort((a, b) => (a.order || 0) - (b.order || 0)));
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
        setItems(galleryItems.sort((a, b) => (a.order || 0) - (b.order || 0)));
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
