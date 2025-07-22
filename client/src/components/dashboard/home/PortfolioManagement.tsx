import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MdPerson, 
  MdPages, 
  MdPhotoLibrary, 
  MdBarChart 
} from "react-icons/md";
import { Profile, Page, GalleryItem } from "../../../types/api";

interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  to: string;
  color: string;
  stats: string;
  progress: number;
  index: number;
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  to, 
  color, 
  stats, 
  progress, 
  index 
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
    >
      <Link
        to={to}
        className="group block p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color}`} />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{stats}</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface PortfolioManagementProps {
  pages: Page[];
  galleryItems: GalleryItem[];
  profile: Profile | null;
}

export default function PortfolioManagement({ 
  pages, 
  galleryItems, 
  profile 
}: PortfolioManagementProps) {
  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    if (!profile) return 0;
    
    const fields = [
      'firstName', 
      'lastName', 
      'username', 
      'bio', 
      'country', 
      'phone', 
      'tagline'
    ];
    
    const socialLinks = profile.socialLinks && profile.socialLinks.length > 0;
    const profilePicture = !!profile.profilePicture;
    
    // Count completed fields
    const completedFields = fields.filter(field => !!profile[field as keyof typeof profile]).length;
    const totalFieldsToCheck = fields.length + 2; // Adding social links and profile picture
    const totalCompletedFields = completedFields + (socialLinks ? 1 : 0) + (profilePicture ? 1 : 0);
    
    return Math.round((totalCompletedFields / totalFieldsToCheck) * 100);
  };

  // Prepare feature cards data
  const featuresData = [
    {
      icon: <MdPerson size={32} className="text-blue-500" />,
      title: "Profile Management",
      description: "Customize your personal brand and information.",
      to: "/dashboard/profile",
      color: "from-blue-500 to-blue-600",
      stats: `${calculateProfileCompletion()}% Complete`,
      progress: calculateProfileCompletion()
    },
    {
      icon: <MdPages size={32} className="text-purple-500" />,
      title: "Portfolio Pages",
      description: "Create stunning pages to showcase your work.",
      to: "/dashboard/pages",
      color: "from-purple-500 to-purple-600",
      stats: `${pages.length} Pages`,
      progress: pages.length > 0 ? Math.min(Math.round((pages.length / 5) * 100), 100) : 0
    },
    {
      icon: <MdPhotoLibrary size={32} className="text-green-500" />,
      title: "Media Gallery",
      description: "Organize and display your best work.",
      to: "/dashboard/gallery",
      color: "from-green-500 to-green-600",
      stats: `${galleryItems.length} Items`,
      progress: galleryItems.length > 0 ? Math.min(Math.round((galleryItems.length / 10) * 100), 100) : 0
    },
    {
      icon: <MdBarChart size={32} className="text-orange-500" />,
      title: "Analytics Hub",
      description: "Track your portfolio's performance and reach.",
      to: "/dashboard/analytics",
      color: "from-orange-500 to-orange-600",
      stats: "View Reports",
      progress: 0
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full mr-3" />
        Portfolio Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuresData.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
