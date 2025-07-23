import { useState, useEffect } from "react";
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
import BillingHistory from "../../components/subscription/BillingHistory";

export default function SubscriptionPage() {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

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
          // Still continue to try loading plans
        }
        
        try {
          const plansResponse = await getSubscriptionPlans();
          // Handle API response structure - the response might be { plans: [] } or just []
          const plansData = plansResponse?.plans || plansResponse || [];
          setPlans(Array.isArray(plansData) ? plansData : []);
          
          // fallback default plans
          if (!plansData.length) {
            setPlans([
              {
                id: "starter",
                name: "STARTER",
                tier: "STARTER",
                price: 0,
                currency: "NGN",
                interval: "monthly",
                features: ["Basic Portfolio", "1 Custom Page", "Limited Storage"],
                limits: {
                  pages: 1,
                  storage: 100,
                  customDomain: false,
                  analytics: false,
                  passwordProtection: false,
                  priority: false
                }
              },
              {
                id: "rise",
                name: "RISE",
                tier: "RISE",
                price: 15000,
                currency: "NGN",
                interval: "monthly",
                features: ["Enhanced Portfolio", "5 Custom Pages", "Expanded Storage", "Basic Analytics"],
                limits: {
                  pages: 5,
                  storage: 500,
                  customDomain: false,
                  analytics: true,
                  passwordProtection: false,
                  priority: false
                }
              },
              {
                id: "blaze",
                name: "BLAZE",
                tier: "BLAZE",
                price: 30000,
                currency: "NGN",
                interval: "monthly",
                features: ["Premium Portfolio", "Unlimited Pages", "Extensive Storage", "Advanced Analytics", "Custom Domain"],
                limits: {
                  pages: 999,
                  storage: 2000,
                  customDomain: true,
                  analytics: true,
                  passwordProtection: true,
                  priority: true
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
      
      {currentSubscription && (
        <CurrentPlanCard 
          subscription={currentSubscription}
          onUpdate={setCurrentSubscription}
        />
      )}
      
      <PlanComparison 
        plans={plans}
        currentSubscription={currentSubscription}
        onSubscriptionUpdate={setCurrentSubscription}
      />
      
      {currentSubscription && (
        <BillingHistory subscriptionId={currentSubscription.id} />
      )}
    </div>
  );
}
