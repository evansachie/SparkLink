import { motion } from "framer-motion";
import { MdVerified } from "react-icons/md";

interface VerificationBadge {
  type: string;
  verifiedAt: string;
}

interface VerificationBadgesProps {
  badges: VerificationBadge[];
}

const getBadgeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'identity':
      return 'bg-blue-500';
    case 'business':
      return 'bg-green-500';
    case 'social':
      return 'bg-purple-500';
    case 'celebrity':
      return 'bg-yellow-500';
    case 'organization':
      return 'bg-indigo-500';
    default:
      return 'bg-primary';
  }
};

export default function VerificationBadges({ badges }: VerificationBadgesProps) {
  if (!badges.length) return null;

  return (
    <div className="absolute -bottom-2 -right-2 flex gap-1">
      {badges.slice(0, 3).map((badge, index) => (
        <motion.div
          key={badge.type}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`w-8 h-8 ${getBadgeColor(badge.type)} rounded-full border-2 border-white flex items-center justify-center shadow-md`}
          title={`${badge.type.charAt(0) + badge.type.slice(1).toLowerCase()} Verified`}
        >
          <MdVerified size={16} className="text-white" />
        </motion.div>
      ))}
      {badges.length > 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-8 h-8 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center shadow-md"
          title={`+${badges.length - 3} more verification badges`}
        >
          <span className="text-white text-xs font-bold">+{badges.length - 3}</span>
        </motion.div>
      )}
    </div>
  );
}
