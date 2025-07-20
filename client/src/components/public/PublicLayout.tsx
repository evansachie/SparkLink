import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MdDownload } from "react-icons/md";
import { PublicProfile } from "../../services/api/public";
import { Button } from "../ui/button";
import PublicNavigation from "./PublicNavigation";
import SocialLinks from "./SocialLinks";
import VerificationBadges from "./VerificationBadges";

interface PublicLayoutProps {
  profile: PublicProfile;
  children: ReactNode;
  onDownloadResume?: () => void;
  hasResume?: boolean;
}

export default function PublicLayout({ 
  profile, 
  children, 
  onDownloadResume,
  hasResume = false 
}: PublicLayoutProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        {profile.backgroundImage && (
          <div className="absolute inset-0 h-64 md:h-80">
            <img
              src={profile.backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          </div>
        )}

        {/* Profile Content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center md:items-end gap-6"
            >
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <span className="text-3xl md:text-4xl font-bold text-primary">
                        {profile.firstName?.[0] || profile.username[0]}
                      </span>
                    </div>
                  )}
                </div>
                <VerificationBadges badges={profile.verificationBadges} />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                  profile.backgroundImage ? 'text-white' : 'text-gray-900'
                }`}>
                  {fullName}
                </h1>
                
                {profile.tagline && (
                  <p className={`text-lg md:text-xl mb-3 ${
                    profile.backgroundImage ? 'text-gray-200' : 'text-gray-600'
                  }`}>
                    {profile.tagline}
                  </p>
                )}

                {profile.bio && (
                  <p className={`max-w-2xl mb-4 ${
                    profile.backgroundImage ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <SocialLinks 
                    links={profile.socialLinks} 
                    theme={profile.backgroundImage ? 'dark' : 'light'}
                  />
                  
                  {hasResume && onDownloadResume && (
                    <Button
                      onClick={onDownloadResume}
                      variant={profile.backgroundImage ? "secondary" : "default"}
                      className="flex items-center gap-2"
                    >
                      <MdDownload size={18} />
                      Download Resume
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <PublicNavigation username={profile.username} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Powered by{" "}
            <a href="/" className="text-primary hover:text-primary/80 font-medium">
              SparkLink
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
