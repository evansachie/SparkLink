import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getPublicProfile, getPublicResume, PublicProfile } from "../../services/api/public";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";
import PublicLayout from "../../components/public/PublicLayout";

export default function PublicProfilePage() {
  const { username } = useParams() as { username: string };
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    if (!username) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const profileData = await getPublicProfile(username);
        
        if (!profileData.isPublic) {
          setError("This profile is private");
          return;
        }

        setProfile(profileData);
        
        // Check if resume exists
        try {
          await getPublicResume(username);
          setHasResume(true);
        } catch {
          setHasResume(false);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Profile not found"));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleDownloadResume = async () => {
    if (!username || !hasResume) return;

    try {
      const blob = await getPublicResume(username);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile?.firstName}_${profile?.lastName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download resume:', err);
    }
  };

  if (loading) {
    return <LoadingState text="Loading profile..." fullscreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="text-primary hover:text-primary/80 font-medium">
            ← Back to SparkLink
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <PublicLayout 
      profile={profile}
      onDownloadResume={hasResume ? handleDownloadResume : undefined}
      hasResume={hasResume}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to my profile!
          </h2>
          
          {profile.bio ? (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          ) : (
            <p className="text-gray-600">
              Hi there! I'm {profile.firstName} {profile.lastName}. 
              Welcome to my personal portfolio where you can learn more about me, 
              my work, and my interests.
            </p>
          )}

          {profile.website && (
            <div className="mt-6">
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
              >
                Visit my website →
              </a>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {profile.country ? 1 : 0}
            </div>
            <div className="text-sm text-gray-600">Location</div>
            {profile.country && (
              <div className="text-xs text-gray-500 mt-1">{profile.country}</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {profile.socialLinks.length}
            </div>
            <div className="text-sm text-gray-600">Social Links</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {profile.verificationBadges.length}
            </div>
            <div className="text-sm text-gray-600">Verifications</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {hasResume ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-600">Resume</div>
          </div>
        </div>
      </motion.div>
    </PublicLayout>
  );
}
