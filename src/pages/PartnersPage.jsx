
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PartnerDialog from '@/components/partners/PartnerDialog';
import PartnerTable from '@/components/partners/PartnerTable';

const PartnersPage = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (user?.tenant_id) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const data = await supabaseService.getPartners(user.tenant_id);
      setPartners(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (selected) {
        await supabaseService.updatePartner(selected.id, data, user.tenant_id);
      } else {
        await supabaseService.createPartner(data, user.tenant_id);
      }
      setDialogOpen(false);
      loadData();
      toast({ title: "Partner saved" });
    } catch (e) {
      toast({ title: "Error saving partner", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete partner?")) return;
    try {
      await supabaseService.deletePartner(id, user.tenant_id);
      loadData();
    } catch(e) { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Partners</title></Helmet>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Partners</h1>
        <Button onClick={() => { setSelected(null); setDialogOpen(true); }} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Partner
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {loading ? <Loader2 className="animate-spin mx-auto"/> : 
          <PartnerTable partners={partners} onEdit={(p) => { setSelected(p); setDialogOpen(true); }} onDelete={handleDelete} />
        }
      </div>
      <PartnerDialog open={dialogOpen} onOpenChange={setDialogOpen} partner={selected} onSave={handleSave} />
    </div>
  );
};
export default PartnersPage;
