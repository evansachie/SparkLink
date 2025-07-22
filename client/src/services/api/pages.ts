import axios from "axios";
import { API_URL } from "./auth";
import { Page, PagesResponse } from "../../types/api";
import { getAuthHeaders } from "../../utils/getAuthHeaders";
import { PageType } from "../../types/api";

export interface CreatePagePayload {
  type: PageType;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  isPasswordProtected?: boolean;
  password?: string;
}

export interface UpdatePagePayload {
  title?: string;
  slug?: string;
  content?: Record<string, unknown>;
  isPublished?: boolean;
  isPasswordProtected?: boolean;
  password?: string;
}

export interface ReorderPagesPayload {
  pageOrders: Array<{ id: string; order: number }>;

}

export const getPages = async (): Promise<PagesResponse> => {
  const response = await axios.get(`${API_URL}/pages`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getPageById = async (pageId: string): Promise<{ page: Page }> => {
  const response = await axios.get(`${API_URL}/pages/${pageId}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const createPage = async (data: CreatePagePayload): Promise<{ page: Page }> => {
  const response = await axios.post(`${API_URL}/pages`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updatePage = async (
  pageId: string,
  data: UpdatePagePayload
): Promise<{ page: Page }> => {
  const response = await axios.put(`${API_URL}/pages/${pageId}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const deletePage = async (pageId: string): Promise<void> => {
  await axios.delete(`${API_URL}/pages/${pageId}`, {
    headers: getAuthHeaders(),
  });
};

export const reorderPages = async (data: ReorderPagesPayload): Promise<{ pages: Page[] }> => {
  const response = await axios.post(`${API_URL}/pages/reorder`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const verifyPagePassword = async (
  pageId: string,
  password: string
): Promise<{ valid: boolean; pageId: string }> => {
  const response = await axios.post(`${API_URL}/pages/verify-password`, {
    pageId,
    password,
  });
  return response.data.data;
};
