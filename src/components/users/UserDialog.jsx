
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROLES } from '@/lib/constants';

const UserDialog = ({ open, onOpenChange, user, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.ENTRY,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: user.password || '',
        role: user.role || ROLES.ENTRY,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ROLES.ENTRY,
      });
    }
  }, [user, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? t('common.edit') : t('common.add')} {t('users.user')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 rtl:text-right">{t('common.name')}</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('common.name')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 rtl:text-right">{t('common.email')}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('common.email')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 rtl:text-right">{t('users.password')}</label>
            <input
              type="password"
              required={!user}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('users.password')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 rtl:text-right">{t('common.role')}</label>
            <select
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
                {Object.values(ROLES).map(role => (
                    <option key={role} value={role}>{t(`roles.${role.toLowerCase()}`) || role}</option>
                ))}
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
