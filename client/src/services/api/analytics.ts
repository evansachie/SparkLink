import axios from "axios";
import { API_URL } from "./auth";
import { AnalyticsSummary, AnalyticsTrendsResponse } from "../../types/api";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

export interface GeoStat {
  country: string;
  countryCode: string;
  visits: number;
  percentage: number;
}

export interface DeviceStat {
  device: string;
  visits: number;
  percentage: number;
}

export interface GeoStatsResponse {
  geoStats: GeoStat[];
  totalVisits: number;
}

export interface DeviceStatsResponse {
  deviceStats: DeviceStat[];
  totalVisits: number;
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await axios.get(`${API_URL}/analytics/summary`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getAnalyticsTrends = async (
  days = "30"
): Promise<AnalyticsTrendsResponse> => {
  const response = await axios.get(
    `${API_URL}/analytics/trends?days=${days}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

export const getGeoStats = async (): Promise<GeoStatsResponse> => {
  const response = await axios.get(`${API_URL}/analytics/geo`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};

export const getDeviceStats = async (): Promise<DeviceStatsResponse> => {
  const response = await axios.get(`${API_URL}/analytics/devices`, {
    headers: getAuthHeaders(),
  });
  return response.data.data;
};
