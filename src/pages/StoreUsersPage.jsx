
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/button';
import { Plus, UserX, UserCheck, Edit, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ROLES } from '@/lib/constants';

const StoreUsersPage = () => {
  const { user, permissions } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Note: In a real app, creating users requires Auth API calls (Edge Function/Admin Client)
  // Here we simulate managing "Public Profiles" which link to Auth Users
  
  useEffect(() => {
    if (user?.tenant_id) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const data = await supabaseService.getUsers(user.tenant_id);
      setUsers(data || []);
    } catch (error) {
      toast({ title: "Error fetching users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!permissions.canEdit) {
        toast({ title: "Permission Denied", variant: "destructive" });
        return;
    }
    try {
        await supabaseService.updateUser(userId, { is_active: !currentStatus }, user.tenant_id);
        toast({ title: "User status updated" });
        fetchUsers();
    } catch (e) {
        toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (!user?.isStoreOwner && !user?.isSuperAdmin) {
      return <div className="p-8 text-center">Only Store Owners can manage users.</div>;
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Store Users</title></Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Team</h1>
        <Button onClick={() => toast({ title: "To add users, invite them or register new accounts", description: "Direct user creation requires Edge Functions in this demo environment." })} className="bg-orange-500 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Permissions</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map(u => (
                    <tr key={u.id}>
                        <td className="p-4">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="p-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                {u.role}
                            </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                            <div className="flex gap-2">
                                {u.can_delete_data && <span className="text-red-500" title="Can Delete">Del</span>}
                                {u.can_edit_data && <span className="text-orange-500" title="Can Edit">Edit</span>}
                                {u.can_create_users && <span className="text-green-500" title="Can Manage Users">Users</span>}
                            </div>
                        </td>
                        <td className="p-4">
                            {u.is_active ? (
                                <span className="flex items-center gap-1 text-green-600 text-sm"><UserCheck className="h-3 w-3"/> Active</span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-600 text-sm"><UserX className="h-3 w-3"/> Inactive</span>
                            )}
                        </td>
                        <td className="p-4 text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(u.id, u.is_active)}>
                                {u.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default StoreUsersPage;
