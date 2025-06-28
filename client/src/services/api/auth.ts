import axios from "axios";

const API_URL = "https://sparklink.onrender.com/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: unknown;
}

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const res = await axios.post(`${API_URL}/auth/login`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export interface RegisterPayload {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const res = await axios.post(`${API_URL}/auth/register`, data, {
    withCredentials: true,
  });
  return res.data.data;
};

export async function verifyEmail(data: { email: string; otp: string }) {
  const res = await axios.post(`${API_URL}/auth/verify-email`, data, {
    withCredentials: true,
  });
  return res.data.data;
}

export async function resendVerification(data: { email: string }) {
  const res = await axios.post(`${API_URL}/auth/resend-verification`, data, {
    withCredentials: true,
  });
  return res.data;
}

// ...add other auth-related API functions as needed...
