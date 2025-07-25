import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface SubscriptionPlan {
  tier: "STARTER" | "RISE" | "BLAZE";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    pages: number | null;
    socialLinks: number | null;
    customDomain: boolean;
    removeSparkLinkBranding: boolean;
    analytics: boolean;
    advancedPrivacy: boolean;
    scheduledPublishing: boolean;
    verifiedBadge: boolean;
    affiliate: boolean;
    prioritySupport: boolean;
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
  plan: string;  // STARTER, RISE, or BLAZE
  billingCycle: "monthly" | "yearly";
}

export interface InitializeSubscriptionResponse {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export interface VerifySubscriptionResponse {
  subscription: CurrentSubscription;
  status: "success" | "failed" | "pending";
  message: string;
}

export const getSubscriptionPlans = async (): Promise<{ plans: Record<string, SubscriptionPlan> }> => {
  const response = await axios.get(`${API_URL}/subscriptions/plans`);
  return response.data.data;
};

export const getCurrentSubscription = async (): Promise<CurrentSubscription | null> => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/current`, {
      headers: getAuthHeaders(),
    });
    
    const data = response.data.data;
    if (!data) return null;
    
    // Construct a proper CurrentSubscription from the data
    const currentSubscription: CurrentSubscription = {
      id: data.id || data.subscriptionData?.transactionRef || '',
      tier: data.currentPlan,
      status: data.subscriptionData?.status || 'pending',
      currentPeriodStart: data.subscriptionData?.startDate || new Date().toISOString(),
      currentPeriodEnd: data.expiresAt || '',
      cancelAtPeriodEnd: false,
      plan: data.planDetails || null
    };
    
    return currentSubscription;
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
