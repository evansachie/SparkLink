import { useState, useEffect, useCallback } from "react";
import { 
  MdDescription, 
  MdAdd, 
  MdCloudUpload,
  MdAnalytics,
  MdShare,
  MdRefresh
} from "react-icons/md";

import { useToast } from "../../hooks/useToast";
import {
  getResume,
  uploadResume,
  updateResume,
  deleteResume,
  downloadResume,
  type Resume,
  type ResumeAnalytics,
  type ResumeUpdatePayload
} from "../../services/api/resume";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import ResumeCard from "../../components/resume/ResumeCard";
import ResumeUploadModal from "../../components/resume/ResumeUploadModal";

export default function ResumePage() {
  const { success, error } = useToast();
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [, setAnalytics] = useState<ResumeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load resume data
  const loadResumeData = useCallback(async () => {
    try {
      setLoading(true);
      
      try {
        const resumeData = await getResume();
        setResume(resumeData);
      } catch (resumeErr) {
        console.error("Failed to load resume:", resumeErr);
        setResume(null);
      }
    } catch (err) {
      const errMessage = getErrorMessage(err);
      if (!errMessage.includes("404")) {
        error("Failed to load resume data", errMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const newResume = await uploadResume(file);
      setResume(newResume);
      success("Resume uploaded successfully!");
      setShowUploadModal(false);
      
      // Reload analytics
      loadResumeData();
    } catch (err) {
      error("Failed to upload resume", getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;

    try {
      const blob = await downloadResume();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      success("Resume downloaded successfully!");
      
      // Reload analytics to update download count
      loadResumeData();
    } catch (err) {
      error("Failed to download resume", getErrorMessage(err));
    }
  };

  const handleToggleVisibility = async (isPublic: boolean) => {
    if (!resume) return;

    try {
      setUpdating(true);
      const payload: ResumeUpdatePayload = { isPublic };
      const updatedResume = await updateResume(payload);
      setResume(updatedResume);
      success(`Resume is now ${isPublic ? 'public' : 'private'}`);
    } catch (err) {
      error("Failed to update resume visibility", getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResume();
      setResume(null);
      setAnalytics(null);
      success("Resume deleted successfully!");
      setShowDeleteConfirm(false);
    } catch (err) {
      error("Failed to delete resume", getErrorMessage(err));
    }
  };

  if (loading) {
    return <LoadingState text="Loading resume data..." fullscreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MdDescription size={24} className="text-white" />
                </div>
                Resume Management
              </h1>
              <p className="text-gray-600 text-lg">
                Upload, manage, and track your professional resume with analytics
              </p>
            </div>
            
            {!resume && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <MdAdd size={20} className="mr-2" />
                Upload Resume
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!resume ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdCloudUpload size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No resume uploaded</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Upload your resume to share it with potential employers, track downloads, and gain valuable insights into your application performance.
              </p>
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                <MdAdd size={24} className="mr-3" />
                Upload Your Resume
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <ResumeCard
                resume={resume}
                onDownload={handleDownload}
                onToggleVisibility={handleToggleVisibility}
                onDelete={() => setShowDeleteConfirm(true)}
                loading={updating}
              />
            </div>

            {/* Action Panel */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MdAnalytics size={20} className="text-blue-600" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <MdRefresh size={16} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Replace Resume</div>
                      <div className="text-xs text-gray-500">Upload a new version</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                    onClick={() => navigator.clipboard.writeText(window.location.origin + '/resume/' + resume.id)}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <MdShare size={16} className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Share Link</div>
                      <div className="text-xs text-gray-500">Copy public URL</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MdAnalytics size={20} />
                  Resume Stats
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="text-2xl font-bold">{resume.downloadCount}</div>
                    <div className="text-blue-100 text-sm">Total Downloads</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="text-lg font-semibold">
                      {resume.isPublic ? 'Public' : 'Private'}
                    </div>
                    <div className="text-blue-100 text-sm">Visibility Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        <ResumeUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          uploading={uploading}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Resume"
          message="Are you sure you want to delete your resume? This action cannot be undone and will remove all analytics data."
          confirmText="Delete Resume"
          type="danger"
        />
      </div>
    </div>
  );
}
