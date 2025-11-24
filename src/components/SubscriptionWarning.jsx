
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SubscriptionWarning = () => {
  const { tenant, user } = useAuth();

  if (!tenant || user?.isSuperAdmin) return null;

  if (tenant.isExpired) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Lock className="h-6 w-6" />
                <div>
                    <p className="font-bold">Subscription Expired</p>
                    <p className="text-sm text-red-100">Your store access is read-only. Please renew to continue.</p>
                </div>
            </div>
            <Link to="/subscription">
                <Button variant="secondary" className="whitespace-nowrap">Renew Now</Button>
            </Link>
        </div>
      </div>
    );
  }

  if (tenant.daysRemaining <= 7 && tenant.daysRemaining > 0) {
    return (
      <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
            <div>
                <p className="text-sm text-orange-700 font-medium">
                    Subscription expiring in {tenant.daysRemaining} days
                </p>
                <p className="text-xs text-orange-600">
                    Plan: {tenant.subscription_plan}
                </p>
            </div>
          </div>
          <Link to="/subscription">
            <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-100">
                Upgrade / Renew
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionWarning;
