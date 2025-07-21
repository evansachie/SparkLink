import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export enum VerificationType {
  IDENTITY = "IDENTITY",
  BUSINESS = "BUSINESS",
  SOCIAL = "SOCIAL",
  CELEBRITY = "CELEBRITY",
  ORGANIZATION = "ORGANIZATION"
}

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface VerificationRequest {
  id: string;
  type: VerificationType;
  status: VerificationStatus;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    documentType: string;
  }>;
  notes?: string;
  adminNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVerificationPayload {
  type: VerificationType;
  notes?: string;
}

export interface VerificationStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  isVerified: boolean;
  verificationBadges: Array<{
    type: VerificationType;
    approvedAt: string;
  }>;
}

export const getVerificationRequests = async (): Promise<{ requests: VerificationRequest[] }> => {
  const response = await axios.get(`${API_URL}/verification/requests`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getVerificationStats = async (): Promise<VerificationStats> => {
  const response = await axios.get(`${API_URL}/verification/stats`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const createVerificationRequest = async (
  data: CreateVerificationPayload
): Promise<VerificationRequest> => {
  const response = await axios.post(`${API_URL}/verification/request`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data.request;
};

export const uploadVerificationDocument = async (
  requestId: string,
  file: File,
  documentType: string
): Promise<{ document: { id: string; fileName: string; fileUrl: string; documentType: string } }> => {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("documentType", documentType);

  const response = await axios.post(
    `${API_URL}/verification/requests/${requestId}/documents`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

export const deleteVerificationDocument = async (
  requestId: string,
  documentId: string
): Promise<{ message: string }> => {
  const response = await axios.delete(
    `${API_URL}/verification/requests/${requestId}/documents/${documentId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

export const cancelVerificationRequest = async (
  requestId: string
): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/verification/requests/${requestId}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
