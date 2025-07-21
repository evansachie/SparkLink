import axios from "axios";
import { API_URL } from "./auth";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AnalyticsSummary {
  totalViews: number;
  profileViews: number;
  pageViews: number;
  linkClicks: number;
  topPages: Array<{
    title: string;
    slug: string;
    views: number;
  }>;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  recentActivity: Array<{
    event: string;
    data: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface AnalyticsTrends {
  period: string;
  data: Array<{
    date: string;
    views: number;
    visitors: number;
    bounceRate: number;
  }>;
}

export interface GeographicData {
  countries: Array<{
    country: string;
    countryCode: string;
    visits: number;
    percentage: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    visits: number;
    percentage: number;
  }>;
}

export interface DeviceData {
  devices: Array<{
    type: string;
    visits: number;
    percentage: number;
  }>;
  browsers: Array<{
    browser: string;
    visits: number;
    percentage: number;
  }>;
  operatingSystems: Array<{
    os: string;
    visits: number;
    percentage: number;
  }>;
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await axios.get(`${API_URL}/analytics/summary`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getAnalyticsTrends = async (
  period: "7d" | "30d" | "90d" | "1y" = "30d"
): Promise<AnalyticsTrends> => {
  const response = await axios.get(`${API_URL}/analytics/trends`, {
    headers: getAuthHeaders(),
    params: { period },
  });
  return response.data.data;
};

export const getGeographicAnalytics = async (): Promise<GeographicData> => {
  const response = await axios.get(`${API_URL}/analytics/geo`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getDeviceAnalytics = async (): Promise<DeviceData> => {
  const response = await axios.get(`${API_URL}/analytics/devices`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
