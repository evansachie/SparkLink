import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdRemoveRedEye,
  MdPeople,
  MdDevices,
  MdLocationOn,
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

interface EnhancedAnalyticsProps {
  timeRange: "7d" | "30d" | "90d" | "1y";
}

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: "up" | "down" | "neutral";
}

function MetricCard({ title, value, change, icon, color, trend }: MetricCardProps) {
  const formatChange = (change: number) => {
    const abs = Math.abs(change);
    const sign = change >= 0 ? "+" : "-";
    return `${sign}${abs.toFixed(1)}%`;
  };

  const trendIcon = trend === "up" ? <MdTrendingUp /> : trend === "down" ? <MdTrendingDown /> : null;
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative"
    >
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {value.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                {trendIcon}
                <span>{formatChange(change)}</span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
            <div className={`p-4 rounded-full ${color} group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
          </div>
          
          {/* Animated background */}
          <motion.div
            className={`absolute inset-0 ${color.replace('bg-', 'bg-gradient-to-br from-').replace('/10', '/5')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface TrafficSourcesProps {
  data: Array<{
    source: string;
    visits: number;
    color: string;
  }>;
}

function TrafficSources({ data }: TrafficSourcesProps) {
  const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Custom Donut Chart */}
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="10"
              />
              {data.map((item, index) => {
                const percentage = (item.visits / totalVisits) * 100;
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const previousPercentages = data.slice(0, index).reduce((sum, prev) => sum + (prev.visits / totalVisits) * 100, 0);
                const strokeDashoffset = -((previousPercentages / 100) * circumference);
                
                return (
                  <motion.circle
                    key={item.source}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="drop-shadow-sm"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalVisits.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Visits</div>
              </div>
            </div>
          </div>
          
          {/* Source List */}
          <div className="space-y-3">
            {data.map((source, index) => {
              const percentage = ((source.visits / totalVisits) * 100).toFixed(1);
              return (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{source.visits.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{percentage}%</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RealTimeActivityProps {
  activities: Array<{
    id: string;
    event: string;
    timestamp: Date;
    country?: string;
    device?: string;
  }>;
}

function RealTimeActivity({ activities }: RealTimeActivityProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: Date) => {
    const now = currentTime.getTime();
    const diff = now - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Activity</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MdAccessTime size={48} className="mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                    <span>{getTimeAgo(activity.timestamp)}</span>
                    {activity.country && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MdLocationOn size={12} />
                          {activity.country}
                        </span>
                      </>
                    )}
                    {activity.device && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MdDevices size={12} />
                          {activity.device}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
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
