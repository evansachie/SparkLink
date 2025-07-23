import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MdAdd, 
  MdEdit, 
  MdAddPhotoAlternate, 
  MdShare 
} from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";

interface ActionItem {
  icon: React.ReactElement;
  title: string;
  desc: string;
  to: string;
  bgColor: string;
}

interface QuickActionsSectionProps {
  username?: string;
}

export default function QuickActionsSection({ username }: QuickActionsSectionProps) {
  const { user } = useAuth();
  
  // Use provided username or fall back to user context
  const userUsername = username || (user && "username" in user ? String(user.username) : "user");
  
  const quickActions: ActionItem[] = [
    {
      icon: <MdAdd size={24} className="text-white" />,
      title: "Create New Page",
      desc: "Start building your portfolio",
      to: "/dashboard/pages",
      bgColor: "bg-blue-500"
    },
    {
      icon: <MdEdit size={24} className="text-white" />,
      title: "Edit Profile",
      desc: "Update your information",
      to: "/dashboard/profile",
      bgColor: "bg-purple-500"
    },
    {
      icon: <MdAddPhotoAlternate size={24} className="text-white" />,
      title: "Upload Media",
      desc: "Add to your gallery",
      to: "/dashboard/gallery",
      bgColor: "bg-green-500"
    },
    {
      icon: <MdShare size={24} className="text-white" />,
      title: "Share Portfolio",
      desc: "Get your public link",
      to: `/public/${userUsername}`,
      bgColor: "bg-pink-500"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
          >
            <Link
              to={action.to}
              className="group block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`${action.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
