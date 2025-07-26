import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentSubscription, type CurrentSubscription } from "../services/api/subscription";

/**
 * Custom hook to fetch and manage the user's current subscription
 * This helps maintain consistent subscription data across the app
 */
export function useSubscription() {
  const { user, isAuthenticated, updateUser } = useAuth();
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
        // Use the updateUser function from AuthContext to update both state and localStorage
        updateUser({ subscription: data.tier });
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

  // Return an async refreshSubscription function that can be awaited
  const refreshSubscription = async () => {
    return await fetchSubscription();
  };

  return {
    subscription,
    loading,
    error,
    refreshSubscription
  };
}
