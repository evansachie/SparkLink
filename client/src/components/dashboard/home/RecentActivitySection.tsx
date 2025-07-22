import { motion } from "framer-motion";
import { 
  MdDescription, 
  MdAddPhotoAlternate, 
  MdVisibility, 
  MdLink 
} from "react-icons/md";
import { AnalyticsSummary, ActivityEvent } from "../../../types/api";

interface RecentActivity {
  action: string;
  item: string;
  time: string;
  icon: JSX.Element;
  type: string;
}

interface RecentActivitySectionProps {
  analytics: AnalyticsSummary | null;
}

export default function RecentActivitySection({ analytics }: RecentActivitySectionProps) {
  // Create activities from analytics data or use fallbacks
  const generateActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Add recent activities from analytics if available
    if (analytics?.recentActivity && analytics.recentActivity.length > 0) {
      analytics.recentActivity.forEach((activity: ActivityEvent) => {
        let icon = <MdVisibility className="text-blue-500" size={20} />;
        let type = "view";
        
        // Determine icon based on activity type
        if (activity.event.includes("page") || activity.event.includes("Page")) {
          icon = <MdDescription className="text-purple-500" size={20} />;
          type = "page";
        } else if (activity.event.includes("gallery") || activity.event.includes("image")) {
          icon = <MdAddPhotoAlternate className="text-green-500" size={20} />;
          type = "gallery";
        } else if (activity.event.includes("social") || activity.event.includes("link")) {
          icon = <MdLink className="text-orange-500" size={20} />;
          type = "social";
        }
        
        activities.push({
          action: activity.event,
          item: activity.details || "",
          time: new Date(activity.createdAt).toLocaleString(),
          icon,
          type
        });
      });
    } 
    
    // Add fallback activities if needed
    if (activities.length === 0) {
      activities.push(
        {
          action: "No recent activity",
          item: "Your activities will show here",
          time: new Date().toLocaleString(),
          icon: <MdVisibility className="text-blue-500" size={20} />,
          type: "view"
        }
      );
    }
    
    return activities.slice(0, 5); // Limit to 5 activities
  };
  
  const recentActivities = generateActivities();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3" />
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        {recentActivities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {activity.item}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button 
        className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium py-2"
        onClick={() => window.location.href = "/dashboard/analytics"}
      >
        View All Activity
      </button>
    </div>
  );
}
