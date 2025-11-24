
import { ROLES, INVOICE_STATUS, EMPLOYEE_STATUS } from './constants';

const STORAGE_KEYS = {
  TENANTS: 'tenants',
  USERS: 'users',
  INVOICES_IN: 'invoicesIn',
  INVOICES_OUT: 'invoicesOut',
  INVENTORY: 'inventory',
  EMPLOYEES: 'employees',
  PAYROLL: 'payroll',
  PARTNERS: 'partners',
  AUDIT_LOGS: 'auditLogs',
};

// Helper to generate ID
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initial Seed Data
const seedData = () => {
  if (localStorage.getItem(STORAGE_KEYS.TENANTS)) return;

  const tenantId = 'tenant_default';
  const userId = 'user_admin';

  const tenants = [{
    id: tenantId,
    name: 'Ibrahim Electronics',
    owner_user_id: userId,
    plan: 'annual',
    expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    created_at: new Date().toISOString(),
  }];

  const users = [{
    id: userId,
    tenant_id: tenantId,
    name: 'Ibrahim Admin',
    email: 'admin@ibrahim.com',
    password: 'admin', // Mock password
    role: ROLES.OWNER,
    locale: 'en',
    is_active: true,
    created_at: new Date().toISOString(),
  }, {
    id: 'user_accountant',
    tenant_id: tenantId,
    name: 'Sarah Accountant',
    email: 'sarah@ibrahim.com',
    password: 'user',
    role: ROLES.ACCOUNTANT,
    locale: 'en',
    is_active: true,
    created_at: new Date().toISOString(),
  }];

  const partners = [
    { id: 'p_1', tenant_id: tenantId, name: 'Tech Supplier Inc.', type: 'Vendor', phone: '555-0101', email: 'supply@tech.com', address: 'Istanbul, TR' },
    { id: 'p_2', tenant_id: tenantId, name: 'Local Market A.S.', type: 'Customer', phone: '555-0102', email: 'contact@local.com', address: 'Ankara, TR' },
  ];

  const inventory = [
    { id: 'inv_1', tenant_id: tenantId, sku: 'IPH-15', name: 'iPhone 15 Pro', unit: 'pcs', price: 45000, currency: 'TRY', minStock: 5, notes: 'High value' },
    { id: 'inv_2', tenant_id: tenantId, sku: 'SAM-S24', name: 'Samsung S24', unit: 'pcs', price: 1200, currency: 'USD', minStock: 3, notes: 'New arrival' },
  ];

  const employees = [
    { id: 'emp_1', tenant_id: tenantId, name: 'Ahmed Yilmaz', position: 'Sales Manager', salary: 25000, currency: 'TRY', status: EMPLOYEE_STATUS.ACTIVE, hireDate: '2023-01-15' },
    { id: 'emp_2', tenant_id: tenantId, name: 'Fatima Kaya', position: 'Accountant', salary: 800, currency: 'USD', status: EMPLOYEE_STATUS.ACTIVE, hireDate: '2023-03-01' },
  ];

  const invoicesIn = [
    { id: 'in_1', tenant_id: tenantId, amount: 5000, currency: 'USD', description: 'Initial Stock Purchase', date: '2023-10-01', partner_id: 'p_1', category: 'Inventory', status: INVOICE_STATUS.PAID },
  ];

  const invoicesOut = [
    { id: 'out_1', tenant_id: tenantId, amount: 1500, currency: 'TRY', description: 'Office Utilities', date: '2023-10-05', partner_id: null, category: 'Utilities', status: INVOICE_STATUS.PAID },
  ];

  localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  localStorage.setItem(STORAGE_KEYS.INVOICES_IN, JSON.stringify(invoicesIn));
  localStorage.setItem(STORAGE_KEYS.INVOICES_OUT, JSON.stringify(invoicesOut));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify([]));
};

// Data Access Layer
export const storage = {
  init: seedData,
  
  get: (key, tenantId) => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    if (tenantId) return data.filter(item => item.tenant_id === tenantId);
    return data;
  },

  add: (key, item) => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = { ...item, id: item.id || generateId(key) };
    data.push(newItem);
    localStorage.setItem(key, JSON.stringify(data));
    return newItem;
  },

  update: (key, id, updates) => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      localStorage.setItem(key, JSON.stringify(data));
      return data[index];
    }
    return null;
  },

  delete: (key, id) => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const newData = data.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(newData));
  },

  log: (tenantId, userId, action, details) => {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    logs.unshift({
      id: generateId('log'),
      tenant_id: tenantId,
      user_id: userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }
};
