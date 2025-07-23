import { MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: "up" | "down" | "neutral";
}

export function MetricCard({ title, value, change, icon, color, trend }: MetricCardProps) {
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
