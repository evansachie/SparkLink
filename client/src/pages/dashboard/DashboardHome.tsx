import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MdPerson,
  MdPages,
  MdPhotoLibrary,
  MdBarChart,
  MdArrowUpward,
  MdArrowDownward,
  MdVisibility,
  MdLink,
  MdAddPhotoAlternate,
  MdDescription,
  MdLaunch,
  MdAdd,
  MdEdit,
  MdShare,
} from "react-icons/md";

const quickActions = [
  {
    icon: <MdAdd size={24} className="text-white" />,
    title: "Create New Page",
    desc: "Start building your portfolio",
    to: "/dashboard/pages",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500"
  },
  {
    icon: <MdEdit size={24} className="text-white" />,
    title: "Edit Profile",
    desc: "Update your information",
    to: "/dashboard/profile",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500"
  },
  {
    icon: <MdAddPhotoAlternate size={24} className="text-white" />,
    title: "Upload Media",
    desc: "Add to your gallery",
    to: "/dashboard/gallery",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500"
  },
  {
    icon: <MdShare size={24} className="text-white" />,
    title: "Share Portfolio",
    desc: "Get your public link",
    to: "#",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500"
  },
];

const features = [
  {
    icon: <MdPerson size={32} className="text-blue-500" />,
    title: "Profile Management",
    desc: "Customize your personal brand and information.",
    to: "/dashboard/profile",
    color: "from-blue-500 to-blue-600",
    stats: "85% Complete",
    progress: 85
  },
  {
    icon: <MdPages size={32} className="text-purple-500" />,
    title: "Portfolio Pages",
    desc: "Create stunning pages to showcase your work.",
    to: "/dashboard/pages",
    color: "from-purple-500 to-purple-600",
    stats: "3 Pages",
    progress: 60
  },
  {
    icon: <MdPhotoLibrary size={32} className="text-green-500" />,
    title: "Media Gallery",
    desc: "Organize and display your best work.",
    to: "/dashboard/gallery",
    color: "from-green-500 to-green-600",
    stats: "12 Items",
    progress: 40
  },
  {
    icon: <MdBarChart size={32} className="text-orange-500" />,
    title: "Analytics Hub",
    desc: "Track your portfolio's performance and reach.",
    to: "/dashboard/analytics",
    color: "from-orange-500 to-orange-600",
    stats: "View Reports",
    progress: 0
  },
];

const quickStats = [
  {
    label: "Profile Views",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: <MdVisibility className="text-blue-500" size={24} />,
    color: "blue"
  },
  {
    label: "Page Views",
    value: "5,234",
    change: "+23%",
    trend: "up",
    icon: <MdDescription className="text-purple-500" size={24} />,
    color: "purple"
  },
  {
    label: "Gallery Views",
    value: "1,456",
    change: "+8%",
    trend: "up",
    icon: <MdAddPhotoAlternate className="text-green-500" size={24} />,
    color: "green"
  },
  {
    label: "Social Clicks",
    value: "892",
    change: "+15%",
    trend: "up",
    icon: <MdLink className="text-orange-500" size={24} />,
    color: "orange"
  }
];

const recentActivity = [
  {
    action: "New page created",
    item: "About Me",
    time: "2 hours ago",
    icon: <MdDescription className="text-purple-500" size={20} />,
    type: "create"
  },
  {
    action: "Gallery updated",
    item: "3 new images added",
    time: "5 hours ago",
    icon: <MdAddPhotoAlternate className="text-green-500" size={20} />,
    type: "update"
  },
  {
    action: "Profile viewed",
    item: "From Google Search",
    time: "1 day ago",
    icon: <MdVisibility className="text-blue-500" size={20} />,
    type: "view"
  },
  {
    action: "Social link clicked",
    item: "LinkedIn profile",
    time: "2 days ago",
    icon: <MdLink className="text-orange-500" size={20} />,
    type: "click"
  }
];

export default function DashboardHome() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Handle OAuth callback if coming from redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const isGoogle = urlParams.get('google');

    if (token && isGoogle && !user) {
      try {
        // Decode the token to get user data
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        if (payload.userId && payload.email) {
          // Create a user object from the token payload
          const userData = {
            id: payload.userId,
            email: payload.email
          };
          
          // Log the user in with the token
          login(userData, token);
          
          console.log('OAuth login successful from dashboard');
          
          // Clean up URL parameters
          window.history.replaceState({}, document.title, "/dashboard");
        }
      } catch (error) {
        console.error('Failed to process OAuth token from dashboard:', error);
      }
    }
  }, [location.search, login, user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = (user && typeof user === "object" && "firstName" in user && typeof user.firstName === "string") 
    ? user.firstName 
    : (user && typeof user === "object" && "email" in user && typeof user.email === "string")
    ? user.email.split("@")[0] 
    : "there";

  const username = (user && typeof user === "object" && "username" in user && typeof user.username === "string")
    ? user.username
    : "user";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white"
      >
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/400')] bg-cover bg-center opacity-10" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {getGreeting()}, {displayName}! 👋
              </h1>
              <p className="text-white/90 text-lg mb-6 max-w-2xl">
                Welcome to your SparkLink dashboard. Manage your portfolio, track performance, and grow your online presence.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/dashboard/pages"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <MdAdd size={20} />
                  Create Page
                </Link>
                <Link
                  to={`/public/${username}`}
                  className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <MdLaunch size={20} />
                  View Portfolio
                </Link>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-2xl font-bold">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-white/80 text-sm">
                {currentTime.toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {stat.trend === "up" ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
                  {stat.change}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Portfolio Management */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full mr-3" />
              Portfolio Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    to={feature.to}
                    className="group block p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${feature.color}`} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {feature.desc}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{feature.stats}</span>
                        <span className="text-gray-500">{feature.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500`}
                          style={{ width: `${feature.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Activity & Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
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
            <button className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium py-2">
              View All Activity
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
