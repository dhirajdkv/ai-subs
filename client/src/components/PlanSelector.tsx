import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: string;
}

const PlanSelector = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    // TODO: Fetch plans and current subscription from API
    setLoading(false);
    setPlans([
      { id: '1', name: 'Free', price: 0, credits: 1000 },
      { id: '2', name: 'Pro', price: 49, credits: 10000 },
      { id: '3', name: 'Enterprise', price: 199, credits: 50000 },
    ]);
    // Simulated subscription data
    setSubscription({
      id: '123',
      planId: '1', // Free plan
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    });
  }, []);

  const handlePlanChange = async (planId: string) => {
    try {
      // TODO: Call API to change subscription
      setSubscription(prev => prev ? { ...prev, planId } : null);
    } catch (error) {
      console.error('Failed to change plan:', error);
    }
  };

  const getButtonLabel = (planId: string, currentPlanId: string) => {
    if (planId === currentPlanId) return 'Current Plan';

    // Plan hierarchy: Free (1) -> Pro (2) -> Enterprise (3)
    const planHierarchy = {
      '1': 1, // Free
      '2': 2, // Pro
      '3': 3  // Enterprise
    };

    const currentPlanLevel = planHierarchy[currentPlanId as keyof typeof planHierarchy];
    const targetPlanLevel = planHierarchy[planId as keyof typeof planHierarchy];

    if (currentPlanLevel < targetPlanLevel) {
      return 'Upgrade Plan';
    } else {
      return 'Change Plan';
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading plans...</div>;
  }

  return (
    <div>
      {subscription && (
        <div className="mb-6 p-4 bg-[#1C1C1C] rounded-lg">
          <h3 className="text-white font-medium mb-2">Current Subscription</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">
                Status: <span className="text-[#CEF23F]">{subscription.status}</span>
              </p>
              <p className="text-gray-400 text-sm">
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            {subscription.status === 'ACTIVE' && (
              <button 
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => {
                  // TODO: Handle cancellation
                  console.log('Cancel subscription');
                }}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-[#1C1C1C] p-6 rounded-lg border-2 transition-colors ${
              subscription?.planId === plan.id
                ? 'border-[#CEF23F]'
                : 'border-transparent hover:border-gray-600'
            }`}
          >
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-2xl font-bold text-white">
                ${plan.price}
              </span>
              <span className="text-gray-400">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="text-gray-300 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-[#CEF23F]"
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
                {plan.credits.toLocaleString()} credits/month
              </li>
            </ul>
            <button
              onClick={() => handlePlanChange(plan.id)}
              disabled={subscription?.planId === plan.id}
              className={`w-full py-2 rounded-lg transition-colors ${
                subscription?.planId === plan.id
                  ? 'bg-[#CEF23F] text-black cursor-default'
                  : 'bg-[#3D3D3D] text-white hover:bg-opacity-80'
              }`}
            >
              {subscription?.planId && getButtonLabel(plan.id, subscription.planId)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelector; 