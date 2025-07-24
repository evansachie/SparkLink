import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdLock, MdVisibility } from "react-icons/md";
import { 
  getPublicProfile, 
  getPublicPage,
  verifyPagePassword,
  PublicProfile, 
  PublicPage 
} from "../../services/api/public";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import PublicLayout from "../../components/public/PublicLayout";
import SEOHead from "../../components/common/SEOHead";

interface ContentSection {
  title?: string;
  content?: string;
  items?: ContentItem[];
}

interface ContentItem {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
}

interface PageContent {
  sections?: ContentSection[];
  [key: string]: unknown;
}

export default function PublicPageView() {
  const { username, slug } = useParams() as { username: string; slug: string };
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [page, setPage] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!username || !slug) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load profile first
        const profileData = await getPublicProfile(username);
        
        if (!profileData.isPublic) {
          setError("This profile is private");
          return;
        }

        setProfile(profileData);
        
        // Load page
        try {
          const pageData = await getPublicPage(username, slug);
          setPage(pageData);
        } catch (err) {
          console.error("Error loading public page:", err);
          const errorMessage = getErrorMessage(err);
          if (errorMessage.includes("password")) {
            setShowPasswordForm(true);
          } else {
            setError(`Page not found or not accessible: ${errorMessage}`);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err, "Profile not found"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username, slug]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !slug || !password.trim()) return;

    try {
      setPasswordError(null);
      await verifyPagePassword(username, slug, { password });
      // After successful password verification, load the page
      const pageData = await getPublicPage(username, slug);
      setPage(pageData);
      setShowPasswordForm(false);
    } catch {
      setPasswordError("Incorrect password");
    }
  };

  const renderPageContent = (content: unknown) => {
    if (!content || typeof content !== 'object') {
      return <p className="text-gray-600">No content available</p>;
    }

    const pageContent = content as PageContent;

    // Handle different content types based on the page structure
    if (pageContent.sections && Array.isArray(pageContent.sections)) {
      return (
        <div className="space-y-8">
          {pageContent.sections.map((section: ContentSection, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-4"
            >
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              )}
              {section.content && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              )}
              {section.items && Array.isArray(section.items) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item: ContentItem, itemIndex: number) => (
                    <Card key={itemIndex}>
                      <CardContent className="p-6">
                        {item.title && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                        )}
                        {item.description && (
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        )}
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title || 'Content image'}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                          >
                            View Project →
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      );
    }

    // Handle simple text content
    if (typeof content === 'string') {
      return (
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      );
    }

    // Handle other content structures
    return (
      <div className="prose prose-lg max-w-none">
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    );
  };

  if (loading) {
    return <LoadingState text="Loading page..." fullscreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href={`/public/${username}`} className="text-primary hover:text-primary/80 font-medium">
            ← Back to {username}'s Profile
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  // Show password form if page is password protected
  if (showPasswordForm) {
    return (
      <PublicLayout profile={profile}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <MdLock size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Password Protected
                </h2>
                <p className="text-gray-600">
                  This page requires a password to view
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-center"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Access Page
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </PublicLayout>
    );
  }

  if (!page) {
    return (
      <PublicLayout profile={profile}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">This page doesn't exist or isn't published yet.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <>
      <SEOHead 
        profile={profile}
        pageTitle={`${page.title} - ${profile.firstName} ${profile.lastName}`}
        pageUrl={`${window.location.origin}/public/${username}/pages/${slug}`}
      />
      <PublicLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MdVisibility size={16} />
            <span>Published on {new Date(page.updatedAt).toLocaleDateString()}</span>
            {page.isPasswordProtected && (
              <>
                <span>•</span>
                <MdLock size={16} />
                <span>Password Protected</span>
              </>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderPageContent(page.content)}
        </div>

        {/* Page Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <a
              href={`/public/${username}`}
              className="text-primary hover:text-primary/80 font-medium"
            >
              ← Back to Profile
            </a>
            
            <div className="text-sm text-gray-500">
              Last updated {new Date(page.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>
    </PublicLayout>
    </>
  );
}
