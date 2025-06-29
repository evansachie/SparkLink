import { ReactNode } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import { MdMenu, MdNotificationsNone, MdAccountCircle } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  let displayName = "User";
  if (user && typeof user === "object") {
    if ("firstName" in user && typeof user.firstName === "string" && user.firstName) {
      displayName = user.firstName;
    } else if ("email" in user && typeof user.email === "string" && user.email) {
      displayName = user.email.split("@")[0];
    }
  }

  const avatarSrc =
    user && typeof user === "object" && "profilePicture" in user && typeof user.profilePicture === "string" && user.profilePicture
      ? user.profilePicture
      : null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile/tablet (hidden on md+) */}
            <button
              className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Open sidebar"
              style={{ display: "none" }}
            >
              <MdMenu size={28} />
            </button>
            <span className="font-bold text-xl text-primary tracking-tight">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-primary transition focus:outline-none">
              <MdNotificationsNone size={26} />
              {/* Example notification badge */}
              {/* <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span> */}
            </button>
            <span className="text-gray-700 font-medium hidden sm:inline">
              Hi, {displayName}
            </span>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User"
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow"
              />
            ) : (
              <MdAccountCircle className="w-10 h-10 text-gray-400" />
            )}
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          {children}
        </main>
      </div>
    </div>
  );
}
