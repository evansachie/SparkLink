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
    const response = await axios.get(`${API_URL}/resume`, {
      headers: getAuthHeaders(),
    });
    return response.data.data.resume;
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
  return response.data.data.resume;
};

export const updateResume = async (data: ResumeUpdatePayload): Promise<Resume> => {
  const response = await axios.put(`${API_URL}/resume`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data.resume;
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

export const getResumeAnalytics = async (): Promise<ResumeAnalytics> => {
  const response = await axios.get(`${API_URL}/resume/analytics`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
