import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MdAdd, MdLaunch } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import { Profile } from "../../../types/api";

interface WelcomeSectionProps {
  profile: Profile | null;
}

export default function WelcomeSection({ profile }: WelcomeSectionProps) {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Use profile data if available, otherwise fallback to user context
  const firstName = profile?.firstName || 
                    (user && "firstName" in user ? 
                     String(user.firstName) : 
                     (user && "email" in user ? 
                      String(user.email).split("@")[0] : "there"));

  const username = profile?.username || 
                  (user && "username" in user ? 
                   String(user.username) : "user");

  return (
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
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-white/90 text-lg mb-6 max-w-2xl">
              Welcome to your SparkLink dashboard. Manage your portfolio, track performance, and grow your online presence.
            </p>
            <div className="flex flex-wrap gap-4">
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
  );
}
