import axios from "axios";
import { API_URL } from "./auth";
import { Profile } from "../../types/api";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  order: number;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  country?: string;
  phone?: string;
  bio?: string;
  tagline?: string;
  countryFlag?: string;
}

export interface UpdateSocialLinksPayload {
  links: SocialLink[];
}

export interface UsernameCheckResponse {
  available: boolean;
  message: string;
}

export interface ImageUploadResponse {
  imageUrl: string;
  message: string;
}

export const getProfile = async (): Promise<Profile> => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const updateProfile = async (data: UpdateProfilePayload): Promise<Profile> => {
  const response = await axios.put(`${API_URL}/profile`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const checkUsernameAvailability = async (username: string): Promise<UsernameCheckResponse> => {
  const response = await axios.get(`${API_URL}/profile/check-username`, {
    params: { username },
  });
  return response.data.data;
};

export const updateSocialLinks = async (data: UpdateSocialLinksPayload): Promise<{ socialLinks: SocialLink[] }> => {
  const response = await axios.put(`${API_URL}/profile/social-links`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const uploadProfilePicture = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await axios.post(`${API_URL}/profile/upload/profile-picture`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const uploadBackgroundImage = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await axios.post(`${API_URL}/profile/upload/background-image`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};
