import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdBarChart,
  MdTrendingUp,
  MdPeople,
  MdVisibility,
  MdLanguage,
  MdDevices,
  MdRefresh,
} from "react-icons/md";

import { useToast } from "../../hooks/useToast";
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getGeographicAnalytics,
  getDeviceAnalytics,
  AnalyticsSummary,
  GeographicData,
  DeviceData,
} from "../../services/api/analytics";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState, LoadingSkeleton } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, trend, icon, color }: StatCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
              {change && (
                <p className={`text-sm mt-1 flex items-center ${trendColors[trend || 'neutral']}`}>
                  <MdTrendingUp 
                    size={16} 
                    className={`mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} 
                  />
                  {change}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

function ChartCard({ title, children, loading = false, className = "" }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {loading ? (
          <div className="space-y-3">
            <LoadingSkeleton height="200px" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { error } = useToast();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [geographic, setGeographic] = useState<GeographicData | null>(null);
  const [devices, setDevices] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const loadAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const [summaryData, , geoData, deviceData] = await Promise.all([
        getAnalyticsSummary(),
        getAnalyticsTrends(period),
        getGeographicAnalytics(),
        getDeviceAnalytics(),
      ]);

      setSummary(summaryData);
      setGeographic(geoData);
      setDevices(deviceData);
    } catch (err) {
      error("Failed to load analytics", getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  if (loading) {
    return <LoadingState text="Loading analytics..." fullscreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MdBarChart size={28} className="text-primary" />
            Analytics
          </h1>
          <p className="text-gray-600">Track your portfolio performance and visitor insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <MdRefresh size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Views"
            value={summary.totalViews}
            change="+12%"
            trend="up"
            icon={<MdVisibility size={24} className="text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Profile Views"
            value={summary.profileViews}
            change="+8%"
            trend="up"
            icon={<MdPeople size={24} className="text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Page Views"
            value={summary.pageViews}
            change="+15%"
            trend="up"
            icon={<MdBarChart size={24} className="text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Link Clicks"
            value={summary.linkClicks}
            change="+23%"
            trend="up"
            icon={<MdLanguage size={24} className="text-white" />}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <ChartCard title="Top Pages" loading={!summary}>
          {summary && (
            <div className="space-y-3">
              {summary.topPages.length > 0 ? (
                summary.topPages.map((page, index) => (
                  <div key={page.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-white text-xs rounded-full">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{page.title}</p>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {page.views.toLocaleString()} views
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No page views yet</p>
              )}
            </div>
          )}
        </ChartCard>

        {/* Top Referrers */}
        <ChartCard title="Top Referrers" loading={!summary}>
          {summary && (
            <div className="space-y-3">
              {summary.topReferrers.length > 0 ? (
                summary.topReferrers.map((referrer, index) => (
                  <div key={referrer.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs rounded-full">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{referrer.source}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {referrer.visits.toLocaleString()} visits
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No referrer data yet</p>
              )}
            </div>
          )}
        </ChartCard>

        {/* Geographic Distribution */}
        <ChartCard title="Top Countries" loading={!geographic}>
          {geographic && (
            <div className="space-y-3">
              {geographic.countries.length > 0 ? (
                geographic.countries.slice(0, 5).map((country) => (
                  <div key={country.countryCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.countryCode}</span>
                      <span className="font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {country.visits.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        ({country.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No geographic data yet</p>
              )}
            </div>
          )}
        </ChartCard>

        {/* Device Types */}
        <ChartCard title="Device Types" loading={!devices}>
          {devices && (
            <div className="space-y-3">
              {devices.devices.length > 0 ? (
                devices.devices.map((device) => (
                  <div key={device.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MdDevices size={20} className="text-gray-600" />
                      <span className="font-medium text-gray-900 capitalize">{device.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {device.visits.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        ({device.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No device data yet</p>
              )}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <ChartCard title="Recent Activity" loading={!summary} className="col-span-full">
        {summary && (
          <div className="space-y-3">
            {summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.createdAt).toLocaleDateString()} at{" "}
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">No recent activity</p>
            )}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
