import { MdCheck, MdStar } from "react-icons/md";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { type SubscriptionPlan } from "../../services/api/subscription";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  loading?: boolean;
}

export default function PlanCard({ 
  plan, 
  isCurrentPlan = false, 
  isPopular = false, 
  onSelectPlan, 
  loading = false 
}: PlanCardProps) {
  const getTierColor = () => {
    switch (plan.tier) {
      case 'STARTER': return 'border-blue-200 bg-blue-50';
      case 'RISE': return 'border-purple-200 bg-purple-50';
      case 'BLAZE': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getButtonColor = () => {
    switch (plan.tier) {
      case 'STARTER': return 'bg-blue-600 hover:bg-blue-700';
      case 'RISE': return 'bg-purple-600 hover:bg-purple-700';
      case 'BLAZE': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <Card className={`relative ${getTierColor()} ${isPopular ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <MdStar size={14} />
            Most Popular
          </span>
        </div>
      )}

      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">₵{plan.monthlyPrice.toLocaleString()}</span>
            <span className="text-gray-600">/monthly</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <MdCheck className="text-green-600 flex-shrink-0" size={18} />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Pages:</span>
            <span className="font-medium">{plan.limits.pages === null ? 'Unlimited' : plan.limits.pages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Custom Domain:</span>
            <span className="font-medium">{plan.limits.customDomain ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Analytics:</span>
            <span className="font-medium">{plan.limits.analytics ? 'Advanced' : 'Basic'}</span>
          </div>
        </div>

        <Button
          className={`w-full ${getButtonColor()}`}
          onClick={() => onSelectPlan(plan)}
          disabled={isCurrentPlan || loading}
        >
          {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
}
