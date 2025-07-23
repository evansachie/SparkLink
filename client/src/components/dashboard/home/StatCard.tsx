import { motion } from "framer-motion";
import { ReactElement } from "react";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: ReactElement;
  color: string;
  index: number;
}

export function StatCard({ label, value, change, trend, icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
          trend === 'up' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {trend === "up" ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
          {change}
        </span>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </motion.div>
  );
}
