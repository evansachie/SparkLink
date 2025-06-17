import { SubscriptionTier } from '@prisma/client';

export interface TemplateFeature {
  key: string;
  name: string;
  description: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  category: string;
  tier: SubscriptionTier;
  features: Record<string, boolean | string>;
  isDefault?: boolean;
  isActive?: boolean;
}

// Default template features
export const TEMPLATE_FEATURES: TemplateFeature[] = [
  { key: 'animatedTransitions', name: 'Animated Transitions', description: 'Smooth page transitions and animations' },
  { key: 'darkMode', name: 'Dark Mode', description: 'Toggle between light and dark themes' },
  { key: 'customFonts', name: 'Custom Fonts', description: 'Access to premium typography options' },
  { key: 'responsiveLayout', name: 'Responsive Layout', description: 'Optimized for all screen sizes' },
  { key: 'pageNavigationStyle', name: 'Navigation Style', description: 'How the navigation menu is displayed' },
  { key: 'footerStyle', name: 'Footer Style', description: 'How the footer is displayed' }
];

// Default template definitions
export const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  // STARTER tier templates
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design with focus on content',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/minimal.jpg',
    category: 'professional',
    tier: 'STARTER',
    features: {
      animatedTransitions: false,
      darkMode: false,
      customFonts: false,
      responsiveLayout: true,
      pageNavigationStyle: 'simple',
      footerStyle: 'basic'
    },
    isDefault: true,
    isActive: true
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated design with serif typography',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/elegant.jpg',
    category: 'professional',
    tier: 'STARTER',
    features: {
      animatedTransitions: false,
      darkMode: false,
      customFonts: true,
      responsiveLayout: true,
      pageNavigationStyle: 'centered',
      footerStyle: 'minimal'
    },
    isActive: true
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'High contrast design with strong typography',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/bold.jpg',
    category: 'professional',
    tier: 'STARTER',
    features: {
      animatedTransitions: false,
      darkMode: true,
      customFonts: false,
      responsiveLayout: true,
      pageNavigationStyle: 'side',
      footerStyle: 'standard'
    },
    isActive: true
  },
  
  // RISE tier templates
  {
    id: 'creative',
    name: 'Creative',
    description: 'Unique layout with artistic elements',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/creative.jpg',
    category: 'creative',
    tier: 'RISE',
    features: {
      animatedTransitions: true,
      darkMode: true,
      customFonts: true,
      responsiveLayout: true,
      pageNavigationStyle: 'animated',
      footerStyle: 'creative'
    },
    isActive: true
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional design for business professionals',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/corporate.jpg',
    category: 'professional',
    tier: 'RISE',
    features: {
      animatedTransitions: false,
      darkMode: true,
      customFonts: true,
      responsiveLayout: true,
      pageNavigationStyle: 'dropdown',
      footerStyle: 'corporate'
    },
    isActive: true
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Visual-focused layout for showcasing work',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/portfolio.jpg',
    category: 'creative',
    tier: 'RISE',
    features: {
      animatedTransitions: true,
      darkMode: true,
      customFonts: true,
      responsiveLayout: true,
      pageNavigationStyle: 'hamburger',
      footerStyle: 'minimal'
    },
    isActive: true
  },
  
  // BLAZE tier templates
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury design with premium animations',
    previewImage: 'https://res.cloudinary.com/sparklink/image/upload/v1/templates/premium.jpg',
    category: 'premium',
    tier: 'BLAZE',
    features: {
      animatedTransitions: true,
      darkMode: true,
      customFonts: true,
      responsiveLayout: true,
      pageNavigationStyle: 'custom',
      footerStyle: 'premium'
    },
    isActive: true
  }
];

// Default color schemes
export const DEFAULT_COLOR_SCHEMES = {
  light: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#ffffff',
    text: '#333333',
    accent: '#e74c3c'
  },
  dark: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#121212',
    text: '#f5f5f5',
    accent: '#e74c3c'
  }
};
