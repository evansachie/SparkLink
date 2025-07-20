import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toast";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import OAuthCallback from "./components/auth/OAuthCallback";

import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import PagesPage from "./pages/dashboard/PagesPage";
import GalleryPage from "./pages/dashboard/GalleryPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import SubscriptionPage from "./pages/dashboard/SubscriptionPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

import NotFoundPage from "./pages/NotFoundPage";
import RedirectHome from "./components/common/RedirectHome";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RedirectHome />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />

              {/* Legal Routes */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="pages" element={<PagesPage />} />
                        <Route path="gallery" element={<GalleryPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="subscription" element={<SubscriptionPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
