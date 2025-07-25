import { MdStar, MdCancel } from "react-icons/md";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/useToast";
import ConfirmDialog from "../common/ConfirmDialog";
import { cancelSubscription, type CurrentSubscription } from "../../services/api/subscription";

interface CurrentPlanCardProps {
  subscription: CurrentSubscription;
  onUpdate: (subscription: CurrentSubscription | null) => void;
}

export default function CurrentPlanCard({ subscription, onUpdate }: CurrentPlanCardProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription();
      success("Subscription cancelled successfully");
      onUpdate(null);
    } catch {
      error("Failed to cancel subscription");
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'STARTER': return 'text-blue-600 bg-blue-50';
      case 'RISE': return 'text-purple-600 bg-purple-50';
      case 'BLAZE': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdStar className="text-primary" size={24} />
              <h2 className="text-xl font-semibold">Current Subscription</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Plan</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(subscription.tier)}`}>
                {subscription.plan?.name || subscription.tier}
              </span>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">Price</h3>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.plan?.monthlyPrice 
                  ? `₵${subscription.plan.monthlyPrice.toLocaleString()}/monthly`
                  : 'Not available'
                }
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">Next Billing</h3>
              <p className="text-sm text-gray-600">
                {subscription.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString() 
                  : 'Not available'}
              </p>
            </div>
          </div>

          {subscription.status === 'active' && (
            <div className="mt-6 pt-6 border-t">
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <MdCancel size={16} />
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onCancel={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period."
        confirmText="Cancel Subscription"
        type="danger"
        loading={loading}
      />
    </>
  );
}
