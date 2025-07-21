import { useEffect } from "react";
import { PublicProfile } from "../../services/api/public";

interface SEOHeadProps {
  profile: PublicProfile;
  pageTitle?: string;
  pageDescription?: string;
  pageImage?: string;
  pageUrl?: string;
}

export default function SEOHead({ 
  profile, 
  pageTitle, 
  pageDescription, 
  pageImage,
  pageUrl 
}: SEOHeadProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const title = pageTitle || `${fullName} - Portfolio`;
  const description = pageDescription || profile.bio || profile.tagline || `${fullName}'s professional portfolio`;
  const image = pageImage || profile.profilePicture || profile.backgroundImage;
  const url = pageUrl || `${window.location.origin}/public/${profile.username}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', 'profile');
    updateMetaTag('og:url', url);
    if (image) {
      updateMetaTag('og:image', image);
    }

    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);
    if (image) {
      updateTwitterTag('twitter:image', image);
    }

    // Add JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": fullName,
      "description": description,
      "url": url,
      "image": image,
      "sameAs": profile.socialLinks.map(link => link.url),
      "jobTitle": profile.tagline,
      "worksFor": {
        "@type": "Organization",
        "name": "Freelancer"
      }
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'SparkLink';
    };
  }, [title, description, image, url, fullName, profile.socialLinks, profile.tagline]);

  return null; // This component doesn't render anything
}
