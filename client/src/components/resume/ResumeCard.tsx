import { motion } from "framer-motion";
import { 
  MdDescription, 
  MdDownload, 
  MdDelete, 
  MdVisibility,
  MdVisibilityOff
} from "react-icons/md";
import { Resume } from "../../services/api/resume";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { formatFileSize, formatDate } from "../../utils/format";

interface ResumeCardProps {
  resume: Resume;
  onDownload: () => void;
  onToggleVisibility: (isPublic: boolean) => void;
  onDelete: () => void;
  loading?: boolean;
}

export default function ResumeCard({
  resume,
  onDownload,
  onToggleVisibility,
  onDelete,
  loading = false
}: ResumeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <MdDescription size={24} className="text-red-600" />
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {resume.originalName}
              </h3>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-600">
                  {formatFileSize(resume.fileSize)} • Uploaded {formatDate(resume.createdAt)}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Downloads: {resume.downloadCount}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    resume.isPublic 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {resume.isPublic ? (
                      <>
                        <MdVisibility size={14} />
                        Public
                      </>
                    ) : (
                      <>
                        <MdVisibilityOff size={14} />
                        Private
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                disabled={loading}
              >
                <MdDownload size={16} className="mr-1" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleVisibility(!resume.isPublic)}
                disabled={loading}
              >
                {resume.isPublic ? (
                  <MdVisibilityOff size={16} />
                ) : (
                  <MdVisibility size={16} />
                )}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={loading}
              >
                <MdDelete size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
