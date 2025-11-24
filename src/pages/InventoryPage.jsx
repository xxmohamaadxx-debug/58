
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import InventoryDialog from '@/components/inventory/InventoryDialog';
import InventoryTable from '@/components/inventory/InventoryTable';

const InventoryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (user?.tenant_id) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await supabaseService.getInventory(user.tenant_id);
      setItems(data || []);
    } catch (e) {
      toast({ title: "Failed to load inventory", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedItem) {
        await supabaseService.updateInventory(selectedItem.id, data, user.tenant_id);
        toast({ title: "Item updated" });
      } else {
        await supabaseService.createInventory(data, user.tenant_id);
        toast({ title: "Item created" });
      }
      setDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (e) {
      toast({ title: "Operation failed", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await supabaseService.deleteInventory(id, user.tenant_id);
      toast({ title: "Item deleted" });
      loadData();
    } catch(e) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Inventory</title></Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Inventory</h1>
        <Button onClick={() => { setSelectedItem(null); setDialogOpen(true); }} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {loading ? <Loader2 className="animate-spin mx-auto" /> : 
          <InventoryTable items={items} onEdit={(i) => { setSelectedItem(i); setDialogOpen(true); }} onDelete={handleDelete} />
        }
      </div>

      <InventoryDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} onSave={handleSave} />
    </div>
  );
};

export default InventoryPage;
