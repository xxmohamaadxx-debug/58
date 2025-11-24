
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, FileText } from 'lucide-react';

const PayrollTable = ({ payrolls, onDelete }) => {
  if (payrolls.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No payroll records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold">Period</th>
            <th className="text-left py-3 px-4 text-sm font-semibold">Employee</th>
            <th className="text-left py-3 px-4 text-sm font-semibold">Base Salary</th>
            <th className="text-left py-3 px-4 text-sm font-semibold">Total</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {payrolls.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-3 px-4 text-sm">{item.period}</td>
              <td className="py-3 px-4 text-sm font-medium">{item.employeeName}</td>
              <td className="py-3 px-4 text-sm">{parseFloat(item.baseSalary).toLocaleString()} {item.currency}</td>
              <td className="py-3 px-4 text-sm font-bold text-green-600">
                {parseFloat(item.total).toLocaleString()} {item.currency}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollTable;
