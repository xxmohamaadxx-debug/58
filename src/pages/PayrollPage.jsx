
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/lib/storage';
import PayrollDialog from '@/components/payroll/PayrollDialog';
import PayrollTable from '@/components/payroll/PayrollTable';

const PayrollPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    setPayrolls(storage.get('payroll', user.tenant_id));
    setEmployees(storage.get('employees', user.tenant_id));
  };

  const handleSave = (data) => {
    const newItem = { ...data, tenant_id: user.tenant_id };
    storage.add('payroll', newItem);
    toast({ title: 'Payroll generated successfully' });
    storage.log(user.tenant_id, user.id, 'GENERATE_PAYROLL', `Generated payroll for ${data.employeeName}`);
    loadData();
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this payroll record?')) {
      storage.delete('payroll', id);
      toast({ title: 'Record deleted' });
      loadData();
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('nav.payroll')} - Ibrahim Accounting System</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {t('nav.payroll')}
          </h1>
          <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <Plus className="h-4 w-4 mr-2" /> Generate Payroll
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <PayrollTable payrolls={payrolls} onDelete={handleDelete} />
        </div>

        <PayrollDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen} 
            employees={employees}
            onSave={handleSave} 
        />
      </div>
    </>
  );
};

export default PayrollPage;
