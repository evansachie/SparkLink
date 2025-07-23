import { motion } from "framer-motion";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { MdCheck, MdError } from "react-icons/md";
import Input from "../common/Input";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  country?: string;
  phone?: string;
  bio?: string;
  tagline?: string;
}

interface BasicInfoSectionProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  usernameStatus: {
    checking: boolean;
    available: boolean | null;
    message: string;
  };
  user?: {
    email?: string;
  } | null;
}

export default function BasicInfoSection({
  register,
  errors,
  usernameStatus,
  user,
}: BasicInfoSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          placeholder="Enter your first name"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        
        <Input
          label="Last Name"
          placeholder="Enter your last name"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        
        <div className="md:col-span-2 mb-4">
          <Input
            label="Email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-gray-50"
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              Username
            </label>
            <div className="relative">
              <input
                {...register("username")}
                placeholder="Choose a unique username"
                className={`w-full px-4 py-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-black ${
                  errors.username ? "border-error" : "border-gray-300"
                }`}
              />
              {usernameStatus.checking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {!usernameStatus.checking && usernameStatus.available !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameStatus.available ? (
                    <MdCheck className="text-green-500" size={20} />
                  ) : (
                    <MdError className="text-red-500" size={20} />
                  )}
                </div>
              )}
            </div>
            {errors.username && (
              <span className="text-xs text-error">{errors.username.message}</span>
            )}
            {!errors.username && usernameStatus.message && (
              <span
                className={`text-xs ${
                  usernameStatus.available ? "text-green-600" : "text-red-500"
                }`}
              >
                {usernameStatus.message}
              </span>
            )}
          </div>
        </div>
        
        <Input
          label="Country"
          placeholder="Your country (optional)"
          error={errors.country?.message}
          {...register("country")}
        />
        
        <Input
          label="Phone Number"
          placeholder="Your phone number (optional)"
          error={errors.phone?.message}
          {...register("phone")}
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black mb-1">
            Bio
          </label>
          <textarea
            {...register("bio")}
            rows={3}
            placeholder="Tell people about yourself (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-black"
          ></textarea>
          {errors.bio && (
            <span className="text-xs text-error">{errors.bio.message}</span>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Input
            label="Tagline"
            placeholder="A short description of yourself (optional)"
            error={errors.tagline?.message}
            {...register("tagline")}
          />
        </div>
      </div>
    </motion.div>
  );
}
