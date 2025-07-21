import { useState } from "react";
import { MdClose, MdCreditCard } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { type SubscriptionPlan } from "../../services/api/subscription";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onInitializePayment: (interval: "monthly" | "yearly") => void;
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

  const getYearlyPrice = () => {
    return Math.floor(plan.price * 12 * 0.8); // 20% discount for yearly
  };

  const handlePayment = () => {
    onInitializePayment(selectedInterval);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MdCreditCard className="text-primary" />
                Subscribe to {plan.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <MdClose size={24} />
              </button>
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
                        <p className="text-lg font-semibold">₦{plan.price.toLocaleString()}/mo</p>
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
                            Save 20%
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">₦{Math.floor(getYearlyPrice() / 12).toLocaleString()}/mo</p>
                          <p className="text-sm text-gray-500">₦{getYearlyPrice().toLocaleString()}/year</p>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
