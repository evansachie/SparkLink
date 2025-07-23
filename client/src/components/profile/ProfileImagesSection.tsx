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
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Profile Picture
          </label>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <MdPerson size={48} className="text-gray-400" />
                </div>
              )}
              {profileImageUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
              id="profile-picture-upload"
            />
            <label
              htmlFor="profile-picture-upload"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg cursor-pointer text-sm font-medium transition-colors"
            >
              {profileImageUploading ? "Uploading..." : "Change Picture"}
            </label>
          </div>
        </div>
        
        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Background Image
          </label>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-full h-24 rounded-lg overflow-hidden">
                {backgroundImage ? (
                  <img
                    src={backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No background image</span>
                  </div>
                )}
                {backgroundImageUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageChange}
              className="hidden"
              id="background-image-upload"
            />
            <label
              htmlFor="background-image-upload"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg cursor-pointer text-sm font-medium transition-colors"
            >
              {backgroundImageUploading ? "Uploading..." : "Change Background"}
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
