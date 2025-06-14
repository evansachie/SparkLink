import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import prisma from '../config/database';
import { SubscriptionTier } from '@prisma/client';
import { SUBSCRIPTION_PLANS, convertToPesewas, getSubscriptionDetails } from '../config/subscriptionPlans';
import paystackService from '../utils/paystackService';

/**
 * Get subscription plans with pricing and features
 */
export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    res.json({
      status: 'SUCCESS',
      data: {
        plans: SUBSCRIPTION_PLANS
      }
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch subscription plans'
    });
  }
};

/**
 * Get current user's subscription
 */
export const getCurrentSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        subscriptionData: true,
        subscriptionExpiresAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get plan details
    const planDetails = getSubscriptionDetails(user.subscription);

    res.json({
      status: 'SUCCESS',
      data: {
        currentPlan: user.subscription,
        planDetails,
        subscriptionData: user.subscriptionData,
        expiresAt: user.subscriptionExpiresAt
      }
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to fetch current subscription'
    });
  }
};

/**
 * Initialize subscription payment
 */
export const initializeSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { plan, billingCycle } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    // Validate input
    if (!plan || !billingCycle || !Object.keys(SUBSCRIPTION_PLANS).includes(plan)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid plan or billing cycle'
      });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Billing cycle must be monthly or yearly'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Get plan pricing
    const planDetails = SUBSCRIPTION_PLANS[plan as SubscriptionTier];
    const amount = billingCycle === 'monthly' 
      ? convertToPesewas(planDetails.monthlyPrice)
      : convertToPesewas(planDetails.yearlyPrice);
    
    // Skip payment for free plans
    if (plan === 'STARTER') {
      // Update user's subscription to STARTER
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: 'STARTER',
          subscriptionData: {
            plan: 'STARTER',
            billingCycle: 'N/A',
            status: 'active'
          },
          subscriptionExpiresAt: null
        }
      });

      return res.json({
        status: 'SUCCESS',
        message: 'Subscription updated to Starter (free plan)',
        data: {
          subscription: 'STARTER'
        }
      });
    }

    // Initialize payment
    const metadata = {
      userId,
      plan,
      billingCycle,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    };

    const paymentResponse = await paystackService.initializeTransaction(
      amount,
      user.email,
      metadata
    );

    res.json({
      status: 'SUCCESS',
      data: {
        authorizationUrl: paymentResponse.data.authorization_url,
        reference: paymentResponse.data.reference,
        accessCode: paymentResponse.data.access_code
      }
    });
  } catch (error) {
    console.error('Initialize subscription error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to initialize subscription'
    });
  }
};

/**
 * Verify payment and update subscription
 */
export const verifySubscriptionPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    // Verify the transaction
    const verificationResponse = await paystackService.verifyTransaction(reference);
    
    if (!verificationResponse.status || verificationResponse.data.status !== 'success') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment verification failed'
      });
    }

    const { data } = verificationResponse;
    const metadata = data.metadata as { userId: string; plan: string; billingCycle: string } | undefined;
    
    if (!metadata || !metadata.userId || !metadata.plan || !metadata.billingCycle) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid transaction metadata'
      });
    }

    // Calculate expiration date
    const now = new Date();
    let expiryDate = null;
    
    if (metadata.billingCycle === 'monthly') {
      expiryDate = new Date(now.setMonth(now.getMonth() + 1));
    } else if (metadata.billingCycle === 'yearly') {
      expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
    }

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: metadata.userId },
      data: {
        subscription: metadata.plan as SubscriptionTier,
        subscriptionData: {
          plan: metadata.plan,
          billingCycle: metadata.billingCycle,
          transactionRef: reference,
          paymentMethod: 'paystack',
          status: 'active',
          authorizationCode: data.authorization?.authorization_code,
          cardDetails: {
            last4: data.authorization?.last4,
            expMonth: data.authorization?.exp_month,
            expYear: data.authorization?.exp_year,
            cardType: data.authorization?.card_type
          }
        },
        subscriptionExpiresAt: expiryDate
      }
    });

    res.json({
      status: 'SUCCESS',
      message: `Subscription updated to ${metadata.plan}`,
      data: {
        subscription: updatedUser.subscription,
        expiresAt: updatedUser.subscriptionExpiresAt
      }
    });
  } catch (error) {
    console.error('Verify subscription payment error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to verify subscription payment'
    });
  }
};

/**
 * Cancel current subscription
 */
