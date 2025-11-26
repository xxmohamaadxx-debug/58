import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { neonService } from '@/lib/neonService';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Search, Edit, Trash2, Building2, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDateAR, formatDateShort } from '@/lib/dateUtils';
import { CURRENCIES } from '@/lib/constants';
import ContractorProjectDialog from '@/components/contractor/ContractorProjectDialog';

const ContractorProjectsPage = () => {
  const { user, tenant } = useAuth();
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.tenant_id) {
      loadProjects();
      loadPartners();
    }
  }, [user]);

  const loadPartners = async () => {
    try {
      const data = await neonService.getPartners(user.tenant_id);
      setPartners(data || []);
    } catch (error) {
      console.error('Load partners error:', error);
    }
  };

  const loadProjects = async () => {
    if (!user?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await filterStatus !== 'all'
        ? await neonService.getContractorProjects(user.tenant_id, filterStatus)
        : await neonService.getContractorProjects(user.tenant_id);
      setProjects(data || []);
    } catch (error) {
      console.error('Load projects error:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المشاريع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenant_id) loadProjects();
  }, [filterStatus]);

  const handleAdd = () => {
    setSelectedProject(null);
    setDialogOpen(true);
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleSave = async (data) => {
    if (!user?.tenant_id) return;

    try {
      if (selectedProject) {
        await neonService.updateContractorProject(selectedProject.id, { ...data, updated_by: user.id }, user.tenant_id);
        toast({ title: 'تم تحديث المشروع بنجاح' });
      } else {
        await neonService.createContractorProject({ ...data, created_by: user.id }, user.tenant_id);
        toast({ title: 'تم إضافة المشروع بنجاح' });
      }
      setDialogOpen(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Save project error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل حفظ المشروع',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع البيانات المرتبطة به.')) return;

    try {
      await neonService.deleteContractorProject(id, user.tenant_id);
      toast({ title: 'تم حذف المشروع بنجاح' });
      loadProjects();
    } catch (error) {
      console.error('Delete project error:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حذف المشروع',
        variant: 'destructive'
      });
    }
  };

  const filteredProjects = projects.filter(proj => {
    if (searchTerm && !proj.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !proj.project_code?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !proj.client_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const totalValue = projects.reduce((sum, p) => sum + parseFloat(p.contract_value || 0), 0);

  return (
    <div className="space-y-6">
      <Helmet><title>مشاريع المقاولين - {t('common.systemName')}</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            مشاريع المقاولين
          </h1>
        </div>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white w-full sm:w-auto">
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> إضافة مشروع
        </Button>
      </div>

      {/* الملخص */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المشاريع</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {projects.length}
              </p>
            </div>
            <Building2 className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">مشاريع نشطة</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {activeCount}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي قيمة العقود</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {totalValue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Wallet className="h-10 w-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* الفلترة */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن مشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">الكل</option>
            <option value="planning">قيد التخطيط</option>
            <option value="active">نشط</option>
            <option value="on_hold">متوقف</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">كود المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">اسم المشروع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">تاريخ البداية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">تاريخ النهاية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">قيمة العقد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    لا توجد مشاريع
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const currencyInfo = CURRENCIES[project.currency] || { symbol: project.currency || 'TRY' };
                  const statusColors = {
                    planning: 'text-yellow-600 bg-yellow-50',
                    active: 'text-green-600 bg-green-50',
                    on_hold: 'text-orange-600 bg-orange-50',
                    completed: 'text-blue-600 bg-blue-50',
                    cancelled: 'text-red-600 bg-red-50'
                  };
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {project.project_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {project.project_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {project.client_name || project.client_name_display || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {project.start_date ? formatDateShort(project.start_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {project.end_date ? formatDateShort(project.end_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {currencyInfo.symbol} {parseFloat(project.contract_value || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[project.status] || 'text-gray-600 bg-gray-50'}`}>
                          {project.status === 'planning' ? 'قيد التخطيط' :
                           project.status === 'active' ? 'نشط' :
                           project.status === 'on_hold' ? 'متوقف' :
                           project.status === 'completed' ? 'مكتمل' : 'ملغي'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(project)}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(project.id)}
                            title="حذف"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContractorProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
        partners={partners}
        onSave={handleSave}
      />
    </div>
  );
};

export default ContractorProjectsPage;

