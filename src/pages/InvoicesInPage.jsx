
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InvoicesInPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.tenant_id) loadInvoices();
  }, [user]);

  const loadInvoices = async () => {
    try {
      const data = await supabaseService.getInvoicesIn(user.tenant_id);
      setInvoices(data || []);
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      await supabaseService.createInvoiceIn({
        amount: 100,
        currency: 'USD',
        description: 'Test Expense',
        date: new Date().toISOString(),
        status: 'Paid'
      }, user.tenant_id);
      toast({ title: t('common.success') });
      loadInvoices();
    } catch (error) {
      toast({ title: t('common.error'), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Helmet><title>{t('common.invoicesIn')}</title></Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('common.invoicesIn')}</h1>
        <Button onClick={handleCreateTest} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white w-full sm:w-auto">
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t('common.add')}
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? <Loader2 className="animate-spin mx-auto" /> : (
          invoices.length === 0 ? <p className="text-center text-gray-500">{t('common.noData')}</p> : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {invoices.map(inv => (
                  <div key={inv.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">{new Date(inv.date).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{inv.status}</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{inv.description}</p>
                    <div className="text-lg font-bold text-red-500 text-right">{inv.amount} {inv.currency}</div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-x-auto">
                <table className="w-full text-left rtl:text-right">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="p-4 text-sm font-semibold">{t('common.date')}</th>
                      <th className="p-4 text-sm font-semibold">{t('common.description')}</th>
                      <th className="p-4 text-sm font-semibold">{t('common.amount')}</th>
                      <th className="p-4 text-sm font-semibold">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="p-4 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="p-4 text-sm">{inv.description}</td>
                        <td className="p-4 text-sm font-bold text-red-500">{inv.amount} {inv.currency}</td>
                        <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700">{inv.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default React.memo(InvoicesInPage);
