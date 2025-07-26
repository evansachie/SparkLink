import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentSubscription, type CurrentSubscription } from "../services/api/subscription";

/**
 * Custom hook to fetch and manage the user's current subscription
 * This helps maintain consistent subscription data across the app
 */
export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentSubscription();
      setSubscription(data);
      
      // Update user context with current subscription tier
      if (data && user && typeof user === "object") {
        const updatedUser = {
          ...user,
          subscription: data.tier
        };
        
        // Update localStorage to reflect the current subscription
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch subscription"));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSubscriptionRef = () => fetchSubscription();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionRef();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchSubscriptionRef]);

  return {
    subscription,
    loading,
    error,
    refreshSubscription: fetchSubscription
  };
}
