
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
      const invIn = storage.get('invoicesIn', user.tenant_id);
      const invOut = storage.get('invoicesOut', user.tenant_id);

      const income = { TRY: 0, USD: 0 };
      const expense = { TRY: 0, USD: 0 };

      invIn.forEach(i => { if(income[i.currency] !== undefined) income[i.currency] += parseFloat(i.amount) });
      invOut.forEach(i => { if(expense[i.currency] !== undefined) expense[i.currency] += parseFloat(i.amount) });

      setFinancialData({ income, expense });
  }, [user]);

  const data = {
    labels: ['Income (TRY)', 'Expense (TRY)', 'Income (USD)', 'Expense (USD)'],
    datasets: [
      {
        label: 'Amount',
        data: financialData ? [financialData.income.TRY, financialData.expense.TRY, financialData.income.USD, financialData.expense.USD] : [],
        backgroundColor: [
            'rgba(34, 197, 94, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(34, 197, 94, 0.6)',
            'rgba(239, 68, 68, 0.6)',
        ],
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{t('nav.reports')} - Ibrahim Accounting System</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t('nav.reports')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
                {financialData && <Bar data={data} />}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Summary Text</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    This report aggregates all financial data from Invoices In and Invoices Out modules.
                    Currently, the system tracks multi-currency transactions primarily in TRY and USD.
                </p>
                <div className="mt-4">
                    <h3 className="font-bold">Net Balance:</h3>
                    <ul className="list-disc pl-5 mt-2">
                        <li>TRY: {financialData ? (financialData.income.TRY - financialData.expense.TRY).toFixed(2) : 0}</li>
                        <li>USD: {financialData ? (financialData.income.USD - financialData.expense.USD).toFixed(2) : 0}</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;
