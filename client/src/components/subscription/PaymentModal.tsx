import { useState } from "react";
import { MdCreditCard } from "react-icons/md";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Modal } from "../common/Modal";
import { type SubscriptionPlan } from "../../services/api/subscription";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onInitializePayment: (billingCycle: "monthly" | "yearly") => void;
  loading: boolean;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  plan, 
  onInitializePayment, 
  loading 
}: PaymentModalProps) {
  const [selectedInterval, setSelectedInterval] = useState<"monthly" | "yearly">("monthly");

  const handlePayment = () => {
    onInitializePayment(selectedInterval);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className="flex items-center justify-between p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MdCreditCard className="text-primary" />
          Subscribe to {plan.name}
        </h3>
      </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium mb-3">Choose billing cycle:</h4>
                <div className="space-y-3">
                  <Card 
                    className={`cursor-pointer border-2 ${
                      selectedInterval === 'monthly' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedInterval('monthly')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Monthly</p>
                          <p className="text-sm text-gray-600">Billed monthly</p>
                        </div>
                        <p className="text-lg font-semibold">₵{plan.monthlyPrice.toLocaleString()}/mo</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer border-2 ${
                      selectedInterval === 'yearly' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedInterval('yearly')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Yearly</p>
                          <p className="text-sm text-gray-600">Billed annually</p>
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Save {Math.round(((plan.monthlyPrice * 12) - plan.yearlyPrice) / (plan.monthlyPrice * 12) * 100)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">₵{Math.floor(plan.yearlyPrice / 12).toLocaleString()}/mo</p>
                          <p className="text-sm text-gray-500">₵{plan.yearlyPrice.toLocaleString()}/year</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">What you'll get:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                  {plan.features.length > 3 && (
                    <li>• And {plan.features.length - 3} more features...</li>
                  )}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
    </Modal>
  );
}
