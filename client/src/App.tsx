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
// import TemplatesPage from "./pages/dashboard/TemplatesPage";
import ResumePage from "./pages/dashboard/ResumePage";
// import VerificationPage from "./pages/dashboard/VerificationPage";
import SubscriptionPage from "./pages/dashboard/SubscriptionPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

import NotFoundPage from "./pages/NotFoundPage";
import RedirectHome from "./components/common/RedirectHome";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";

import PublicProfilePage from "./pages/public/PublicProfilePage";
import PublicPageView from "./pages/public/PublicPageView";
import PublicGalleryView from "./pages/public/PublicGalleryView";

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

              {/* Public Portfolio Routes */}
              <Route path="/public/:username" element={<PublicProfilePage />} />
              <Route path="/public/:username/pages/:slug" element={<PublicPageView />} />
              <Route path="/public/:username/gallery" element={<PublicGalleryView />} />

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
                        {/* <Route path="templates" element={<TemplatesPage />} />  */}
                        <Route path="resume" element={<ResumePage />} />
                        {/* <Route path="verification" element={<VerificationPage />} /> */}
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
