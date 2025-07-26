import { Link, useLocation } from "react-router-dom";
import Logo from "../common/Logo";
import {
  MdDashboard,
  MdPerson,
  MdPages,
  MdPhotoLibrary,
  MdBarChart,
  MdCreditCard,
  MdSettings,
  MdLogout,
  MdClose,
  MdVerified,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "../../hooks/useSubscription";

const sidebarLinks = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: <MdDashboard size={22} />,
    description: "Dashboard home",
  },
  {
    to: "/dashboard/profile",
    label: "Profile",
    icon: <MdPerson size={22} />,
    description: "Personal information",
  },
  {
    to: "/dashboard/pages",
    label: "Pages",
    icon: <MdPages size={22} />,
    description: "Create & manage pages",
  },
  {
    to: "/dashboard/gallery",
    label: "Gallery",
    icon: <MdPhotoLibrary size={22} />,
    description: "Photos & media",
  },
  {
    to: "/dashboard/analytics",
    label: "Analytics",
    icon: <MdBarChart size={22} />,
    description: "Performance insights",
  },
  {
    to: "/dashboard/subscription",
    label: "Subscription",
    icon: <MdCreditCard size={22} />,
    description: "Plans & billing",
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: <MdSettings size={22} />,
    description: "Account preferences",
  },
  {
    to: "/dashboard/templates",
    label: "Templates",
    icon: <MdPages size={22} />,
    description: "Design templates",
  },
  {
    to: "/dashboard/resume",
    label: "Resume",
    icon: <MdPerson size={22} />,
    description: "Create & manage resume",
  },
  {
    to: "/dashboard/verification",
    label: "Verification",
    icon: <MdVerified size={22} />,
    description: "Verify your identity",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Helper to check if a link is active
  const isActive = (to: string) => {
    // Exact match for /dashboard, startsWith for subroutes
    if (to === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(to);
  };

  const displayName =
    user && typeof user === "object" && "firstName" in user && typeof user.firstName === "string"
      ? user.firstName
      : user && typeof user === "object" && "email" in user && typeof user.email === "string"
      ? user.email.split("@")[0]
      : "User";

  const avatarSrc =
    user && typeof user === "object" && "profilePicture" in user && typeof user.profilePicture === "string"
      ? user.profilePicture
      : undefined;

  // Get subscription tier from the API or fallback to user object or default to STARTER
  const userSubscription = subscription?.tier || 
    (user && typeof user === "object" && "subscription" in user && typeof user.subscription === "string"
      ? user.subscription
      : "STARTER");

  const hasVerifiedBadge =
    user && typeof user === "object" && "hasVerifiedBadge" in user
      ? Boolean(user.hasVerifiedBadge)
      : false;

  // Sidebar content for reuse
  const sidebarContent = (
    <div className={`h-full flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'} overflow-hidden`}>
      {/* Header */}
      <motion.div
        className="p-6 border-b border-gray-100 flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Toggle Button */}
        <div className="w-full flex justify-between items-center mb-6">
          <motion.div
            className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'w-full' : ''}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Logo size={collapsed ? 32 : 40} />
          </motion.div>
          
          {!collapsed && (
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Collapse sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              </svg>
            </motion.button>
          )}
          
          {collapsed && (
            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Expand sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              </svg>
            </motion.button>
          )}
        </div>

        {/* User Info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors w-full"
              whileHover={{ scale: 1.02 }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-gray-900 font-medium text-sm truncate">
                    {displayName}
                  </p>
                  {hasVerifiedBadge && (
                    <MdVerified className="text-primary w-4 h-4 flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-500 text-xs">
                  {userSubscription} Plan
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Collapsed User Avatar */}
        <AnimatePresence>
          {collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
              style={{ minWidth: "40px", minHeight: "40px" }}
              whileHover={{ scale: 1.1 }}
              title={`${displayName} (${userSubscription} Plan)`}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
                  style={{ minWidth: "32px", minHeight: "32px", aspectRatio: "1/1" }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center" style={{ minWidth: "32px", minHeight: "32px" }}>
                  <span className="text-white font-semibold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation */}
      <nav className={`flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden sidebar-scrollbar ${collapsed ? 'px-2' : ''}`}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2"
            >
              Navigation
            </motion.div>
          )}
        </AnimatePresence>
        
        {sidebarLinks.map((link, index) => {
          const active = isActive(link.to);
          return (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                to={link.to}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 relative overflow-hidden ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? `${link.label} - ${link.description}` : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="activeBackground"
                    className={`absolute inset-0 bg-gradient-to-r opacity-5 rounded-xl`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  className={`relative z-10 ${active ? `text-primary` : ""}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {link.icon}
                </motion.div>
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div 
                      className="flex-1 relative z-10"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="font-medium">{link.label}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-500">
                        {link.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {active && !collapsed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <MdKeyboardArrowRight className="w-5 h-5 text-primary/60" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <motion.div
        className={`p-4 border-t border-gray-100 ${collapsed ? 'px-2' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200 group ${
            collapsed ? 'justify-center' : ''
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          title={collapsed ? "Sign Out" : undefined}
        >
          <motion.div
            className="group-hover:scale-110 transition-transform"
            whileHover={{ rotate: 10 }}
          >
            <MdLogout size={20} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block h-screen sticky top-0 z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden">
        {!open && (
          <motion.button
            className="fixed top-3 left-3 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-gray-200"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <GiHamburgerMenu className="text-gray-800" size={18} />
          </motion.button>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full w-80 max-w-[85vw] shadow-2xl"
            >
              <div className="h-full flex flex-col bg-white border-r border-gray-100 w-72 relative">
              <motion.button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 p-2 rounded-lg hover:bg-gray-100 bg-white/80 backdrop-blur-sm shadow-sm"
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdClose size={20} />
              </motion.button>
                {/* Mobile sidebar uses full content without collapse functionality */}
                <motion.div
                  className="p-6 border-b border-gray-100"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Logo size={40} />
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-gray-900 font-medium text-sm truncate">
                          {displayName}
                        </p>
                        {hasVerifiedBadge && (
                          <MdVerified className="text-primary w-4 h-4 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">
                        {userSubscription} Plan
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
                  <motion.div
                    className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Navigation
                  </motion.div>
                  {sidebarLinks.map((link, index) => {
                    const active = isActive(link.to);
                    return (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Link
                          to={link.to}
                          className={`group flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 relative overflow-hidden ${
                            active
                              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {active && (
                            <motion.div
                              layoutId="activeBackgroundMobile"
                              className={`absolute inset-0 bg-gradient-to-r opacity-5 rounded-xl`}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <motion.div
                            className={`relative z-10 ${active ? `text-primary` : ""}`}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            {link.icon}
                          </motion.div>
                          <div className="flex-1 relative z-10">
                            <div className="font-medium">{link.label}</div>
                            <div className="text-xs text-gray-400 group-hover:text-gray-500">
                              {link.description}
                            </div>
                          </div>
                          {active && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              <MdKeyboardArrowRight className="w-5 h-5 text-primary/60" />
                            </motion.div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <motion.div
                  className="p-4 border-t border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <motion.div
                      className="group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: 10 }}
                    >
                      <MdLogout size={20} />
                    </motion.div>
                    <span>Sign Out</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
