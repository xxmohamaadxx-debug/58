
import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle, CreditCard } from 'lucide-react';
import { SUBSCRIPTION_PLANS, CONTACT_INFO } from '@/lib/constants';

const SubscriptionPage = () => {
  const { tenant, user } = useAuth();

  const handleContact = (plan) => {
    const message = `Hello, I would like to upgrade my store "${tenant?.name}" (ID: ${tenant?.id}) to the ${plan.name} ($${plan.price}).`;
    const url = `${CONTACT_INFO.WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 pb-20">
      <Helmet><title>Subscription Plans</title></Helmet>

      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-500">Choose the plan that fits your business needs. Contact us via WhatsApp to activate instantly.</p>
      </div>

      {tenant && (
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold opacity-90">Current Plan</h3>
                <p className="text-2xl font-bold capitalize">{tenant.subscription_plan} Plan</p>
                <p className="text-sm opacity-80 mt-1">
                    Status: {tenant.subscription_status} • Expires: {new Date(tenant.subscription_expires_at).toLocaleDateString()}
                </p>
            </div>
            <div className="mt-4 md:mt-0">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${tenant.isExpired ? 'bg-red-500 text-white' : 'bg-white text-orange-600'}`}>
                    {tenant.isExpired ? 'EXPIRED' : 'ACTIVE'}
                </span>
            </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative hover:scale-105 transition-transform duration-300">
                {plan.id === 'yearly' && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        BEST VALUE
                    </div>
                )}
                <div className="p-8">
                    <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wide">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                        <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                        <span className="ml-1 text-xl font-semibold text-gray-500">/{plan.id === 'monthly' ? 'mo' : 'term'}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Full access for {plan.durationDays} days
                    </p>

                    <ul className="mt-6 space-y-4">
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Unlimited Invoices</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Inventory Management</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Multi-User Access</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Priority Support</span>
                        </li>
                    </ul>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-750">
                    <Button 
                        onClick={() => handleContact(plan)} 
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 h-auto"
                    >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Upgrade via WhatsApp
                    </Button>
                    <p className="text-xs text-center mt-4 text-gray-400">
                        Instant activation upon payment confirmation
                    </p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPage;
