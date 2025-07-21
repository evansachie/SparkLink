import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  category: string;
  tier: "STARTER" | "RISE" | "BLAZE";
  features: Record<string, boolean | string>;
  isDefault?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  isDefault?: boolean;
}

export interface ApplyTemplatePayload {
  templateId: string;
  colorScheme?: string;
}

export interface UpdateColorsPayload {
  colorScheme: string;
}

export const getTemplates = async (): Promise<{ templates: Template[]; colorSchemes: ColorScheme[] }> => {
  const response = await axios.get(`${API_URL}/templates`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getTemplate = async (id: string): Promise<Template> => {
  const response = await axios.get(`${API_URL}/templates/${id}`);
  return response.data.data.template;
};

export const applyTemplate = async (data: ApplyTemplatePayload): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/templates/apply`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updateColorScheme = async (data: UpdateColorsPayload): Promise<{ message: string }> => {
  const response = await axios.put(`${API_URL}/templates/colors`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
