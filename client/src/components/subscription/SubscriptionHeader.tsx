import { MdCreditCard } from "react-icons/md";

export default function SubscriptionHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3">
        <MdCreditCard size={32} className="text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Choose the perfect plan for your portfolio needs. 
        Upgrade or downgrade anytime to fit your goals.
      </p>
    </div>
  );
}
