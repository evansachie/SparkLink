import { Card, CardContent } from "../ui";
import { motion } from "framer-motion";

interface TrafficSourcesProps {
  data: Array<{
    source: string;
    visits: number;
    color: string;
  }>;
}

export function TrafficSources({ data }: TrafficSourcesProps) {
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
