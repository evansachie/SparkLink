import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdPhoto, 
  MdFilterList, 
  MdClose,
  MdArrowBack,
  MdArrowForward
} from "react-icons/md";
import { 
  getPublicProfile, 
  getPublicGallery, 
  PublicProfile, 
  PublicGalleryItem 
} from "../../services/api/public";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LoadingState } from "../../components/ui/loading";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import PublicLayout from "../../components/public/PublicLayout";
import SEOHead from "../../components/common/SEOHead";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: PublicGalleryItem[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

function Lightbox({ isOpen, onClose, items, currentIndex, onNext, onPrevious }: LightboxProps) {
  const currentItem = items[currentIndex];

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-5xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10"
          >
            <MdClose size={20} />
          </Button>

          {/* Navigation Buttons */}
          {items.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                disabled={currentIndex === 0}
              >
                <MdArrowBack size={20} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
                disabled={currentIndex === items.length - 1}
              >
                <MdArrowForward size={20} />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
            <h3 className="text-white text-xl font-semibold mb-2">
              {currentItem.title}
            </h3>
            {currentItem.description && (
              <p className="text-gray-200 mb-2">{currentItem.description}</p>
            )}
            {currentItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/20 text-white text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-gray-300 text-sm mt-2">
              {currentIndex + 1} of {items.length}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PublicGalleryView() {
  const { username } = useParams() as { username: string };
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [items, setItems] = useState<PublicGalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PublicGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!username) return;

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
        
        // Load gallery
        const galleryData = await getPublicGallery(username);
        setItems(galleryData.items);
        setFilteredItems(galleryData.items);
      } catch (err) {
        setError(getErrorMessage(err, "Gallery not found"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  // Filter items by category
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => 
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      ));
    }
  }, [items, selectedCategory]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => 
      prev < filteredItems.length - 1 ? prev + 1 : prev
    );
  };

  const previousImage = () => {
    setLightboxIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  // Get unique categories
  const categories = Array.from(
    new Set(items.filter(item => item.category).map(item => item.category))
  ).filter(Boolean) as string[];

  if (loading) {
    return <LoadingState text="Loading gallery..." fullscreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gallery Not Found</h1>
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

  return (
    <>
      <SEOHead 
        profile={profile}
        pageTitle={`Gallery - ${profile.firstName} ${profile.lastName}`}
        pageDescription={`View ${profile.firstName}'s photo gallery with ${filteredItems.length} images`}
        pageUrl={`${window.location.origin}/public/${username}/gallery`}
      />
      <PublicLayout profile={profile}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Gallery Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <MdPhoto size={32} className="text-primary" />
              Gallery
            </h1>
            <p className="text-gray-600">
              {filteredItems.length} {filteredItems.length === 1 ? 'image' : 'images'}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <MdFilterList size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MdPhoto size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedCategory ? 'No images in this category' : 'No images yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory 
                ? `There are no images in the "${selectedCategory}" category.`
                : 'This gallery is empty. Check back later for updates!'
              }
            </p>
            {selectedCategory && (
              <Button variant="outline" onClick={() => setSelectedCategory("")}>
                View All Images
              </Button>
            )}
          </div>
        )}

        {/* Back Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <a
            href={`/public/${username}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            ← Back to Profile
          </a>
        </div>

        {/* Lightbox */}
        <Lightbox
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          items={filteredItems}
          currentIndex={lightboxIndex}
          onNext={nextImage}
          onPrevious={previousImage}
        />
      </motion.div>
    </PublicLayout>
    </>
  );
}
