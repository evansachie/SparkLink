import { SubscriptionTier } from '@prisma/client';

export interface SubscriptionPlanDetails {
  tier: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    pages: number;
    socialLinks: number;
    customDomain: boolean;
    removeSparkLinkBranding: boolean;
    analytics: boolean;
    advancedPrivacy: boolean;
    scheduledPublishing: boolean;
    verifiedBadge: boolean;
    affiliate: boolean;
    prioritySupport: boolean;
  };
}

// Define subscription plans with features and limits
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanDetails> = {
  STARTER: {
    tier: 'STARTER',
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1-page portfolio (Home default)',
      'SparkLink-branded URL',
      '3 professional templates',
      'Customizable profile picture, background banner, and tagline',
      'Up to 5 social media links',
      'Basic bio',
      'Displays "Powered by SparkLink" badge',
      'Mobile optimized, SEO-ready'
    ],
    limits: {
      pages: 1,
      socialLinks: 5,
      customDomain: false,
      removeSparkLinkBranding: false,
      analytics: false,
      advancedPrivacy: false,
      scheduledPublishing: false,
      verifiedBadge: false,
      affiliate: false,
      prioritySupport: false
    }
  },
  RISE: {
    tier: 'RISE',
    name: 'Rise',
    monthlyPrice: 35,
    yearlyPrice: 350,
    features: [
      'Up to 6 total pages (Home + 5 additional pages)',
      '10 standard templates',
      'Analytics dashboard (visitor insights and referral sources)',
      'Option to remove SparkLink branding',
      'Password-protect pages',
      'Basic integrations (Calendly, PayPal, Google Calendar, etc.)',
      'Collect emails and phone numbers from visitors',
      'Enhanced content display for services, products, events, and more'
    ],
    limits: {
      pages: 6,
      socialLinks: 10,
      customDomain: false,
      removeSparkLinkBranding: true,
      analytics: true,
      advancedPrivacy: false,
      scheduledPublishing: false,
      verifiedBadge: false,
      affiliate: false,
      prioritySupport: false
    }
  },
  BLAZE: {
    tier: 'BLAZE',
    name: 'Blaze',
    monthlyPrice: 70,
    yearlyPrice: 700,
    features: [
      'Unlimited pages and access to all template designs',
      'White-label option (remove all SparkLink references)',
      'Verified badge on your profile',
      'Client galleries with guest uploads',
      'Priority support (24-hour response time)',
      'Schedule pages to go live or expire at specific times',
      'Advanced privacy controls and lead collection',
      'Access to the Spark Affiliate Program (earn 20% on referrals)'
    ],
    limits: {
      pages: Infinity,
      socialLinks: Infinity,
      customDomain: true,
      removeSparkLinkBranding: true,
      analytics: true,
      advancedPrivacy: true,
      scheduledPublishing: true,
      verifiedBadge: true,
      affiliate: true,
      prioritySupport: true
    }
  }
};

// Helper to get subscription details by tier
export const getSubscriptionDetails = (tier: SubscriptionTier): SubscriptionPlanDetails => {
  return SUBSCRIPTION_PLANS[tier];
};

// Convert GHS to the lowest currency unit (pesewas)
export const convertToPesewas = (amount: number): number => {
  return Math.round(amount * 100);
};
