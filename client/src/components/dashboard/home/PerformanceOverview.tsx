import { motion } from "framer-motion";
import { 
  MdVisibility, 
  MdDescription, 
  MdAddPhotoAlternate, 
  MdLink 
} from "react-icons/md";
import { AnalyticsSummary, AnalyticsTrendsResponse } from "../../../types/api";
import { StatCard } from "./StatCard";

interface AnalyticsData {
  summary: AnalyticsSummary | null;
  trends: AnalyticsTrendsResponse | null;
}

export default function PerformanceOverview({ analytics }: { analytics: AnalyticsData }) {
  // Extract data from analytics or use defaults
  const summary = analytics?.summary || {
    profileViews: 0,
    totalViews: 0,
    galleryViews: 0,
    socialClicks: 0,
    previousProfileViews: 0,
    previousTotalViews: 0,
    previousGalleryViews: 0,
    previousSocialClicks: 0
  };
  
  // Get percentage change from previous period or default to 0
  const getPercentageChange = (current: number, previous: number): string => {
    if (!previous) return "0%";
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Format analytics data for stat cards
  const statsData = [
    {
      label: "Profile Views",
      value: summary.profileViews || 0,
      previousValue: summary.previousProfileViews || 0,
      icon: <MdVisibility className="text-blue-500" size={24} />,
      color: "blue"
    },
    {
      label: "Page Views",
      value: summary.totalViews || 0,
      previousValue: summary.previousTotalViews || 0,
      icon: <MdDescription className="text-purple-500" size={24} />,
      color: "purple"
    },
    {
      label: "Gallery Views",
      value: summary.galleryViews || 0,
      previousValue: summary.previousGalleryViews || 0,
      icon: <MdAddPhotoAlternate className="text-green-500" size={24} />,
      color: "green"
    },
    {
      label: "Social Clicks",
      value: summary.socialClicks || 0,
      previousValue: summary.previousSocialClicks || 0,
      icon: <MdLink className="text-orange-500" size={24} />,
      color: "orange"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const change = getPercentageChange(stat.value, stat.previousValue);
          const trend = stat.value >= stat.previousValue ? "up" : "down";
          
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value.toLocaleString()}
              change={change}
              trend={trend}
              icon={stat.icon}
              color={stat.color}
              index={index}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
