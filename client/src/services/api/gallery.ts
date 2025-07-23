import axios from "axios";
import { API_URL } from "./auth";
import { GalleryItem, GalleryResponse } from "../../types/api";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

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

export const getGalleryItems = async (params?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<GalleryResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.category) queryParams.append("category", params.category);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  const response = await axios.get(`${API_URL}/gallery${queryString}`, {
    headers: getAuthHeaders()
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
