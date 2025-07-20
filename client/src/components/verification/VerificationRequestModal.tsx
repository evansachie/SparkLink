import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MdClose,
  MdCloudUpload,
  MdDelete,
  MdDescription
} from "react-icons/md";
import { 
  VerificationType, 
  CreateVerificationPayload
} from "../../services/api/verification";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

interface VerificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVerificationPayload) => Promise<void>;
  submitting: boolean;
}

const VERIFICATION_TYPES = [
  {
    type: VerificationType.IDENTITY,
    label: "Identity Verification",
    description: "Verify your personal identity with government-issued ID",
    requiredDocs: ["Government-issued photo ID", "Proof of address"]
  },
  {
    type: VerificationType.BUSINESS,
    label: "Business Verification", 
    description: "Verify your business or company",
    requiredDocs: ["Business registration", "Tax certificate", "Business address proof"]
  },
  {
    type: VerificationType.SOCIAL,
    label: "Social Media Verification",
    description: "Verify your social media presence and influence",
    requiredDocs: ["Social media screenshots", "Follower count proof", "Content examples"]
  },
  {
    type: VerificationType.CELEBRITY,
    label: "Celebrity/Public Figure",
    description: "Verification for celebrities and public figures",
    requiredDocs: ["Media coverage", "Official website", "Public records"]
  },
  {
    type: VerificationType.ORGANIZATION,
    label: "Organization Verification",
    description: "Verify non-profit or other organizations",
    requiredDocs: ["Organization registration", "Official documents", "Website proof"]
  }
];

export default function VerificationRequestModal({
  isOpen,
  onClose,
  onSubmit,
  submitting
}: VerificationRequestModalProps) {
  const [selectedType, setSelectedType] = useState<VerificationType | null>(null);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"type" | "documents">("type");
  const [files, setFiles] = useState<File[]>([]);
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
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file =>
        file.type.includes('image/') || file.type.includes('pdf')
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const data: CreateVerificationPayload = {
      type: selectedType,
      notes: notes.trim() || undefined
    };

    await onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setNotes("");
    setStep("type");
    setFiles([]);
    onClose();
  };

  const selectedTypeInfo = VERIFICATION_TYPES.find(t => t.type === selectedType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Request Verification</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <MdClose size={20} />
          </Button>
        </div>

        {step === "type" ? (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Select Verification Type</h3>
            <div className="space-y-3">
              {VERIFICATION_TYPES.map((type) => (
                <Card
                  key={type.type}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedType === type.type 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedType(type.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        selectedType === type.type 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-300'
                      }`}>
                        {selectedType === type.type && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Required documents:</p>
                          <ul className="text-xs text-gray-500 mt-1">
                            {type.requiredDocs.map((doc, index) => (
                              <li key={index}>• {doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any additional context for your verification request..."
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!selectedType || submitting}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Upload Documents</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload documents for {selectedTypeInfo?.label}
              </p>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <MdCloudUpload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop files, or</p>
              <label className="cursor-pointer">
                <span className="text-primary hover:text-primary/80 font-medium">browse files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: Images (JPG, PNG, GIF) and PDF files
              </p>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Uploaded Files ({files.length})
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MdDescription size={16} className="text-gray-500" />
                      <span className="flex-1 text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <MdDelete size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep("type")}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={files.length === 0 || submitting}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
