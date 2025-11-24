
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';

const AuditLogPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const allLogs = storage.get('auditLogs');
    // Filter logs for current tenant
    setLogs(allLogs.filter(l => l.tenant_id === user.tenant_id));
  }, [user]);

  return (
    <>
      <Helmet>
        <title>{t('nav.auditLog')} - Ibrahim Accounting System</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t('nav.auditLog')}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {logs.length === 0 ? (
             <div className="text-center text-gray-500">No activity recorded yet.</div>
          ) : (
              <div className="space-y-4">
                  {logs.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-4 border-b dark:border-gray-700 last:border-0">
                          <div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{log.action}</div>
                              <div className="text-sm text-gray-500">{log.details}</div>
                          </div>
                          <div className="text-sm text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuditLogPage;
