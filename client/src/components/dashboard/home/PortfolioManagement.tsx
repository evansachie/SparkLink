import { 
  MdPerson, 
  MdPages, 
  MdPhotoLibrary, 
  MdBarChart 
} from "react-icons/md";
import { Profile, Page, GalleryItem } from "../../../types/api";
import { FeatureCard } from "./FeatureCard";

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
