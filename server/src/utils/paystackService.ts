import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = 'https://api.paystack.co';

// Configure axios for Paystack API calls
const paystackAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Initialize a payment transaction
 * @param amount - Amount in kobo/pesewas (the smallest currency unit)
 * @param email - Customer's email address
 * @param plan - Subscription plan ID (optional)
 * @param metadata - Additional data to include with the transaction
 */
export const initializeTransaction = async (
  amount: number, 
  email: string, 
  metadata: Record<string, any> = {},
  plan?: string
) => {
  try {
    const response = await paystackAPI.post('/transaction/initialize', {
      amount,
      email,
      metadata,
      ...(plan ? { plan } : {})
    });

    return response.data;
  } catch (error: any) {
    console.error('Paystack transaction initialization failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify a payment transaction
 * @param reference - Transaction reference
 */
export const verifyTransaction = async (reference: string) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error: any) {
    console.error('Paystack transaction verification failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a subscription plan
 * @param name - Name of the plan
 * @param amount - Amount in kobo/pesewas
 * @param interval - Billing interval ('monthly' or 'annually')
 */
export const createPlan = async (name: string, amount: number, interval: 'monthly' | 'annually') => {
  try {
    const response = await paystackAPI.post('/plan', {
      name,
      amount,
      interval
    });

    return response.data;
  } catch (error: any) {
    console.error('Paystack plan creation failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * List all subscription plans
 */
export const listPlans = async () => {
  try {
    const response = await paystackAPI.get('/plan');
    return response.data;
  } catch (error: any) {
    console.error('Paystack plans listing failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a subscription for a customer
 * @param planCode - The plan code
 * @param customerEmail - Customer's email
 * @param authorizationCode - Authorization code from previous payment
 */
export const createSubscription = async (planCode: string, customerEmail: string, authorizationCode: string) => {
  try {
    const response = await paystackAPI.post('/subscription', {
      plan: planCode,
      customer: customerEmail,
      authorization: authorizationCode
    });

    return response.data;
  } catch (error: any) {
    console.error('Paystack subscription creation failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param subscriptionCode - The subscription code to cancel
 */
export const cancelSubscription = async (subscriptionCode: string) => {
  try {
    const response = await paystackAPI.post(`/subscription/disable`, {
      code: subscriptionCode,
      token: subscriptionCode
    });

    return response.data;
  } catch (error: any) {
    console.error('Paystack subscription cancellation failed:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  initializeTransaction,
  verifyTransaction,
  createPlan,
  listPlans,
  createSubscription,
  cancelSubscription
};
