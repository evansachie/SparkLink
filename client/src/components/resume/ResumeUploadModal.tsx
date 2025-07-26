import { useState } from "react";
import { 
  MdCloudUpload, 
  MdDescription
} from "react-icons/md";
import { Button } from "../ui/button";
import Modal from "../common/Modal";

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onUpload,
  uploading
}: ResumeUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
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
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await onUpload(file);
    
    // Reset form
    setFile(null);
    onClose();
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Upload Resume"
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
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                  <MdDescription size={24} className="text-red-600" />
                </div>
                <p className="text-sm text-green-600 font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <MdCloudUpload size={32} className="mx-auto text-gray-400" />
                <p className="text-gray-600">Drag and drop a PDF file, or</p>
                <label className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80 font-medium">browse files</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Only PDF files are supported (max 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </div>
        </form>
      </Modal>
  );
}
