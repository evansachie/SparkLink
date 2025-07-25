import { useState } from "react";
import { MdCloudUpload } from "react-icons/md";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Modal } from "../common/Modal";
import { CreateGalleryItemPayload } from "../../services/api/gallery";

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata: CreateGalleryItemPayload) => Promise<void>;
  uploading: boolean;
}

export function GalleryUploadModal({ isOpen, onClose, onUpload, uploading }: GalleryUploadModalProps) {
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Upload Image"
      size="md"
    >
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
    </Modal>
  );
}

export default GalleryUploadModal;
