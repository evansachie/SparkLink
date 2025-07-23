import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { getAnalyticsSummary, getAnalyticsTrends } from "../../services/api/analytics";
import { getProfile } from "../../services/api/profile";
import { getPages } from "../../services/api/pages";
import { getGalleryItems } from "../../services/api/gallery";
import { useToast } from "../../hooks/useToast";
import { getErrorMessage } from "../../utils/getErrorMessage";
import WelcomeSection from "../../components/dashboard/home/WelcomeSection";
import QuickActionsSection from "../../components/dashboard/home/QuickActionsSection";
import PerformanceOverview from "../../components/dashboard/home/PerformanceOverview";
import PortfolioManagement from "../../components/dashboard/home/PortfolioManagement";
import RecentActivitySection from "../../components/dashboard/home/RecentActivitySection";
import { LoadingState } from "../../components/ui/loading";
import { 
  Profile, 
  AnalyticsSummary, 
  AnalyticsTrendsResponse,
  Page, 
  GalleryItem 
} from "../../types/api";

export interface DashboardData {
  profile: Profile | null;
  analytics: {
    summary: AnalyticsSummary | null;
    trends: AnalyticsTrendsResponse | null;
  };
  pages: Page[];
  gallery: {
    items: GalleryItem[];
    totalCount: number;
  };
}

export default function DashboardHome() {
  useAuth();
  const location = useLocation();
  const { error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    profile: null,
    analytics: {
      summary: null,
      trends: null
    },
    pages: [],
    gallery: {
      items: [],
      totalCount: 0
    }
  });

  // Handle OAuth callback if coming from redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const isGoogle = urlParams.get('google');

    if (token && isGoogle) {
      // Clean up URL parameters
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, [location.search]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [profileResult, analyticsResult, trendsResult, pagesResult, galleryResult] = 
          await Promise.allSettled([
            getProfile(),
            getAnalyticsSummary(),
            getAnalyticsTrends('30'),
            getPages(),
            getGalleryItems()
          ]);
        
        // Process results handling potential rejections
        setDashboardData({
          profile: profileResult.status === 'fulfilled' ? 
            ('user' in profileResult.value ? profileResult.value.user : profileResult.value as Profile) : null,
          analytics: {
            summary: analyticsResult.status === 'fulfilled' ? analyticsResult.value : null,
            trends: trendsResult.status === 'fulfilled' ? trendsResult.value : null
          },
          pages: pagesResult.status === 'fulfilled' ? pagesResult.value.pages : [],
          gallery: {
            items: galleryResult.status === 'fulfilled' ? galleryResult.value.items : [],
            totalCount: galleryResult.status === 'fulfilled' ? galleryResult.value.totalCount : 0
          }
        });
      } catch (err) {
        showError("Failed to load dashboard data", getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  if (loading) {
    return <LoadingState text="Loading dashboard..." fullscreen />;
  }

  return (
    <div className="space-y-8">
      <WelcomeSection profile={dashboardData.profile} />
      <QuickActionsSection username={dashboardData.profile?.username} />
      <PerformanceOverview analytics={dashboardData.analytics} />
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <PortfolioManagement 
            pages={dashboardData.pages}
            galleryItems={dashboardData.gallery.items}
            profile={dashboardData.profile}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <RecentActivitySection 
            analytics={dashboardData.analytics.summary}
          />
        </motion.div>
      </div>
    </div>
  );
}
