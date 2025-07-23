import { PageType } from "../types/api";

export const PAGE_TYPE_COLORS: Record<PageType, string> = {
  [PageType.HOME]: "bg-blue-100 text-blue-800",
  [PageType.ABOUT]: "bg-purple-100 text-purple-800",
  [PageType.PROJECTS]: "bg-green-100 text-green-800",
  [PageType.SERVICES]: "bg-orange-100 text-orange-800",
  [PageType.CONTACT]: "bg-pink-100 text-pink-800",
  [PageType.GALLERY]: "bg-indigo-100 text-indigo-800",
  [PageType.BLOG]: "bg-yellow-100 text-yellow-800",
  [PageType.RESUME]: "bg-red-100 text-red-800",
  [PageType.TESTIMONIALS]: "bg-teal-100 text-teal-800",
  [PageType.CUSTOM]: "bg-gray-100 text-gray-800",
};

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  [PageType.HOME]: "Home",
  [PageType.ABOUT]: "About",
  [PageType.PROJECTS]: "Projects",
  [PageType.SERVICES]: "Services",
  [PageType.CONTACT]: "Contact",
  [PageType.GALLERY]: "Gallery",
  [PageType.BLOG]: "Blog",
  [PageType.RESUME]: "Resume",
  [PageType.TESTIMONIALS]: "Testimonials",
  [PageType.CUSTOM]: "Custom",
};

export const PAGE_TYPE_OPTIONS = [
  { value: PageType.HOME, label: "Home", description: "Main landing page" },
  { value: PageType.ABOUT, label: "About", description: "About me/company" },
  { value: PageType.PROJECTS, label: "Projects", description: "Portfolio projects" },
  { value: PageType.SERVICES, label: "Services", description: "Services offered" },
  { value: PageType.CONTACT, label: "Contact", description: "Contact information" },
  { value: PageType.GALLERY, label: "Gallery", description: "Image gallery" },
  { value: PageType.BLOG, label: "Blog", description: "Blog posts" },
  { value: PageType.RESUME, label: "Resume", description: "Professional resume" },
  { value: PageType.TESTIMONIALS, label: "Testimonials", description: "Client feedback" },
  { value: PageType.CUSTOM, label: "Custom", description: "Custom page" },
];