export const cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found'
      });
    }

    // Check if they have a subscription code in subscriptionData
    const subscriptionData = user.subscriptionData as Record<string, any> | null;
    const subscriptionCode = subscriptionData?.subscriptionCode;
    
    // If they have an active Paystack subscription, cancel it
    if (subscriptionCode) {
      try {
        await paystackService.cancelSubscription(subscriptionCode);
      } catch (error) {
        console.error('Error cancelling Paystack subscription:', error);
        // Continue anyway to update our database
      }
    }

    // Prepare new subscription data
    const newSubscriptionData = {
      plan: 'STARTER',
      billingCycle: 'N/A',
      status: 'active',
      previousPlan: user.subscription,
      cancelledAt: new Date()
    };

    // If existing data exists, merge it with the new data
    if (subscriptionData) {
      Object.assign(newSubscriptionData, {
        ...subscriptionData,
        ...newSubscriptionData
      });
    }

    // Update user to free tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: 'STARTER' as SubscriptionTier,
        subscriptionData: newSubscriptionData,
        subscriptionExpiresAt: null
      }
    });

    res.json({
      status: 'SUCCESS',
      message: 'Subscription cancelled successfully. Reverted to free plan.',
      data: {
        subscription: 'STARTER'
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to cancel subscription'
    });
  }
};

/**
 * Handle Paystack webhook
 */
export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventType = event.event;

    // Quickly acknowledge receipt of the webhook
    res.sendStatus(200);
    
    // Process different event types
    switch (eventType) {
      case 'subscription.create':
        // Handle new subscription
        await handleSubscriptionCreate(event.data);
        break;
        
      case 'subscription.disable':
        // Handle subscription cancellation
        await handleSubscriptionDisable(event.data);
        break;
        
      case 'charge.success':
        // Handle successful charge
        await handleChargeSuccess(event.data);
        break;
        
      case 'invoice.payment_failed':
        // Handle payment failure
        await handlePaymentFailure(event.data);
        break;
        
      default:
        console.log(`Unhandled Paystack event: ${eventType}`, event);
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    // We've already sent a 200 response to Paystack
  }
};

// Helper functions for webhook event handling
async function handleSubscriptionCreate(data: any) {
  try {
    // Extract customer email and subscription details
    const { customer, plan, subscription_code } = data;
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    });
    
    if (user) {
      // Get existing subscription data or create empty object
      const existingData = user.subscriptionData as Record<string, any> || {};
      
      // Update subscription info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionData: {
            ...existingData,
            subscriptionCode: subscription_code,
            planCode: plan.plan_code,
            status: 'active'
          }
        }
      });
    }
  } catch (error) {
    console.error('Error handling subscription creation webhook:', error);
  }
}

async function handleSubscriptionDisable(data: any) {
  try {
    // Extract subscription code
    const { subscription_code, customer } = data;
    
    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    });
    
    if (user) {
      // Get existing subscription data
      const existingData = user.subscriptionData as Record<string, any> || {};
      
      // Check if this is the right subscription
      if (existingData.subscriptionCode === subscription_code) {
        // Update user to free plan
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscription: 'STARTER' as SubscriptionTier,
            subscriptionData: {
              ...existingData,
              status: 'cancelled',
              cancelledAt: new Date()
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error handling subscription disable webhook:', error);
  }
}

async function handleChargeSuccess(data: any) {
  try {
    const { customer, metadata } = data;
    
    if (!metadata || !metadata.userId) return;
    
    // Update user's payment history
    const user = await prisma.user.findUnique({
      where: { id: metadata.userId }
    });
    
    if (user) {
      // Get existing subscription data
      const existingData = user.subscriptionData as Record<string, any> || {};
      
      // Calculate new expiry date
      let expiryDate = null;
      const now = new Date();
      
      if (metadata.billingCycle === 'monthly') {
        expiryDate = new Date(now.setMonth(now.getMonth() + 1));
      } else if (metadata.billingCycle === 'yearly') {
        expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
      }
      
      // Update subscription info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionExpiresAt: expiryDate,
          subscriptionData: {
            ...existingData,
            lastPaymentDate: new Date(),
            status: 'active'
          }
        }
      });
    }
  } catch (error) {
    console.error('Error handling charge success webhook:', error);
  }
}

async function handlePaymentFailure(data: any) {
  try {
    const { customer } = data;
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    });
    
    if (user) {
      // Get existing subscription data
      const existingData = user.subscriptionData as Record<string, any> || {};
      
      // Update subscription status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionData: {
            ...existingData,
            status: 'payment_failed',
            lastFailedPaymentDate: new Date()
          }
        }
      });
    }
  } catch (error) {
    console.error('Error handling payment failure webhook:', error);
  }
}
