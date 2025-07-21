import { motion } from "framer-motion";
import { 
  MdLink,
  MdLanguage
} from "react-icons/md";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaGithub
} from "react-icons/fa";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order: number;
}

interface SocialLinksProps {
  links: SocialLink[];
  theme?: 'light' | 'dark';
}

const getSocialIcon = (platform: string) => {
  const normalizedPlatform = platform.toLowerCase();
  
  switch (normalizedPlatform) {
    case 'facebook':
      return <FaFacebook size={20} />;
    case 'twitter':
    case 'x':
      return <FaTwitter size={20} />;
    case 'linkedin':
      return <FaLinkedin size={20} />;
    case 'instagram':
      return <FaInstagram size={20} />;
    case 'youtube':
      return <FaYoutube size={20} />;
    case 'github':
      return <FaGithub size={20} />;
    case 'website':
    case 'personal':
      return <MdLanguage size={20} />;
    default:
      return <MdLink size={20} />;
  }
};

const getSocialColor = (platform: string) => {
  const normalizedPlatform = platform.toLowerCase();
  
  switch (normalizedPlatform) {
    case 'facebook':
      return 'hover:bg-blue-600 hover:text-white';
    case 'twitter':
    case 'x':
      return 'hover:bg-blue-400 hover:text-white';
    case 'linkedin':
      return 'hover:bg-blue-700 hover:text-white';
    case 'instagram':
      return 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white';
    case 'youtube':
      return 'hover:bg-red-600 hover:text-white';
    case 'github':
      return 'hover:bg-gray-900 hover:text-white';
    case 'website':
    case 'personal':
      return 'hover:bg-green-600 hover:text-white';
    default:
      return 'hover:bg-gray-600 hover:text-white';
  }
};

export default function SocialLinks({ links, theme = 'light' }: SocialLinksProps) {
  if (!links.length) return null;

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center gap-3">
      {sortedLinks.map((link, index) => (
        <motion.a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            theme === 'dark'
              ? 'border-white/30 text-white hover:border-white'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          } ${getSocialColor(link.platform)}`}
          title={`Visit ${link.platform}`}
        >
          {getSocialIcon(link.platform)}
        </motion.a>
      ))}
    </div>
  );
}
