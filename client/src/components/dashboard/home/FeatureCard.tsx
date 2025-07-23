import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  to: string;
  color: string;
  stats: string;
  progress: number;
  index: number;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  to, 
  color, 
  stats, 
  progress, 
  index 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
    >
      <Link
        to={to}
        className="group block p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color}`} />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{stats}</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
