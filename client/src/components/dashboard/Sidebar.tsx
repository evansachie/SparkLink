import { Link, useLocation } from "react-router-dom";
import Logo from "../common/Logo";
import {
  MdPerson,
  MdPages,
  MdPhotoLibrary,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdClose,
  MdSpaceDashboard,
} from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const sidebarLinks = [
  { to: "/dashboard", label: "Overview", icon: <MdSpaceDashboard size={22} /> },
  { to: "/dashboard/profile", label: "Profile", icon: <MdPerson size={22} /> },
  { to: "/dashboard/pages", label: "Pages", icon: <MdPages size={22} /> },
  { to: "/dashboard/gallery", label: "Gallery", icon: <MdPhotoLibrary size={22} /> },
  { to: "/dashboard/analytics", label: "Analytics", icon: <MdBarChart size={22} /> },
  { to: "/dashboard/settings", label: "Settings", icon: <MdSettings size={22} /> },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

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

  // Sidebar content for reuse
  const sidebarContent = (
    <>
      <div className="mb-8 flex items-center justify-center">
        <Logo size={36} />
      </div>
      <div className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Main
      </div>
      <nav className="flex-1 space-y-1">
        {sidebarLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${
              isActive(link.to)
                ? "bg-primary/10 text-primary"
                : "text-gray-700 hover:bg-primary/5"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <div className="border-t border-gray-100 my-4" />
        <button
          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-error hover:bg-error/10 font-medium transition"
          onClick={logout}
        >
          <MdLogout size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-48 bg-white border-r border-gray-100 py-8 px-2 min-h-[92vh] sticky top-0 z-30 h-screen shadow-sm">
        {sidebarContent}
      </aside>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden">
        {!open && (
          <button
            className="fixed top-4 left-4 z-50 bg-white rounded-full shadow p-2 border border-gray-200"
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
            type="button"
          >
            <GiHamburgerMenu className='text-black' size={28} />
          </button>
        )}
      </div>
      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <aside
          className={`absolute top-0 left-0 h-screen w-2/3 max-w-xs bg-white border-r border-gray-100 py-8 px-2 flex flex-col shadow-lg transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ minWidth: "140px" }}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            type="button"
          >
            <MdClose size={28} />
          </button>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
