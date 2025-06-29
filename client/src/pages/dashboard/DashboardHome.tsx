import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
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
} from "react-icons/md";

const features = [
  {
    icon: <MdPerson size={32} className="text-blue-500" />,
    title: "Profile",
    desc: "Edit your personal info, avatar, and social links.",
    to: "/dashboard/profile",
    color: "from-blue-500 to-blue-600",
    stats: "Complete your profile"
  },
  {
    icon: <MdPages size={32} className="text-purple-500" />,
    title: "Pages",
    desc: "Create and organize your portfolio pages.",
    to: "/dashboard/pages",
    color: "from-purple-500 to-purple-600",
    stats: "Build your story"
  },
  {
    icon: <MdPhotoLibrary size={32} className="text-green-500" />,
    title: "Gallery",
    desc: "Showcase your work and uploads.",
    to: "/dashboard/gallery",
    color: "from-green-500 to-green-600",
    stats: "Show your work"
  },
  {
    icon: <MdBarChart size={32} className="text-orange-500" />,
    title: "Analytics",
    desc: "Track your portfolio's performance.",
    to: "/dashboard/analytics",
    color: "from-orange-500 to-orange-600",
    stats: "Monitor growth"
  },
];

const quickStats = [
  {
    label: "Profile Views",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: <MdVisibility className="text-blue-500" size={22} />
  },
  {
    label: "Pages Created",
    value: "8",
    change: "+2",
    trend: "up",
    icon: <MdDescription className="text-purple-500" size={22} />
  },
  {
    label: "Gallery Items",
    value: "24",
    change: "+5",
    trend: "up",
    icon: <MdAddPhotoAlternate className="text-green-500" size={22} />
  },
  {
    label: "Social Clicks",
    value: "156",
    change: "+8%",
    trend: "up",
    icon: <MdLink className="text-orange-500" size={22} />
  }
];

const recentActivity = [
  {
    action: "New page created",
    item: "About Me",
    time: "2 hours ago",
    icon: <MdDescription className="text-purple-500" size={20} />
  },
  {
    action: "Gallery updated",
    item: "3 new images added",
    time: "5 hours ago",
    icon: <MdAddPhotoAlternate className="text-green-500" size={20} />
  },
  {
    action: "Profile viewed",
    item: "From Google Search",
    time: "1 day ago",
    icon: <MdVisibility className="text-blue-500" size={20} />
  },
  {
    action: "Social link clicked",
    item: "LinkedIn profile",
    time: "2 days ago",
    icon: <MdLink className="text-orange-500" size={20} />
  }
];

export default function DashboardHome() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl shadow-xl border border-white/20 bg-gradient-to-br from-primary/80 to-accent/80 p-0 md:p-0"
        >
          <div className="absolute inset-0 pointer-events-none select-none opacity-10 bg-[url('/login.svg')] bg-cover bg-center" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 md:p-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-gray-200 bg-clip-text text-transparent mb-2 drop-shadow">
                {getGreeting()}{user?.firstName ? `, ${user.firstName}` : ""}! 
                <span className="text-black">👋 </span>
              </h1>
              <p className="text-white/90 text-lg font-medium drop-shadow">
                Welcome back to your SparkLink dashboard. Ready to shine today?
              </p>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="text-2xl font-semibold text-white drop-shadow">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-white/80">
                {currentTime.toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  {stat.icon}
                  {stat.label}
                </span>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trend === "up" ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />}
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-800">
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 w-1 h-8 rounded-full mr-3"></span>
                Manage Your Portfolio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      to={feature.to}
                      className="group block relative overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </span>
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {feature.desc}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">{feature.stats}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-green-500 to-blue-500 w-1 h-6 rounded-full mr-3"></span>
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {activity.item}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-700 font-medium mb-1">
                  Need help building your portfolio?
                </p>
                <a
                  href="mailto:support@sparklink.com"
                  className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                >
                  Contact our support team →
                </a>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-xs text-gray-400">
                SparkLink &copy; {new Date().getFullYear()}
              </div>
              <div className="flex gap-3">
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-500 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                  aria-label="Twitter"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.11 2.94 3.97 2.97A8.6 8.6 0 0 1 2 19.54c-.32 0-.63-.02-.94-.06A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-500 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                  aria-label="GitHub"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 2.92-.39c.99 0 1.99.13 2.92.39 2.22-1.49 3.2-1.18 3.2-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}