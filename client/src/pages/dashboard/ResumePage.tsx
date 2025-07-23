import { useState, useEffect, useCallback } from "react";
import { 
  MdDescription, 
  MdAdd, 
  MdBarChart,
  MdCloudUpload
} from "react-icons/md";

import { useToast } from "../../hooks/useToast";
import {
  getResume,
  uploadResume,
  updateResume,
  deleteResume,
  downloadResume,
  getResumeAnalytics,
  type Resume,
  type ResumeAnalytics,
  type ResumeUpdatePayload
} from "../../services/api/resume";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import ResumeCard from "../../components/resume/ResumeCard";
import ResumeUploadModal from "../../components/resume/ResumeUploadModal";

export default function ResumePage() {
  const { success, error } = useToast();
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [analytics, setAnalytics] = useState<ResumeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load resume data
  const loadResumeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Handle resume data loading with better error handling
      try {
        const resumeData = await getResume();
        setResume(resumeData);
        
        // Only fetch analytics if we have a resume
        if (resumeData) {
          try {
            const analyticsData = await getResumeAnalytics();
            setAnalytics(analyticsData);
          } catch (analyticsErr) {
            console.error("Failed to load resume analytics:", analyticsErr);
            setAnalytics(null);
          }
        }
      } catch (resumeErr) {
        console.error("Failed to load resume:", resumeErr);
        // Don't show an error for 404, just set resume to null
        setResume(null);
      }
    } catch (err) {
      // Only show errors that aren't 404s
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MdDescription size={28} className="text-primary" />
            Resume Management
          </h1>
          <p className="text-gray-600">
            Upload and manage your professional resume
          </p>
        </div>
        
        {!resume && (
          <Button onClick={() => setShowUploadModal(true)}>
            <MdAdd size={20} className="mr-2" />
            Upload Resume
          </Button>
        )}
      </div>

      {/* Main Content */}
      {!resume ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdCloudUpload size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resume uploaded</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Upload your resume to share it with potential employers and track downloads.
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <MdAdd size={20} className="mr-2" />
            Upload Your Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Card */}
          <div className="lg:col-span-2">
            <ResumeCard
              resume={resume}
              onDownload={handleDownload}
              onToggleVisibility={handleToggleVisibility}
              onDelete={() => setShowDeleteConfirm(true)}
              loading={updating}
            />
          </div>

          {/* Analytics Panel */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MdBarChart size={20} className="text-primary" />
                    Analytics
                  </h3>
                </div>

                {analytics ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {analytics.totalDownloads}
                      </p>
                      <p className="text-sm text-gray-600">Total Downloads</p>
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {analytics.monthlyDownloads}
                      </p>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>

                    {analytics.recentDownloads.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Recent Activity
                        </h4>
                        <div className="space-y-2">
                          {analytics.recentDownloads.slice(0, 3).map((download, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              Downloaded on {new Date(download.downloadDate).toLocaleDateString()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    Loading analytics...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Replace Resume Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowUploadModal(true)}
            >
              <MdAdd size={16} className="mr-2" />
              Replace Resume
            </Button>
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
  );
}
