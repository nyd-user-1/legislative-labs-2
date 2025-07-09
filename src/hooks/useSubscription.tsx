import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: 'free',
    subscription_end: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('check-subscription');
      
      if (functionError) {
        throw functionError;
      }

      if (data) {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (tier: string, billingCycle: 'monthly' | 'annually' = 'monthly') => {
    if (!user) {
      throw new Error('User must be authenticated to create checkout');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { tier, billingCycle }
    });

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      throw new Error('User must be authenticated to access customer portal');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal');

    if (error) {
      throw error;
    }

    if (data?.url) {
      window.open(data.url, '_blank');
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal
  };
};