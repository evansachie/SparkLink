import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: "STARTER" | "RISE" | "BLAZE";
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  features: string[];
  limits: {
    pages: number;
    storage: number; // in MB
    customDomain: boolean;
    analytics: boolean;
    passwordProtection: boolean;
    priority: boolean;
  };
}

export interface CurrentSubscription {
  id: string;
  tier: "STARTER" | "RISE" | "BLAZE";
  status: "active" | "canceled" | "expired" | "pending";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export interface InitializeSubscriptionPayload {
  planId: string;
  interval: "monthly" | "yearly";
}

export interface InitializeSubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
  paymentUrl: string;
  reference: string;
}

export interface VerifySubscriptionResponse {
  subscription: CurrentSubscription;
  status: "success" | "failed" | "pending";
  message: string;
}

export const getSubscriptionPlans = async (): Promise<{ plans: SubscriptionPlan[] }> => {
  const response = await axios.get(`${API_URL}/subscriptions/plans`);
  return response.data.data;
};

export const getCurrentSubscription = async (): Promise<CurrentSubscription | null> => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/current`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    // Return null if no subscription found
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const initializeSubscription = async (
  data: InitializeSubscriptionPayload
): Promise<InitializeSubscriptionResponse> => {
  const response = await axios.post(`${API_URL}/subscriptions/initialize`, data, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const verifySubscription = async (
  reference: string
): Promise<VerifySubscriptionResponse> => {
  const response = await axios.get(`${API_URL}/subscriptions/verify/${reference}`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const cancelSubscription = async (): Promise<{ message: string; effectiveDate: string }> => {
  const response = await axios.post(`${API_URL}/subscriptions/cancel`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const reactivateSubscription = async (): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/subscriptions/reactivate`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
