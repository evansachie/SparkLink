import { useState } from "react";
import { useToast } from "../../hooks/useToast";
import PlanCard from "./PlanCard";
import PaymentModal from "./PaymentModal";
import { 
  type SubscriptionPlan, 
  type CurrentSubscription,
  initializeSubscription
} from "../../services/api/subscription";

interface PlanComparisonProps {
  plans: SubscriptionPlan[];
  currentSubscription: CurrentSubscription | null;
  onSubscriptionUpdate: (subscription: CurrentSubscription | null) => void;
}

export default function PlanComparison({ 
  plans, 
  currentSubscription}: PlanComparisonProps) {
  const { error } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure plans is always an array
  const safePlans = Array.isArray(plans) ? plans : [];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleInitializePayment = async (billingCycle: "monthly" | "yearly") => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const response = await initializeSubscription({
        plan: selectedPlan.tier,
        billingCycle
      });

      // Store callback info for when user returns from payment
      localStorage.setItem('pendingSubscription', JSON.stringify({
        plan: selectedPlan.tier,
        billingCycle,
        reference: response.reference
      }));

      // Redirect to Paystack payment page
      window.location.href = response.authorizationUrl;
    } catch {
      error("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!currentSubscription) return false;
    if (!currentSubscription.plan) return false;
    return currentSubscription.plan.tier === plan.tier;
  };

  const getPopularPlan = () => {
    return safePlans.find(plan => plan && plan.tier === 'RISE');
  };

  // Show loading state if no plans
  if (!safePlans.length) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Choose Your Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safePlans.map((plan) => {
            // Skip any invalid plans
            if (!plan || !plan.tier) return null;
            
            const popularPlan = getPopularPlan();
            const isPopular = popularPlan ? plan.tier === popularPlan.tier : false;
            
            return (
              <PlanCard
                key={plan.tier}
                plan={plan}
                isCurrentPlan={isCurrentPlan(plan)}
                isPopular={isPopular}
                onSelectPlan={handleSelectPlan}
                loading={loading}
              />
            );
          })}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onInitializePayment={handleInitializePayment}
          loading={loading}
        />
      )}
    </>
  );
}
