import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  MdHome, 
  MdPerson, 
  MdWork, 
  MdPhoto, 
  MdContactMail 
} from "react-icons/md";
import { getPublicPages, PublicPage } from "../../services/api/public";

interface PublicNavigationProps {
  username: string;
}

const getPageIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'home':
      return <MdHome size={18} />;
    case 'about':
      return <MdPerson size={18} />;
    case 'projects':
    case 'services':
      return <MdWork size={18} />;
    case 'gallery':
      return <MdPhoto size={18} />;
    case 'contact':
      return <MdContactMail size={18} />;
    default:
      return <MdHome size={18} />;
  }
};

export default function PublicNavigation({ username }: PublicNavigationProps) {
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const { pages: publicPages } = await getPublicPages(username);
        setPages(publicPages.filter(page => page.isPublished).sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error('Failed to load pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, [username]);

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-4">
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 py-4 overflow-x-auto">
          {/* Profile Home Link */}
          <NavLink
            to={`/public/${username}`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`
            }
          >
            <MdHome size={18} />
            <span>Profile</span>
          </NavLink>

          {/* Dynamic Pages */}
          {pages.map((page) => (
            <NavLink
              key={page.id}
              to={`/public/${username}/pages/${page.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              {getPageIcon(page.type)}
              <span>{page.title}</span>
            </NavLink>
          ))}

          {/* Gallery Link */}
          <NavLink
            to={`/public/${username}/gallery`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`
            }
          >
            <MdPhoto size={18} />
            <span>Gallery</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
