import axios from "axios";
import { API_URL } from "./auth";

export interface PublicProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  tagline?: string;
  profilePicture?: string;
  backgroundImage?: string;
  country?: string;
  website?: string;
  isPublic: boolean;
  verificationBadges: Array<{
    type: string;
    verifiedAt: string;
  }>;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
    order: number;
  }>;
  template?: {
    id: string;
    name: string;
    colorScheme: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicPage {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  isPasswordProtected: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicGalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  tags: string[];
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagePasswordPayload {
  password: string;
}

export interface PagePasswordResponse {
  success: boolean;
  message: string;
}

export const getPublicProfile = async (username: string): Promise<PublicProfile> => {
  const response = await axios.get(`${API_URL}/public/profile/${username}`);
  return response.data.data.profile;
};

export const getPublicPages = async (username: string): Promise<{ pages: PublicPage[] }> => {
  const response = await axios.get(`${API_URL}/public/${username}/pages`);
  return response.data.data;
};

export const getPublicPage = async (
  username: string, 
  slug: string
): Promise<PublicPage> => {
  const response = await axios.get(`${API_URL}/public/${username}/pages/${slug}`);
  return response.data.data.page;
};

export const verifyPagePassword = async (
  username: string,
  slug: string,
  data: PagePasswordPayload
): Promise<PagePasswordResponse> => {
  const response = await axios.post(
    `${API_URL}/public/${username}/pages/${slug}/password`,
    data
  );
  return response.data.data;
};

export const getPublicGallery = async (
  username: string,
  category?: string
): Promise<{ items: PublicGalleryItem[] }> => {
  const params = category ? { category } : {};
  const response = await axios.get(`${API_URL}/public/${username}/gallery`, {
    params
  });
  return response.data.data;
};

export const getPublicResume = async (username: string): Promise<Blob> => {
  const response = await axios.get(`${API_URL}/public/${username}/resume`, {
    responseType: "blob",
  });
  return response.data;
};
