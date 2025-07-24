import { useState } from "react";
import { motion } from "framer-motion";
import { MdPerson } from "react-icons/md";

interface ProfileImagesSectionProps {
  profilePicture?: string | null;
  backgroundImage?: string | null;
  onProfileImageUpload: (file: File) => Promise<void>;
  onBackgroundImageUpload: (file: File) => Promise<void>;
}

export default function ProfileImagesSection({
  profilePicture,
  backgroundImage,
  onProfileImageUpload,
  onBackgroundImageUpload,
}: ProfileImagesSectionProps) {
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [backgroundImageUploading, setBackgroundImageUploading] = useState(false);

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProfileImageUploading(true);
      await onProfileImageUpload(file);
    } finally {
      setProfileImageUploading(false);
    }
  };

  const handleBackgroundImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setBackgroundImageUploading(true);
      await onBackgroundImageUpload(file);
    } finally {
      setBackgroundImageUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Images</h2>
      
      <div className="space-y-8">
        {/* Visual Preview */}
        <div className="rounded-xl overflow-hidden shadow-md">
          <div className="relative">
            {/* Background Image */}
            <div className="w-full h-40 bg-gradient-to-r from-gray-200 to-gray-100 relative">
              {backgroundImage ? (
                <img
                  src={backgroundImage}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              ) : null}
              
              {backgroundImageUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* Background upload button */}
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageChange}
                className="hidden"
                id="background-image-upload"
              />
              <label
                htmlFor="background-image-upload"
                className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg cursor-pointer text-xs font-medium transition-colors flex items-center gap-1 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                {backgroundImageUploading ? "Uploading..." : "Change Cover"}
              </label>
            </div>
            
            {/* Profile Picture */}
            <div className="absolute -bottom-12 left-8">
              <div className="relative flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full ${profilePicture ? '' : 'bg-primary'} border-4 border-white shadow-md`}>
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <MdPerson size={38} className="text-white" />
                    </div>
                  )}
                </div>
                
                {profileImageUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute -right-2 -bottom-2 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full cursor-pointer flex items-center justify-center text-white shadow-sm border border-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </label>
              </div>
            </div>
          </div>
          
          {/* Profile Information Placeholder */}
          <div className="pt-16 pb-6 px-8">
            <div className="h-6 w-32 bg-gray-100 rounded-full mb-2"></div>
            <div className="h-4 w-48 bg-gray-100 rounded-full"></div>
          </div>
        </div>
        
        {/* Upload Instructions */}
        <div className="grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <div className="font-medium text-gray-900 mb-1">Profile Picture</div>
            <div className="text-sm text-gray-600">Upload a professional photo to make your profile more personable. Recommended size: 400x400px.</div>
          </div>
          
          <div>
            <div className="font-medium text-gray-900 mb-1">Cover Image</div>
            <div className="text-sm text-gray-600">Add a cover image that showcases your work or personality. Recommended size: 1500x500px.</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
