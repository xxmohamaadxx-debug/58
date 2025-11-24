
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const PartnerTable = ({ partners, onEdit, onDelete }) => {
  const { t } = useLanguage();

  if (partners.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No partners found. Add a customer or vendor.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Contact</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Address</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {partners.map((partner) => (
            <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {partner.name}
              </td>
              <td className="py-3 px-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  partner.type === 'Customer' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {partner.type}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex flex-col gap-1">
                  {partner.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {partner.phone}
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {partner.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                {partner.address}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(partner)}>
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(partner.id)}>
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

export default PartnerTable;
