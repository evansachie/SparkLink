import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui";
import { MdAccessTime, MdLocationOn, MdDevices } from "react-icons/md";
import { motion } from "framer-motion";

interface RealTimeActivityProps {
  activities: Array<{
    id: string;
    event: string;
    timestamp: Date;
    country?: string;
    device?: string;
  }>;
}

export function RealTimeActivity({ activities }: RealTimeActivityProps) {
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