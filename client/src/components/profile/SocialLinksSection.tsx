import { useState } from "react";
import { motion } from "framer-motion";
import { MdAdd, MdDelete, MdLink } from "react-icons/md";
import Button from "../common/Button";

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  order: number;
}

interface SocialPlatform {
  value: string;
  label: string;
  icon: string;
}

interface SocialLinksSectionProps {
  socialLinks: SocialLink[];
  platforms: SocialPlatform[];
  onChange: (links: SocialLink[]) => void;
}

export default function SocialLinksSection({
  socialLinks,
  platforms,
  onChange,
}: SocialLinksSectionProps) {
  const [, setSocialLinksChanged] = useState(false);

  const addSocialLink = () => {
    const newLink: SocialLink = {
      platform: "website",
      url: "",
      order: socialLinks.length,
    };
    const updatedLinks = [...socialLinks, newLink];
    onChange(updatedLinks);
    setSocialLinksChanged(true);
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string | number
  ) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
    setSocialLinksChanged(true);
  };

  const removeSocialLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    onChange(updated);
    setSocialLinksChanged(true);
  };

  return (
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
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {platforms.map((platform) => (
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          </div>
        )}
      </div>
    </motion.div>
  );
}
