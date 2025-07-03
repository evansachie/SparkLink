import { Link, useLocation } from "react-router-dom";
import Logo from "../common/Logo";
import {
  MdDashboard,
  MdPerson,
  MdPages,
  MdPhotoLibrary,
  MdBarChart,
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

const sidebarLinks = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: <MdDashboard size={22} />,
    description: "Dashboard home",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    to: "/dashboard/profile",
    label: "Profile",
    icon: <MdPerson size={22} />,
    description: "Personal information",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    to: "/dashboard/pages",
    label: "Pages",
    icon: <MdPages size={22} />,
    description: "Create & manage pages",
    gradient: "from-green-500 to-green-600",
  },
  {
    to: "/dashboard/gallery",
    label: "Gallery",
    icon: <MdPhotoLibrary size={22} />,
    description: "Photos & media",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    to: "/dashboard/analytics",
    label: "Analytics",
    icon: <MdBarChart size={22} />,
    description: "Performance insights",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: <MdSettings size={22} />,
    description: "Account preferences",
    gradient: "from-gray-500 to-gray-600",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

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

  const userSubscription =
    user && typeof user === "object" && "subscription" in user && typeof user.subscription === "string"
      ? user.subscription
      : "STARTER";

  const hasVerifiedBadge =
    user && typeof user === "object" && "hasVerifiedBadge" in user
      ? Boolean(user.hasVerifiedBadge)
      : false;

  // Sidebar content for reuse
  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-gray-100">
      {/* Header */}
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

        {/* User Info */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
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
                    layoutId="activeBackground"
                    className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-5 rounded-xl`}
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

      {/* Footer */}
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
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden">
        {!open && (
          <motion.button
            className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-200"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <GiHamburgerMenu className="text-gray-800" size={24} />
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
              <motion.button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MdClose size={24} />
              </motion.button>
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
