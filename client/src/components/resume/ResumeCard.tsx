import { motion } from "framer-motion";
import { 
  MdDescription, 
  MdDownload, 
  MdDelete, 
  MdVisibility,
  MdVisibilityOff,
  MdFilePresent,
  MdAccessTime,
  MdCloudDownload
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
      <Card className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MdDescription size={28} className="text-white" />
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate mb-2">
                {resume.originalName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MdFilePresent size={16} className="text-gray-400" />
                  {formatFileSize(resume.fileSize)}
                </div>
                <div className="flex items-center gap-1">
                  <MdAccessTime size={16} className="text-gray-400" />
                  Uploaded {formatDate(resume.createdAt)}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  resume.isPublic 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {resume.isPublic ? (
                    <>
                      <MdVisibility size={16} />
                      Public
                    </>
                  ) : (
                    <>
                      <MdVisibilityOff size={16} />
                      Private
                    </>
                  )}
                </span>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MdCloudDownload size={16} className="text-blue-500" />
                  <span className="font-semibold">{resume.downloadCount}</span> downloads
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

          {/* Actions Section */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onDownload}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <MdDownload size={18} />
              <span className="font-medium">Download</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onToggleVisibility(!resume.isPublic)}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              {resume.isPublic ? (
                <>
                  <MdVisibilityOff size={18} />
                  <span className="font-medium">Make Private</span>
                </>
              ) : (
                <>
                  <MdVisibility size={18} />
                  <span className="font-medium">Make Public</span>
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <MdDelete size={18} />
              <span className="font-medium">Delete</span>
            </Button>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Updating...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
