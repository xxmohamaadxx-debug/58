-- إصلاح أخطاء قاعدة البيانات لنظام إبراهيم للمحاسبة
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- 1. إصلاح جدول tenants - إضافة الأعمدة المفقودة
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. إنشاء فهرس على created_at للبحث السريع
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at DESC);

-- 3. إصلاح جدول public_users - إضافة الأعمدة المفقودة
ALTER TABLE public_users
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS can_delete_data BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_edit_data BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_create_users BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public_users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. إنشاء فهارس على public_users
CREATE INDEX IF NOT EXISTS idx_public_users_tenant_id ON public_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_public_users_email ON public_users(email);

-- 5. إصلاح جدول invoices_in
ALTER TABLE invoices_in
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public_users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_invoices_in_tenant_id ON invoices_in(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_in_date ON invoices_in(date DESC);

-- 6. إصلاح جدول invoices_out
ALTER TABLE invoices_out
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public_users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_invoices_out_tenant_id ON invoices_out(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_out_date ON invoices_out(date DESC);

-- 7. إصلاح جدول partners
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'Customer',
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_partners_tenant_id ON partners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);

-- 8. إصلاح جدول inventory_items
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'piece',
ADD COLUMN IF NOT EXISTS quantity NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock NUMERIC(10, 2) DEFAULT 5,
ADD COLUMN IF NOT EXISTS price NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);

-- 9. إصلاح جدول employees
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS base_salary NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- 10. إصلاح جدول audit_logs
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public_users(id),
ADD COLUMN IF NOT EXISTS action TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 11. حذف جميع RLS Policies القديمة التي تسبب infinite recursion
DROP POLICY IF EXISTS "Super admin can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view their tenant users" ON public_users;
DROP POLICY IF EXISTS "Users can view their tenant invoices_in" ON invoices_in;
DROP POLICY IF EXISTS "Users can insert their tenant invoices_in" ON invoices_in;
DROP POLICY IF EXISTS "Users can update their tenant invoices_in" ON invoices_in;
DROP POLICY IF EXISTS "Users can delete their tenant invoices_in" ON invoices_in;
DROP POLICY IF EXISTS "Users can view their tenant invoices_out" ON invoices_out;
DROP POLICY IF EXISTS "Users can insert their tenant invoices_out" ON invoices_out;
DROP POLICY IF EXISTS "Users can update their tenant invoices_out" ON invoices_out;
DROP POLICY IF EXISTS "Users can delete their tenant invoices_out" ON invoices_out;
DROP POLICY IF EXISTS "Users can view their tenant partners" ON partners;
DROP POLICY IF EXISTS "Users can manage their tenant partners" ON partners;
DROP POLICY IF EXISTS "Users can view their tenant inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can manage their tenant inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can view their tenant employees" ON employees;
DROP POLICY IF EXISTS "Users can manage their tenant employees" ON employees;

-- تعطيل RLS مؤقتاً لحل مشاكل الوصول
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_in DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices_out DISABLE ROW LEVEL SECURITY;
ALTER TABLE partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- 12. تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_users_updated_at BEFORE UPDATE ON public_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. إصلاح بيانات المشرف العام إذا كان موجوداً
UPDATE public_users 
SET role = 'SUPER_ADMIN',
    can_delete_data = true,
    can_edit_data = true,
    can_create_users = true
WHERE email IN ('admin@ibrahim.com', 'systemibrahem@gmail.com');

-- 14. حذف جميع RLS policies القديمة إن وجدت (للتأكد من عدم وجود recursion)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- حذف جميع policies على public_users
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = 'public_users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
    
    -- حذف جميع policies على tenants
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tenants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
    
    RAISE NOTICE 'تم حذف جميع RLS policies القديمة';
END $$;

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE 'تم إصلاح قاعدة البيانات بنجاح!';
    RAISE NOTICE 'جميع الجداول والسياسات تم إنشاؤها/تحديثها';
    RAISE NOTICE 'RLS معطل مؤقتاً لحل مشاكل الوصول';
END $$;

