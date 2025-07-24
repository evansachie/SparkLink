import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UpdateGalleryItemPayload } from "../../services/api/gallery";
import { GalleryItem } from "../../types/api";

interface GalleryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateGalleryItemPayload) => Promise<void>;
  item: GalleryItem | null;
  updating?: boolean;
}

export function GalleryEditModal({ isOpen, onClose, onUpdate, item, updating = false }: GalleryEditModalProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
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

export default GalleryEditModal;
