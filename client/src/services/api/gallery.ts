import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  publicId: string;
  category?: string;
  tags: string[];
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryItemPayload {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  isVisible?: boolean;
}

export interface UpdateGalleryItemPayload {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isVisible?: boolean;
}

export interface ReorderGalleryPayload {
  itemOrders: Array<{ id: string; order: number }>;
}

export interface GalleryUploadResponse {
  imageUrl: string;
  publicId: string;
  message: string;
}

export const getGalleryItems = async (): Promise<{ items: GalleryItem[] }> => {
  const response = await axios.get(`${API_URL}/gallery`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getGalleryItem = async (id: string): Promise<GalleryItem> => {
  const response = await axios.get(`${API_URL}/gallery/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const uploadGalleryItem = async (
  file: File, 
  metadata: CreateGalleryItemPayload
): Promise<GalleryItem> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", metadata.title);
  
  if (metadata.description) formData.append("description", metadata.description);
  if (metadata.category) formData.append("category", metadata.category);
  if (metadata.tags) formData.append("tags", JSON.stringify(metadata.tags));
  if (metadata.isVisible !== undefined) formData.append("isVisible", String(metadata.isVisible));

  const response = await axios.post(`${API_URL}/gallery/upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const updateGalleryItem = async (
  id: string, 
  data: UpdateGalleryItemPayload
): Promise<GalleryItem> => {
  const response = await axios.put(`${API_URL}/gallery/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const deleteGalleryItem = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_URL}/gallery/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const reorderGalleryItems = async (data: ReorderGalleryPayload): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/gallery/reorder`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
