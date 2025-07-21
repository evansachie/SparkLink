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
        const [subscriptionData, plansResponse] = await Promise.all([
          getCurrentSubscription(),
          getSubscriptionPlans()
        ]);
        setCurrentSubscription(subscriptionData);
        
        // Handle API response structure - the response might be { plans: [] } or just []
        const plansData = plansResponse?.plans || plansResponse || [];
        setPlans(Array.isArray(plansData) ? plansData : []);
      } catch {
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
