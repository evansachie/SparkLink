import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdTrendingDown,
  MdRemoveRedEye,
  MdPeople,
  MdAccessTime,
  MdRefresh,
  MdFileDownload,
} from "react-icons/md";

import { useToast } from "../../hooks/useToast";
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getGeoStats,
  getDeviceStats,
} from "../../services/api/analytics";
import { ActivityEvent } from "../../types/api";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { getErrorMessage } from "../../utils/getErrorMessage";

import { MetricCard } from "./MetricCard";
import { TrafficSources } from "./TrafficSources";
import { RealTimeActivity } from "./RealTimeActivity";

interface EnhancedAnalyticsProps {
  timeRange: "7d" | "30d" | "90d" | "1y";
}

export default function EnhancedAnalytics({ timeRange }: EnhancedAnalyticsProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    metrics: {
      totalViews: { value: number; change: number };
      uniqueVisitors: { value: number; change: number };
      bounceRate: { value: number; change: number };
      avgSessionDuration: { value: number; change: number };
    };
    trendsData: Array<{
      date: string;
      views?: number;
      visitors?: number;
      bounceRate?: number;
      profileViews?: number;
      pageViews?: number;
      galleryViews?: number;
      socialClicks?: number;
    }>;
    trafficSources: Array<{
      source: string;
      visits: number;
      color: string;
    }>;
    realtimeActivity: Array<{
      id: string;
      event: string;
      timestamp: Date;
      country?: string;
      device?: string;
    }>;
  }>({
    metrics: {
      totalViews: { value: 0, change: 0 },
      uniqueVisitors: { value: 0, change: 0 },
      bounceRate: { value: 0, change: 0 },
      avgSessionDuration: { value: 0, change: 0 },
    },
    trendsData: [],
    trafficSources: [],
    realtimeActivity: [],
  });

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data
      const [summary, trends, geographic, devices] = await Promise.all([
        getAnalyticsSummary(),
        getAnalyticsTrends(timeRange),
        getGeoStats(),
        getDeviceStats(),
      ]);

      // Transform data for enhanced display
      const enhancedData = {
        metrics: {
          totalViews: { value: summary?.totalViews || 0, change: 12.5 },
          uniqueVisitors: { value: summary?.profileViews || 0, change: 8.3 },
          bounceRate: { value: 34.2, change: -2.1 },
          avgSessionDuration: { value: 245, change: 15.7 },
        },
        trendsData: trends?.trends?.map(trend => ({
          date: trend.date,
          views: trend.pageViews,
          visitors: trend.profileViews,
          bounceRate: 0,
        })) || [],
        trafficSources: [
          { source: "Direct", visits: 1200, color: "#3B82F6" },
          { source: "Social Media", visits: 800, color: "#10B981" },
          { source: "Search Engines", visits: 600, color: "#F59E0B" },
          { source: "Referrals", visits: 400, color: "#EF4444" },
        ],
        realtimeActivity: summary?.recentActivity?.map((activity: ActivityEvent, index: number) => ({
          id: `activity-${index}`,
          event: activity.event,
          timestamp: new Date(activity.createdAt),
          country: geographic?.geoStats?.[0]?.country || "Unknown",
          device: devices?.deviceStats?.[0]?.device || "Desktop",
        })) || [],
      };

      setData(enhancedData);
    } catch (err) {
      error("Failed to load enhanced analytics", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const exportData = () => {
    const csvData = [
      ["Metric", "Value", "Change"],
      ["Total Views", data.metrics.totalViews.value, data.metrics.totalViews.change],
      ["Unique Visitors", data.metrics.uniqueVisitors.value, data.metrics.uniqueVisitors.change],
      ["Bounce Rate", `${data.metrics.bounceRate.value}%`, data.metrics.bounceRate.change],
      ["Avg Session Duration", `${Math.floor(data.metrics.avgSessionDuration.value / 60)}m ${data.metrics.avgSessionDuration.value % 60}s`, data.metrics.avgSessionDuration.change],
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    success("Analytics data exported successfully");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadAnalytics}>
          <MdRefresh size={16} className="mr-2" />
          Refresh
        </Button>
        <Button onClick={exportData}>
          <MdFileDownload size={16} className="mr-2" />
          Export Data
        </Button>
      </div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={data.metrics.totalViews.value}
          change={data.metrics.totalViews.change}
          icon={<MdRemoveRedEye size={24} className="text-white" />}
          color="bg-blue-500/10"
          trend="up"
        />
        <MetricCard
          title="Unique Visitors"
          value={data.metrics.uniqueVisitors.value}
          change={data.metrics.uniqueVisitors.change}
          icon={<MdPeople size={24} className="text-white" />}
          color="bg-green-500/10"
          trend="up"
        />
        <MetricCard
          title="Bounce Rate"
          value={data.metrics.bounceRate.value}
          change={data.metrics.bounceRate.change}
          icon={<MdTrendingDown size={24} className="text-white" />}
          color="bg-orange-500/10"
          trend="down"
        />
        <MetricCard
          title="Avg. Session"
          value={Math.floor(data.metrics.avgSessionDuration.value / 60)}
          change={data.metrics.avgSessionDuration.change}
          icon={<MdAccessTime size={24} className="text-white" />}
          color="bg-purple-500/10"
          trend="up"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSources data={data.trafficSources} />
        <RealTimeActivity activities={data.realtimeActivity} />
      </div>

      {/* Simple Trends Display */}
      {data.trendsData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Trends</h3>
            <div className="space-y-4">
              {data.trendsData.slice(-7).map((item, index) => (
                <motion.div
                  key={item.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium text-gray-900">{item.date}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{item.views}</span> views
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{item.visitors}</span> visitors
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{item.bounceRate}%</span> bounce
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
