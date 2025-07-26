import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { verifySubscription } from "../../services/api/subscription";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";

/**
 * Component to handle subscription payment callbacks
 * Renders on the subscription page when returning from payment gateway
 */
export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [verifying, setVerifying] = useState(false);
  // Check if user is authenticated
  const { isAuthenticated } = useAuth();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Don't verify payment if user is not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    const reference = searchParams.get("reference") || localStorage.getItem("pendingSubscriptionReference");
    const trxref = searchParams.get("trxref");
    
    // If we have a reference from URL parameters or localStorage, verify the payment
    if (reference || trxref) {
      const verifyPayment = async () => {
        try {
          setVerifying(true);
          const referenceToUse = reference || trxref || "";
          
          // Call the API to verify payment
          const result = await verifySubscription(referenceToUse);
          
          if (result.status === "success") {
            success("Subscription payment successful! Your plan has been updated.");
            
            // Update the subscription data through our hook
            refreshSubscription();
            
            // Clear any pending subscription data
            localStorage.removeItem("pendingSubscription");
            localStorage.removeItem("pendingSubscriptionReference");
          } else {
            error(`Payment verification failed: ${result.message}`);
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          error("Failed to verify payment. Please contact support if your subscription is not activated.");
        } finally {
          setVerifying(false);
        }
      };
      
      verifyPayment();
    }
  }, [searchParams, success, error, refreshSubscription, navigate, isAuthenticated]);

  // Don't render anything, just handle the verification
  return (
    <div className="flex items-center justify-center p-8">
      {verifying ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-900">Verifying your payment...</p>
          <p className="text-gray-600 mt-2">Please wait while we confirm your subscription.</p>
        </div>
      ) : null}
    </div>
  );
}
