
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Store, Calendar, AlertTriangle, Phone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SUBSCRIPTION_PLANS, CONTACT_INFO } from '@/lib/constants';

const AdminPanel = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // New Store Form
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    password: '',
    plan: 'monthly'
  });

  useEffect(() => {
    if (user?.isSuperAdmin) fetchStores();
  }, [user]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          owner:public_users!owner_user_id(name, email)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error("Fetch stores error:", error);
      toast({ title: "Failed to load stores", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Auth User (This requires service_role usually, but for demo we use regular signup 
      // and assume admin has permission or we simulate it via function if Supabase configured)
      // NOTE: In client-side Supabase, admin cannot create other users without logging out.
      // Ideally, this should call a Supabase Edge Function.
      // For this implementation, we will simulate by instructing to use the registration page
      // or showing a message.
      
      toast({ 
        title: "System Limitation", 
        description: "To create a new store, please log out and use the Register page, or implement an Edge Function for Admin User Creation.",
        variant: "warning"
      });
      
      // Normally: 
      // await supabase.functions.invoke('admin-create-store', { body: formData })
      
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExtendSubscription = async (storeId, currentExpiry, planId) => {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    const current = new Date(currentExpiry || Date.now());
    const newExpiry = new Date(current.setDate(current.getDate() + plan.durationDays));
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ 
          subscription_expires_at: newExpiry.toISOString(),
          subscription_plan: planId,
          subscription_status: 'active'
        })
        .eq('id', storeId);

      if (error) throw error;
      toast({ title: "Subscription Extended!" });
      fetchStores();
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (!user?.isSuperAdmin) {
    return <div className="p-8 text-center text-red-500">Access Denied. Super Admin only.</div>;
  }

  return (
    <div className="space-y-6">
      <Helmet><title>Admin Panel - Ibrahim System</title></Helmet>
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Administration</h1>
            <p className="text-gray-500">Manage all stores and subscriptions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create New Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-purple-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Stores</h3>
            <p className="text-3xl font-bold text-purple-600">{stores.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-gray-500 text-sm font-medium">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-green-600">
                {stores.filter(s => s.subscription_status === 'active').length}
            </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-red-100">
            <h3 className="text-gray-500 text-sm font-medium">Expired</h3>
            <p className="text-3xl font-bold text-red-600">
                {stores.filter(s => s.subscription_status === 'expired').length}
            </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="p-4 font-semibold text-sm">Store Name</th>
                    <th className="p-4 font-semibold text-sm">Owner</th>
                    <th className="p-4 font-semibold text-sm">Plan</th>
                    <th className="p-4 font-semibold text-sm">Expires At</th>
                    <th className="p-4 font-semibold text-sm">Status</th>
                    <th className="p-4 font-semibold text-sm">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stores.map(store => (
                    <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="p-4 font-medium">{store.name}</td>
                        <td className="p-4 text-sm">
                            {store.owner ? (
                                <div>
                                    <div className="font-medium">{store.owner.name}</div>
                                    <div className="text-gray-500 text-xs">{store.owner.email}</div>
                                </div>
                            ) : <span className="text-gray-400">Unknown</span>}
                        </td>
                        <td className="p-4 text-sm capitalize">{store.subscription_plan}</td>
                        <td className="p-4 text-sm">
                            {store.subscription_expires_at ? new Date(store.subscription_expires_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                store.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {store.subscription_status}
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => handleExtendSubscription(store.id, store.subscription_expires_at, 'monthly')}
                                >
                                    +1 Mo
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => window.open(`${CONTACT_INFO.WHATSAPP_URL}?text=Hello ${store.name}, about your subscription...`, '_blank')}
                                >
                                    <Phone className="h-3 w-3" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>
                        Note: To ensure security, please register new stores via the public registration page, 
                        or implement a secure Edge Function for admin-side user creation.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(false)} className="w-full">Close</Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
