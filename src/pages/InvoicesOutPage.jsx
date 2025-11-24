
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Download } from 'lucide-react';
import InvoiceDialog from '@/components/invoices/InvoiceDialog';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import { toast } from '@/components/ui/use-toast';

const InvoicesOutPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [user]);

  const loadInvoices = () => {
    const stored = JSON.parse(localStorage.getItem('invoicesOut') || '[]');
    const filtered = stored.filter((inv) => inv.tenant_id === user.tenant_id);
    setInvoices(filtered);
  };

  const handleSave = (invoiceData) => {
    const stored = JSON.parse(localStorage.getItem('invoicesOut') || '[]');
    
    if (selectedInvoice) {
      const index = stored.findIndex((inv) => inv.id === selectedInvoice.id);
      if (index !== -1) {
        stored[index] = { ...stored[index], ...invoiceData };
      }
      toast({ title: 'Invoice updated successfully!' });
    } else {
      const newInvoice = {
        id: `inv_out_${Date.now()}`,
        tenant_id: user.tenant_id,
        created_by: user.id,
        created_at: new Date().toISOString(),
        status: 'Draft',
        ...invoiceData,
      };
      stored.push(newInvoice);
      toast({ title: 'Invoice created successfully!' });
    }

    localStorage.setItem('invoicesOut', JSON.stringify(stored));
    loadInvoices();
    setDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (user.role !== 'Store Owner') {
      toast({ title: 'Only store owner can delete invoices', variant: 'destructive' });
      return;
    }

    const stored = JSON.parse(localStorage.getItem('invoicesOut') || '[]');
    const filtered = stored.filter((inv) => inv.id !== id);
    localStorage.setItem('invoicesOut', JSON.stringify(filtered));
    loadInvoices();
    toast({ title: 'Invoice deleted successfully!' });
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.amount?.toString().includes(searchTerm)
  );

  return (
    <>
      <Helmet>
        <title>{t('nav.invoicesOut')} - Ibrahim Accounting System</title>
        <meta name="description" content="Manage outgoing invoices and expense tracking" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {t('nav.invoicesOut')}
          </h1>
          <Button
            onClick={() => {
              setSelectedInvoice(null);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add')}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <Button variant="outline" onClick={() => toast({ title: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀' })}>
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
            <Button variant="outline" onClick={() => toast({ title: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀' })}>
              <Download className="h-4 w-4 mr-2" />
              {t('common.export')}
            </Button>
          </div>

          <InvoiceTable
            invoices={filteredInvoices}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
        onSave={handleSave}
        type="out"
      />
    </>
  );
};

export default InvoicesOutPage;
