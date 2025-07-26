import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Resume {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeUploadResponse {
  resume: Resume;
  message: string;
}

export interface ResumeUpdatePayload {
  isPublic?: boolean;
}

export interface ResumeAnalytics {
  totalDownloads: number;
  monthlyDownloads: number;
  recentDownloads: Array<{
    downloadDate: string;
    userAgent?: string;
    location?: string;
  }>;
}

export const getResume = async (): Promise<Resume | null> => {
  try {
    const response = await axios.get(`${API_URL}/resume/info`, {
      headers: getAuthHeaders(),
    });
    
    if (response.data.data) {
      if (response.data.data.resume) {
        return response.data.data.resume;
      }
      
      // Handle the format from the API response
      if (response.data.data.hasResume) {
        return {
          id: response.data.data.resumeId || 'unknown',
          fileName: response.data.data.resumeFileName || '',
          originalName: response.data.data.resumeFileName || '',
          fileUrl: response.data.data.resumeUrl || '',
          fileSize: 0, // Not available in the response
          isPublic: response.data.data.allowResumeDownload || false,
          downloadCount: 0, // Not available in the response
          createdAt: response.data.data.resumeUploadedAt || '',
          updatedAt: response.data.data.resumeUploadedAt || ''
        };
      }
    }
    
    return null;
  } catch (error) {
    // Return null if no resume found
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const uploadResume = async (file: File): Promise<Resume> => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await axios.post(`${API_URL}/resume/upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  
  // Handle the response format from the API
  const data = response.data.data;
  
  return {
    id: data.resumeId || 'unknown',
    fileName: data.resumeFileName || file.name,
    originalName: file.name,
    fileUrl: data.resumeUrl || '',
    fileSize: file.size,
    isPublic: data.allowResumeDownload !== undefined ? data.allowResumeDownload : true,
    downloadCount: 0,
    createdAt: data.resumeUploadedAt || new Date().toISOString(),
    updatedAt: data.resumeUploadedAt || new Date().toISOString()
  };
};

export const updateResume = async (data: ResumeUpdatePayload): Promise<Resume> => {
  // Use the settings endpoint for allowResumeDownload updates
  await axios.put(`${API_URL}/resume/settings`, {
    allowResumeDownload: data.isPublic
  }, {
    headers: getAuthHeaders(),
  });
  
  // After updating, fetch the latest resume data
  return getResume().then(resume => {
    if (!resume) {
      throw new Error("Failed to retrieve updated resume");
    }
    return resume;
  });
};

export const deleteResume = async (): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/resume`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const downloadResume = async (): Promise<Blob> => {
  const response = await axios.get(`${API_URL}/resume/download`, {
    headers: getAuthHeaders(),
    responseType: "blob",
  });
  return response.data;
};
