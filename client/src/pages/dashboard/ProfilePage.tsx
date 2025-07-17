import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPerson,
  MdSave,
  MdClose,
  MdCloudUpload,
  MdDelete,
  MdAdd,
  MdLink,
  MdCheck,
  MdError,
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
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { getErrorMessage } from "../../utils/getErrorMessage";

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
  firstName: string;
  lastName: string;
  username: string;
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

const SOCIAL_PLATFORMS = [
  { value: "twitter", label: "Twitter", icon: "🐦" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "github", label: "GitHub", icon: "🐙" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "facebook", label: "Facebook", icon: "👥" },
  { value: "youtube", label: "YouTube", icon: "📺" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "website", label: "Website", icon: "🌐" },
];

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

  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [backgroundImageUploading, setBackgroundImageUploading] = useState(false);
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
        const data = await getProfile();
        setProfile(data);
        setSocialLinks(data.socialLinks || []);
        
        // Populate form
        reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
          country: data.country || "",
          phone: data.phone || "",
          bio: data.bio || "",
          tagline: data.tagline || "",
        });
      } catch (err) {
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
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
      
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
    const setUploading = type === "profile" ? setProfileImageUploading : setBackgroundImageUploading;
    
    try {
      setUploading(true);
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
    } finally {
      setUploading(false);
    }
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      platform: "website",
      url: "",
      order: socialLinks.length
    };
    setSocialLinks([...socialLinks, newLink]);
    setSocialLinksChanged(true);
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string | number) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
    setSocialLinksChanged(true);
  };

  const removeSocialLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
    setSocialLinksChanged(true);
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
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "profile");
                }}
                className="hidden"
                id="profile-upload"
                disabled={profileImageUploading}
              />
              <label
                htmlFor="profile-upload"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
              >
                <MdCloudUpload size={20} />
                {profileImageUploading ? "Uploading..." : "Upload Photo"}
              </label>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Background Image
            </label>
            <div className="space-y-4">
              <div className="relative h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition">
                {profile?.backgroundImage ? (
                  <img
                    src={profile.backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <MdCloudUpload size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No background image</p>
                    </div>
                  </div>
                )}
                {backgroundImageUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "background");
                }}
                className="hidden"
                id="background-upload"
                disabled={backgroundImageUploading}
              />
              <label
                htmlFor="background-upload"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition cursor-pointer disabled:opacity-50 w-full justify-center"
              >
                <MdCloudUpload size={20} />
                {backgroundImageUploading ? "Uploading..." : "Upload Background"}
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label="Last Name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <div className="space-y-2">
            <Input
              label="Username"
              error={errors.username?.message}
              {...register("username")}
            />
            {watchedUsername && watchedUsername !== profile?.username && (
              <div className="flex items-center gap-2 text-sm">
                {usernameStatus.checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600">Checking availability...</span>
                  </>
                ) : usernameStatus.available === true ? (
                  <>
                    <MdCheck className="text-green-600" size={16} />
                    <span className="text-green-600">{usernameStatus.message}</span>
                  </>
                ) : usernameStatus.available === false ? (
                  <>
                    <MdClose className="text-red-600" size={16} />
                    <span className="text-red-600">{usernameStatus.message}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <Input
            label="Email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-gray-50"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Phone (Optional)"
              type="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label="Country (Optional)"
              error={errors.country?.message}
              {...register("country")}
            />
          </div>

          <Input
            label="Tagline (Optional)"
            placeholder="A brief description of what you do"
            error={errors.tagline?.message}
            {...register("tagline")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              {...register("bio")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none bg-white"
              placeholder="Tell people about yourself, your work, and your interests..."
            />
            {errors.bio && (
              <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>
        </form>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Social Links</h2>
          <Button
            type="button"
            variant="outline"
            onClick={addSocialLink}
            className="flex items-center gap-2 px-4 py-2"
          >
            <MdAdd size={20} />
            Add Link
          </Button>
        </div>

        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <select
                value={link.platform}
                onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </option>
                ))}
              </select>
              
              <div className="flex-1">
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <MdDelete size={20} />
              </button>
            </motion.div>
          ))}

          {socialLinks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MdLink size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No social links added yet</p>
              <p className="text-sm">Add links to your social media profiles and websites</p>
            </div>
          )}
        </div>
      </motion.div>

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
