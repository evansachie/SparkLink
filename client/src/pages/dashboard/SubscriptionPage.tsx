import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { 
  getCurrentSubscription, 
  getSubscriptionPlans,
  type CurrentSubscription,
  type SubscriptionPlan 
} from "../../services/api/subscription";
import SubscriptionHeader from "../../components/subscription/SubscriptionHeader";
import PlanComparison from "../../components/subscription/PlanComparison";
import CurrentPlanCard from "../../components/subscription/CurrentPlanCard";
import PaymentCallback from "../../components/subscription/PaymentCallback";
import {ErrorBoundary} from "../../components/common/ErrorBoundary";

export default function SubscriptionPage() {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [searchParams] = useSearchParams();
  
  // Check if user is returning from payment
  const isPaymentReturn = searchParams.has('reference') || searchParams.has('trxref');

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Load subscription and plans separately to handle errors better
        try {
          const subscriptionData = await getCurrentSubscription();
          setCurrentSubscription(subscriptionData);
        } catch (err) {
          console.error("Failed to load current subscription:", err);
        }
        
        try {
          const plansResponse = await getSubscriptionPlans();
          const plansData = plansResponse?.plans || {};
          
          // Convert the object to an array of plans
          const plansArray = Object.entries(plansData).map(([key, plan]) => ({
            ...plan,
            tier: key as "STARTER" | "RISE" | "BLAZE",
          }));
          
          setPlans(plansArray as SubscriptionPlan[]);
          
          // fallback default plans
          if (!plansArray.length) {
            setPlans([
              {
                tier: "STARTER" as const,
                name: "Starter",
                monthlyPrice: 0,
                yearlyPrice: 0,
                features: [
                  "1-page portfolio (Home default)",
                  "SparkLink-branded URL",
                  "3 professional templates",
                  "Customizable profile picture and banner"
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
              {
                tier: "RISE",
                name: "Rise",
                monthlyPrice: 35,
                yearlyPrice: 350,
                features: [
                  "Up to 6 total pages",
                  "10 standard templates",
                  "Analytics dashboard",
                  "Option to remove SparkLink branding"
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
              {
                tier: "BLAZE",
                name: "Blaze",
                monthlyPrice: 70,
                yearlyPrice: 700,
                features: [
                  "Unlimited pages and templates",
                  "White-label option",
                  "Verified badge on your profile",
                  "Client galleries with guest uploads"
                ],
                limits: {
                  pages: null,
                  socialLinks: null,
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
            ]);
          }
        } catch (err) {
          console.error("Failed to load subscription plans:", err);
          error("Failed to load subscription plans");
        }
      } catch (err) {
        console.error("Subscription data loading error:", err);
        error("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, [error]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <SubscriptionHeader />
      
      {/* Show payment callback UI if user is returning from payment */}
      {isPaymentReturn && (
        <div className="mb-8">
          <PaymentCallback />
        </div>
      )}
      
      {currentSubscription && (
        <CurrentPlanCard 
          subscription={currentSubscription}
          onUpdate={setCurrentSubscription}
        />
      )}
      
      <ErrorBoundary>
        <PlanComparison 
          plans={plans}
          currentSubscription={currentSubscription}
          onSubscriptionUpdate={setCurrentSubscription}
        />
      </ErrorBoundary>
      
    </div>
  );
}
