import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setUser } from '../store/slices/authSlice';
import { createCheckoutSession, cancelSubscription, getCheckoutSession } from '../services/api';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';

if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  priceId: string;
}

// Plans array containing the different subscription plans with their details
// FYI - We can add more plans here and update the UI to show them.
// If you ask why we are not using the plans from the backend?
// Because plan ids in the stripe don't change. If we are using single currency then we can fetch
// the plans from stripe and filter them based on the currency and try using them. But there's still
// high chances we might end up creating duplicate plans in the stripe and we would never know which plan to put the user in (USD/EUR/GBP etc). 
// So its better to use the Plan ids from the env props to distinguish between the plans and attach them to the user's subscription.
const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: import.meta.env.VITE_STRIPE_FREE_PLAN_PRICE_ID || '',
    features: [
      '100 credits/month',
      'Basic support',
      'Community access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    priceId: import.meta.env.VITE_STRIPE_PRO_PLAN_PRICE_ID || '',
    features: [
      '500 credits/month',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    priceId: import.meta.env.VITE_STRIPE_BUSINESS_PLAN_PRICE_ID || '',
    features: [
      'Unlimited credits',
      'Dedicated support',
      'Custom solutions',
      'Team collaboration',
      'Enterprise features',
    ],
  },
];

const PlanSelector = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      // If the sessionId is present and we're not already checking for a session, set checkingSession to true
      if (sessionId && !checkingSession) {
        setCheckingSession(true);
        try {
          // Get the checkout session details from the server - this is used to update the subscription in our UI/database immediately.
          const { success, user: updatedUser } = await getCheckoutSession(sessionId);
          if (success && updatedUser) {
            // Update the user state with the new subscription details
            dispatch(setUser(updatedUser));
          }
          // Remove session_id from URL to prevent reloading the page when the user returns from Stripe
          window.history.replaceState({}, '', '/');
        } catch (error) {
          console.error('Error checking session status:', error);
        } finally {
          setCheckingSession(false);
        }
      }
    };

    checkSession();
  }, [dispatch, checkingSession]);

  // Handle changing the subscription plan
  const handlePlanChange = async (plan: Plan) => {
    try {
      setLoading(plan.id);

      // If it's a free plan, just update the subscription directly
      if (plan.id === 'free') {
        await cancelSubscription();
        window.location.reload();
        return;
      }

      // For paid plans, create a checkout session
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { sessionId } = await createCheckoutSession(plan.priceId);
      
      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setLoading(null);
    }
  };

  // Handle canceling the subscription
  const handleCancelSubscription = async () => {
    try {
      setLoading('cancel');
      await cancelSubscription();
      window.location.reload();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setLoading(null);
    }
  };

  const getCurrentPlan = () => {
    if (!user?.stripeData?.planId) return null;
    return plans.find(plan => plan.priceId === user.stripeData?.planId);
  };

  const isCurrentPlan = (plan: Plan) => {
    return user?.stripeData?.planId === plan.priceId;
  };

  const isSubscriptionActive = () => {
    return user?.stripeData?.subscriptionStatus === 'active';
  };

  const getButtonLabel = (plan: Plan) => {
    if (isCurrentPlan(plan)) {
      return 'Current Plan';
    }
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return 'Select Plan';
    
    const currentPlanIndex = plans.findIndex(p => p.id === currentPlan.id);
    const newPlanIndex = plans.findIndex(p => p.id === plan.id);
    return newPlanIndex > currentPlanIndex ? 'Upgrade Plan' : 'Change Plan';
  };

  // Handle viewing billing history in Stripe portal
  const handleViewBillingHistory = async () => {
    try {
      const response = await api.post('/subscriptions/portal');
      // Open in new tab
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {checkingSession && (
        <div className="text-center text-white mb-4">
          Confirming your subscription...
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#1C1C1C] rounded-lg p-4 sm:p-6 flex flex-col ${
              isCurrentPlan(plan) ? 'ring-2 ring-[#CEF23F]' : ''
            }`}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{plan.name}</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
              ${plan.price}
              <span className="text-sm font-normal text-gray-400">/month</span>
            </p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm sm:text-base text-gray-300">
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 text-[#CEF23F] mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanChange(plan)}
              disabled={loading === plan.id || isCurrentPlan(plan)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isCurrentPlan(plan)
                  ? 'bg-[#3D3D3D] text-gray-300 cursor-not-allowed'
                  : 'bg-[#CEF23F] text-black hover:bg-opacity-90'
              }`}
            >
              {loading === plan.id ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                getButtonLabel(plan)
              )}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end text-sm text-gray-400">
        {isSubscriptionActive() && getCurrentPlan()?.id !== 'free' && (
          <p 
            className="cursor-pointer hover:text-red-500"
            onClick={handleCancelSubscription}
          >
            Cancel Subscription
          </p>
        )}
        <p 
          className={`cursor-pointer hover:text-blue-600 ${isSubscriptionActive() && getCurrentPlan()?.id !== 'free' ? 'ml-4' : ''}`}
          onClick={handleViewBillingHistory}
        >
          View Billing History
        </p>
      </div>
    </div>
  );
};

export default PlanSelector; 