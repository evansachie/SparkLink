import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  MdNotificationsNone,
  MdSearch,
  MdKeyboardArrowDown,
  MdLogout,
  MdHelp,
} from "react-icons/md";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "../../hooks/useSubscription";

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { subscription } = useSubscription();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path.includes("/profile")) return "Profile Settings";
    if (path.includes("/pages")) return "Page Management";
    if (path.includes("/gallery")) return "Gallery";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  const displayName = (user && typeof user === "object" && "firstName" in user && typeof user.firstName === "string") 
    ? user.firstName 
    : (user && typeof user === "object" && "email" in user && typeof user.email === "string")
    ? user.email.split("@")[0] 
    : "User";

  const avatarSrc = (user && typeof user === "object" && "profilePicture" in user && typeof user.profilePicture === "string")
    ? user.profilePicture
    : undefined;

  const userEmail = (user && typeof user === "object" && "email" in user && typeof user.email === "string")
    ? user.email
    : "user@example.com";

  // Get subscription tier from the API or fallback to user object or default to STARTER
  const userSubscription = subscription?.tier || 
    (user && typeof user === "object" && "subscription" in user && typeof user.subscription === "string"
      ? user.subscription
      : "STARTER");

  const notifications = [
    { id: 1, text: "Your profile was viewed 15 times today", time: "2h ago", unread: true },
    { id: 2, text: "New comment on your portfolio", time: "4h ago", unread: true },
    { id: 3, text: "Weekly analytics report is ready", time: "1d ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <motion.div 
          className="flex items-center gap-6 lg:ml-0 ml-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <motion.h1 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {getPageTitle()}
            </motion.h1>
            <motion.p 
              className="text-sm text-gray-500 mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {location.pathname === "/dashboard" 
                ? `Welcome back, ${displayName}!` 
                : "Manage your portfolio and settings"
              }
            </motion.p>
          </div>
        </motion.div>

        {/* Center Section - Search */}
        <motion.div 
          className="hidden md:flex flex-1 max-w-md mx-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative w-full group">
            <motion.div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <MdSearch size={20} />
            </motion.div>
            <input
              type="text"
              placeholder="Search pages, gallery, settings..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm"
            />
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdNotificationsNone size={24} />
              {unreadCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">{unreadCount} unread</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                          notification.unread ? "border-primary bg-primary/5" : "border-transparent"
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <motion.button 
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View all notifications
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {avatarSrc ? (
                <div className="relative">
                  <motion.img
                    src={avatarSrc}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-primary/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  />
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                </div>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary text-white shadow-sm border-2 border-white"
                >
                  <span className="font-semibold">{displayName.charAt(0).toUpperCase()}</span>
                </motion.div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">
                  {userSubscription} Plan
                </p>
              </div>
              <motion.div
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  showUserMenu ? "rotate-180" : ""
                }`}
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <MdKeyboardArrowDown />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-500">{userEmail}</p>
                  </div>
                  
                  <div className="py-2">
                    <motion.button 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ x: 2 }}
                    >
                      <MdHelp size={18} />
                      Help & Support
                    </motion.button>
                  </div>

                  <div className="border-t border-gray-100 py-2">
                    <motion.button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ x: 2 }}
                    >
                      <MdLogout size={18} />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Click outside handlers */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
}
