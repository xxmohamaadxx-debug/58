
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User as UserIcon } from 'lucide-react';

const UserTable = ({ users, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
            <th className="text-left py-3 px-4 text-sm font-semibold">Role</th>
            <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
            <th className="text-right py-3 px-4 text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-3 px-4 text-sm font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                </div>
                {user.name}
              </td>
              <td className="py-3 px-4 text-sm">{user.role}</td>
              <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(user.id)}>
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

export default UserTable;
