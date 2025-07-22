export interface Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  country?: string;
  phone?: string;
  tagline?: string;
  profilePicture?: string;
  backgroundImage?: string;
  socialLinks?: SocialLink[];
  subscription?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export enum PageType {
  HOME = "HOME",
  ABOUT = "ABOUT",
  PROJECTS = "PROJECTS",
  SERVICES = "SERVICES",
  CONTACT = "CONTACT",
  GALLERY = "GALLERY",
  BLOG = "BLOG",
  RESUME = "RESUME",
  TESTIMONIALS = "TESTIMONIALS",
  CUSTOM = "CUSTOM"
}

export interface Page {
  id: string;
  type: PageType;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  isPasswordProtected?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagesResponse {
  pages: Page[];
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  url: string;
  imageUrl: string;
  thumbnailUrl?: string;
  order?: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryResponse {
  items: GalleryItem[];
  totalCount: number;
}

export interface ActivityEvent {
  id: string;
  event: string;
  details?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  profileViews: number;
  totalViews: number;
  galleryViews: number;
  socialClicks: number;
  previousProfileViews: number;
  previousTotalViews: number;
  previousGalleryViews: number;
  previousSocialClicks: number;
  recentActivity: ActivityEvent[];
}

export interface AnalyticsTrend {
  date: string;
  profileViews: number;
  pageViews: number;
  galleryViews: number;
  socialClicks: number;
}

export interface AnalyticsTrendsResponse {
  trends: AnalyticsTrend[];
  period: string;
}
