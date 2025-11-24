
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, Lock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO, SUBSCRIPTION_PLANS } from '@/lib/constants';

const SubscriptionWarning = () => {
  const { tenant, user } = useAuth();
  const { t } = useLanguage();

  const handleWhatsAppRenew = () => {
    const planNames = {
      monthly: t('subscription.monthly'),
      '6months': t('subscription.sixMonths'),
      yearly: t('subscription.yearly')
    };
    const message = `مرحباً، أود تجديد اشتراك متجري "${tenant?.name || ''}" (المدة الحالية: ${planNames[tenant?.subscription_plan] || tenant?.subscription_plan}).`;
    const url = `${CONTACT_INFO.WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!tenant || user?.isSuperAdmin) return null;

  if (tenant.isExpired) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 z-50 shadow-lg animate-slide-up">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
                <Lock className="h-6 w-6" />
                <div>
                    <p className="font-bold">{t('subscription.expired')}</p>
                    <p className="text-sm text-red-100">{t('subscription.expiredMessage')}</p>
                </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleWhatsAppRenew}
                variant="secondary" 
                className="whitespace-nowrap bg-white text-red-600 hover:bg-red-50"
              >
                <MessageCircle className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                {t('subscription.renew')}
              </Button>
              <Link to="/subscription">
                <Button variant="secondary" className="whitespace-nowrap">{t('subscription.upgradeNow')}</Button>
              </Link>
            </div>
        </div>
      </div>
    );
  }

  if (tenant.daysRemaining <= 7 && tenant.daysRemaining > 0) {
    return (
      <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 ml-3 rtl:mr-3 rtl:ml-0 shrink-0" />
            <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                    {t('subscription.daysRemaining').replace('{days}', tenant.daysRemaining)}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                    {t('subscription.currentPlan')}: {tenant.subscription_plan}
                </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleWhatsAppRenew}
              size="sm" 
              variant="outline" 
              className="text-orange-600 border-orange-200 hover:bg-orange-100 bg-[#25D366] text-white border-[#25D366] hover:bg-[#128C7E]"
            >
              <MessageCircle className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              {t('subscription.renew')}
            </Button>
            <Link to="/subscription">
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-100">
                  {t('subscription.upgradeNow')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionWarning;
