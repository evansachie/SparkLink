import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdSave, 
  MdClose, 
  MdCheck, 
  MdError, 
  MdPerson
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { 
  getProfile, 
  updateProfile, 
  uploadProfilePicture, 
  uploadBackgroundImage,
  updateSocialLinks,
  checkUsernameAvailability
} from "../../services/api/profile";
import BasicInfoSection from "../../components/profile/BasicInfoSection";
import ProfileImagesSection from "../../components/profile/ProfileImagesSection";
import SocialLinksSection from "../../components/profile/SocialLinksSection";
import Button from "../../components/common/Button";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { SOCIAL_PLATFORMS } from "../../constants/profileTypes";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  country: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  tagline: z.string().max(100, "Tagline must be less than 100 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  order: number;
}

interface ProfileData {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  country?: string;
  phone?: string;
  bio?: string;
  tagline?: string;
  profilePicture?: string;
  backgroundImage?: string;
  socialLinks: SocialLink[];
  isPublished: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLinksChanged, setSocialLinksChanged] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchedUsername = watch("username");

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const apiResponse = await getProfile();
        
        if (!apiResponse) {
          throw new Error("No profile data returned from server");
        }

        const userData = apiResponse.user || {};
        const profileInfo = apiResponse.profile || {};
        
        // Combine the data from both objects
        const profileData: ProfileData = {
          id: userData.id || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          username: userData.username || "",
          email: userData.email || "",
          country: userData.country || "",
          phone: userData.phone || "",
          profilePicture: userData.profilePicture || "",
          bio: profileInfo.bio || "",
          tagline: profileInfo.tagline || "",
          backgroundImage: profileInfo.backgroundImage || "",
          socialLinks: (profileInfo.socialLinks || []).map((link, index: number) => ({
            ...link,
            order: index,
            platform: link.platform || "",
            url: link.url || ""
          })),
          isPublished: profileInfo.isPublished || false
        };
        
        setProfile(profileData);
        setSocialLinks(profileData.socialLinks || []);
        
        reset({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          username: userData.username || "",
          country: userData.country || "",
          phone: userData.phone || "",
          bio: profileInfo.bio || "",
          tagline: profileInfo.tagline || "",
        });
        
      } catch (err) {
        console.error("Profile load error:", err);
        setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!watchedUsername || watchedUsername === profile?.username) {
        setUsernameStatus({ checking: false, available: null, message: "" });
        return;
      }

      if (watchedUsername.length < 3) {
        setUsernameStatus({ 
          checking: false, 
          available: false, 
          message: "Username must be at least 3 characters" 
        });
        return;
      }

      setUsernameStatus({ checking: true, available: null, message: "Checking..." });

      try {
        const result = await checkUsernameAvailability(watchedUsername);
        setUsernameStatus({
          checking: false,
          available: result.available,
          message: result.available ? "Username is available" : "Username is already taken"
        });
      } catch (err) {
        console.error('Username check failed:', err);
        setUsernameStatus({ 
          checking: false, 
          available: false, 
          message: "Error checking username" 
        });
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [watchedUsername, profile?.username]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      setError(null);
      
      await updateProfile(data);
      
      // Update social links if changed
      if (socialLinksChanged) {
        await updateSocialLinks({ links: socialLinks });
        setSocialLinksChanged(false);
      }

      setSuccess("Profile updated successfully!");
      
      // Reload profile data
      const updatedApiResponse = await getProfile();
      
      // Extract the user and profile data
      const updatedUserData = updatedApiResponse.user || {};
      const updatedProfileInfo = updatedApiResponse.profile || {};
      
      // Combine into our ProfileData structure
      const updatedProfileData: ProfileData = {
        id: updatedUserData.id || "",
        firstName: updatedUserData.firstName || "",
        lastName: updatedUserData.lastName || "",
        username: updatedUserData.username || "",
        email: updatedUserData.email || "",
        country: updatedUserData.country || "",
        phone: updatedUserData.phone || "",
        profilePicture: updatedUserData.profilePicture || "",
        bio: updatedProfileInfo.bio || "",
        tagline: updatedProfileInfo.tagline || "",
        backgroundImage: updatedProfileInfo.backgroundImage || "",
        socialLinks: (updatedProfileInfo.socialLinks || []).map((link, index: number) => ({
          ...link,
          order: index,
          platform: link.platform || "",
          url: link.url || ""
        })),
        isPublished: updatedProfileInfo.isPublished || false
      };
      setProfile(updatedProfileData);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    file: File, 
    type: "profile" | "background"
  ) => {
    try {
      setError(null);

      const uploadFn = type === "profile" ? uploadProfilePicture : uploadBackgroundImage;
      const result = await uploadFn(file);
      
      // Update profile state
      setProfile(prev => prev ? {
        ...prev,
        [type === "profile" ? "profilePicture" : "backgroundImage"]: result.imageUrl
      } : null);

      setSuccess(`${type === "profile" ? "Profile" : "Background"} image updated successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to upload ${type} image`));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <MdPerson size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your personal information and public profile</p>
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              error ? "bg-red-50 text-red-700 border border-red-200" : 
              "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {error ? <MdError size={20} /> : <MdCheck size={20} />}
            <span>{error || success}</span>
            <button
              onClick={() => { setError(null); setSuccess(null); }}
              className="ml-auto p-1 hover:bg-white/50 rounded"
            >
              <MdClose size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Images */}
      <ProfileImagesSection
        profilePicture={profile?.profilePicture}
        backgroundImage={profile?.backgroundImage}
        onProfileImageUpload={(file) => handleImageUpload(file, "profile")}
        onBackgroundImageUpload={(file) => handleImageUpload(file, "background")}
      />

      {/* Basic Information */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <BasicInfoSection 
          register={register}
          errors={errors}
          usernameStatus={usernameStatus}
          user={user}
        />
      </form>

      {/* Social Links */}
      <SocialLinksSection 
        socialLinks={socialLinks}
        platforms={SOCIAL_PLATFORMS}
        onChange={(links) => {
          setSocialLinks(links);
          setSocialLinksChanged(true);
        }}
      />

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end gap-4"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setSocialLinks(profile?.socialLinks || []);
            setSocialLinksChanged(false);
          }}
          disabled={saving}
        >
          Reset Changes
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          loading={saving}
          disabled={!isDirty && !socialLinksChanged}
          className="flex items-center gap-2"
        >
          <MdSave size={20} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
}
