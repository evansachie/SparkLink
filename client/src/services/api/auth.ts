import axios from "axios";
export const API_URL = "https://sparklink.onrender.com/api";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  country?: string;
  profilePicture?: string;
  subscription?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const res = await axios.post(`${API_URL}/auth/login`, data, {
    withCredentials: true,
  });
  const { token, user } = res.data.data;
  // Persist token and user in localStorage for session persistence
  localStorage.setItem("token", String(token));
  localStorage.setItem("user", JSON.stringify(user));
  return {
    token: String(token),
    user: user as User,
  };
};

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token?: string;
  user?: User;
  [key: string]: unknown;
}

export const registerUser = async (data: RegisterPayload): Promise<RegisterResponse> => {
  const res = await axios.post(`${API_URL}/auth/register`, data, {
    withCredentials: true,
  });
  // If registration returns token/user, persist them
  if (res.data.data?.token && res.data.data?.user) {
    localStorage.setItem("token", String(res.data.data.token));
    localStorage.setItem("user", JSON.stringify(res.data.data.user));
  }
  return res.data.data as RegisterResponse;
};

export async function verifyEmail(data: { email: string; otp: string }) {
  const res = await axios.post(`${API_URL}/auth/verify-email`, data, {
    withCredentials: true,
  });
  return res.data.data as { token: string; user: User };
}

export async function resendVerification(data: { email: string }) {
  const res = await axios.post(`${API_URL}/auth/resend-verification`, data, {
    withCredentials: true,
  });
  return res.data;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const deleteAccount = async (): Promise<void> => {
  await axios.delete(`${API_URL}/auth/account`, {
    headers: getAuthHeaders(),
  });
  // Clear local storage after successful deletion
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
