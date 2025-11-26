-- ============================================
-- نظام إدارة متكامل لمتجر المقاولين ومواد البناء
-- ============================================
-- تاريخ الإنشاء: 2024
-- الوصف: نظام شامل يدعم إدارة المشاريع، بنود الكميات، توريد المواد، وأسعار العملاء الخاصة
-- ============================================

-- تفعيل الامتدادات المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- القسم 1: إضافة نوع متجر المقاولين
-- ============================================

INSERT INTO store_types (code, name_ar, name_en, name_tr, description_ar, features, sort_order) VALUES
('contractor', 'متجر مقاولين ومواد بناء', 'Contractor & Building Materials Store', 'Müteahhit ve İnşaat Malzemeleri', 
 'متجر خاص بالمقاولين ومواد البناء - يدعم إدارة المشاريع، بنود الكميات، توريد المواد، وأسعار العملاء الخاصة', 
 '{"project_management": true, "boq_support": true, "material_delivery": true, "client_pricing": true, "inventory_management": true, "invoicing": true}'::jsonb, 5)
ON CONFLICT (code) DO UPDATE SET 
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar,
    features = EXCLUDED.features,
    updated_at = NOW();

-- ============================================
-- القسم 2: الوحدات (Units)
-- ============================================

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL, -- 'kg', 'm', 'm2', 'm3', 'piece'
    name_ar TEXT NOT NULL,
    name_en TEXT,
    name_tr TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('weight', 'length', 'area', 'volume', 'general')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- إدراج الوحدات الافتراضية
INSERT INTO units (tenant_id, code, name_ar, name_en, category) 
SELECT 
    t.id,
    'kg',
    'كيلوجرام',
    'Kilogram',
    'weight'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM units u WHERE u.tenant_id = t.id AND u.code = 'kg'
)
ON CONFLICT DO NOTHING;

INSERT INTO units (tenant_id, code, name_ar, name_en, category) 
SELECT 
    t.id,
    'm',
    'متر',
    'Meter',
    'length'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM units u WHERE u.tenant_id = t.id AND u.code = 'm'
)
ON CONFLICT DO NOTHING;

INSERT INTO units (tenant_id, code, name_ar, name_en, category) 
SELECT 
    t.id,
    'm2',
    'متر مربع',
    'Square Meter',
    'area'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM units u WHERE u.tenant_id = t.id AND u.code = 'm2'
)
ON CONFLICT DO NOTHING;

INSERT INTO units (tenant_id, code, name_ar, name_en, category) 
SELECT 
    t.id,
    'm3',
    'متر مكعب',
    'Cubic Meter',
    'volume'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM units u WHERE u.tenant_id = t.id AND u.code = 'm3'
)
ON CONFLICT DO NOTHING;

INSERT INTO units (tenant_id, code, name_ar, name_en, category) 
SELECT 
    t.id,
    'piece',
    'قطعة',
    'Piece',
    'general'
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM units u WHERE u.tenant_id = t.id AND u.code = 'piece'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- القسم 3: المشاريع (Projects)
-- ============================================

CREATE TABLE IF NOT EXISTS contractor_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    project_code TEXT NOT NULL,
    project_name TEXT NOT NULL,
    client_id UUID REFERENCES partners(id) ON DELETE RESTRICT,
    client_name TEXT, -- اسم العميل (للنسخ الاحتياطية)
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_cost NUMERIC(15, 2) DEFAULT 0,
    actual_cost NUMERIC(15, 2) DEFAULT 0,
    contract_value NUMERIC(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'TRY',
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    project_type TEXT, -- نوع المشروع (بناء، ترميم، صيانة، إلخ)
    location TEXT, -- موقع المشروع
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(tenant_id, project_code)
);

CREATE INDEX IF NOT EXISTS idx_contractor_projects_tenant ON contractor_projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_projects_client ON contractor_projects(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_contractor_projects_dates ON contractor_projects(tenant_id, start_date, end_date);

-- ============================================
-- القسم 4: بنود الكميات (BOQ - Bill of Quantities)
-- ============================================

CREATE TABLE IF NOT EXISTS project_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES contractor_projects(id) ON DELETE CASCADE NOT NULL,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    quantity NUMERIC(15, 3) NOT NULL DEFAULT 0,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    unit_code TEXT, -- 'kg', 'm', 'm2', 'm3', 'piece'
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'TRY',
    item_category TEXT, -- فئة البند (حفريات، خرسانة، طوب، إلخ)
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(tenant_id, project_id);
CREATE INDEX IF NOT EXISTS idx_project_items_category ON project_items(tenant_id, item_category);

-- Trigger لحساب total_price تلقائياً
CREATE OR REPLACE FUNCTION calculate_project_item_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_price = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_project_item_total
BEFORE INSERT OR UPDATE ON project_items
FOR EACH ROW
EXECUTE FUNCTION calculate_project_item_total();

-- ============================================
-- القسم 5: توريد المواد (Material Deliveries)
-- ============================================

CREATE TABLE IF NOT EXISTS material_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES contractor_projects(id) ON DELETE CASCADE NOT NULL,
    project_item_id UUID REFERENCES project_items(id) ON DELETE RESTRICT, -- البند المرتبط (اختياري)
    delivery_date DATE NOT NULL,
    supplier_id UUID REFERENCES partners(id) ON DELETE RESTRICT,
    supplier_name TEXT, -- اسم المورد (للنسخ الاحتياطية)
    material_name TEXT NOT NULL,
    material_code TEXT,
    quantity NUMERIC(15, 3) NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    unit_code TEXT,
    unit_price NUMERIC(15, 2) NOT NULL,
    total_price NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    invoice_number TEXT,
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'partial', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'credit')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_material_deliveries_tenant ON material_deliveries(tenant_id, delivery_date DESC);
CREATE INDEX IF NOT EXISTS idx_material_deliveries_project ON material_deliveries(tenant_id, project_id);

-- Trigger لحساب total_price تلقائياً
CREATE TRIGGER trigger_calculate_delivery_total
BEFORE INSERT OR UPDATE ON material_deliveries
FOR EACH ROW
EXECUTE FUNCTION calculate_project_item_total();

-- ============================================
-- القسم 6: قوائم الأسعار وأسعار العملاء الخاصة
-- ============================================

CREATE TABLE IF NOT EXISTS price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    list_name TEXT NOT NULL,
    list_code TEXT NOT NULL,
    currency TEXT DEFAULT 'TRY',
    is_default BOOLEAN DEFAULT false,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(tenant_id, list_code)
);

CREATE TABLE IF NOT EXISTS price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    price_list_id UUID REFERENCES price_lists(id) ON DELETE CASCADE NOT NULL,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    unit_code TEXT,
    price NUMERIC(15, 2) NOT NULL,
    min_quantity NUMERIC(15, 3) DEFAULT 0, -- الحد الأدنى للكمية للحصول على هذا السعر
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_list_items_list ON price_list_items(tenant_id, price_list_id);
CREATE INDEX IF NOT EXISTS idx_price_list_items_product ON price_list_items(tenant_id, product_code);

-- جدول أسعار العملاء الخاصة
CREATE TABLE IF NOT EXISTS client_price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    unit_code TEXT,
    special_price NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(tenant_id, client_id, product_code)
);

CREATE INDEX IF NOT EXISTS idx_client_price_lists_client ON client_price_lists(tenant_id, client_id);
CREATE INDEX IF NOT EXISTS idx_client_price_lists_product ON client_price_lists(tenant_id, product_code);

-- ============================================
-- القسم 7: مدفوعات المشاريع
-- ============================================

CREATE TABLE IF NOT EXISTS project_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES contractor_projects(id) ON DELETE CASCADE NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'progress', 'final', 'retention')),
    payment_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'check', 'credit')),
    reference_number TEXT,
    description TEXT,
    invoice_id UUID, -- ربط بفاتورة إذا كانت موجودة
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_project_payments_tenant ON project_payments(tenant_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_project_payments_project ON project_payments(tenant_id, project_id);

-- ============================================
-- القسم 8: Views للإحصائيات والتقارير
-- ============================================

-- View لمشاريع نشطة مع ملخص التكاليف
CREATE OR REPLACE VIEW active_projects_summary AS
SELECT 
    cp.tenant_id,
    cp.id as project_id,
    cp.project_code,
    cp.project_name,
    cp.client_name,
    cp.contract_value,
    cp.estimated_cost,
    COALESCE(SUM(md.total_price), 0) as actual_cost,
    cp.contract_value - COALESCE(SUM(md.total_price), 0) as profit_loss,
    cp.currency,
    cp.status,
    cp.start_date,
    cp.end_date
FROM contractor_projects cp
LEFT JOIN material_deliveries md ON cp.id = md.project_id AND md.payment_status != 'cancelled'
WHERE cp.status IN ('planning', 'active', 'on_hold')
GROUP BY cp.tenant_id, cp.id, cp.project_code, cp.project_name, cp.client_name, 
         cp.contract_value, cp.estimated_cost, cp.currency, cp.status, cp.start_date, cp.end_date;

-- View لملخص بنود المشروع
CREATE OR REPLACE VIEW project_items_summary AS
SELECT 
    pi.tenant_id,
    pi.project_id,
    cp.project_code,
    cp.project_name,
    COUNT(*) as total_items,
    SUM(pi.quantity) as total_quantity,
    SUM(pi.total_price) as total_items_price,
    pi.currency
FROM project_items pi
JOIN contractor_projects cp ON pi.project_id = cp.id
GROUP BY pi.tenant_id, pi.project_id, cp.project_code, cp.project_name, pi.currency;

-- View لتوريدات المواد حسب المشروع
CREATE OR REPLACE VIEW material_deliveries_summary AS
SELECT 
    md.tenant_id,
    md.project_id,
    cp.project_code,
    cp.project_name,
    COUNT(*) as total_deliveries,
    SUM(md.quantity) as total_delivered_quantity,
    SUM(md.total_price) as total_delivery_cost,
    md.currency,
    md.delivery_status,
    md.payment_status
FROM material_deliveries md
JOIN contractor_projects cp ON md.project_id = cp.id
GROUP BY md.tenant_id, md.project_id, cp.project_code, cp.project_name, 
         md.currency, md.delivery_status, md.payment_status;

-- ============================================
-- القسم 9: Functions و Triggers
-- ============================================

-- Function لتحديث actual_cost للمشروع تلقائياً
CREATE OR REPLACE FUNCTION update_project_actual_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contractor_projects
    SET actual_cost = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM material_deliveries
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        AND payment_status != 'cancelled'
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_actual_cost
AFTER INSERT OR UPDATE OR DELETE ON material_deliveries
FOR EACH ROW
EXECUTE FUNCTION update_project_actual_cost();

-- Function لتحديث updated_at تلقائياً
CREATE TRIGGER update_contractor_projects_updated_at
BEFORE UPDATE ON contractor_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_items_updated_at
BEFORE UPDATE ON project_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_deliveries_updated_at
BEFORE UPDATE ON material_deliveries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_lists_updated_at
BEFORE UPDATE ON price_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_price_lists_updated_at
BEFORE UPDATE ON client_price_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- القسم 10: Indexes للأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_units_tenant ON units(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_contractor_projects_search ON contractor_projects(tenant_id, project_code, project_name) 
    USING gin(to_tsvector('arabic', project_code || ' ' || project_name || ' ' || COALESCE(client_name, '')));

-- ============================================
-- القسم 11: Comments
-- ============================================

COMMENT ON TABLE contractor_projects IS 'مشاريع المقاولين';
COMMENT ON TABLE project_items IS 'بنود الكميات (BOQ) للمشاريع';
COMMENT ON TABLE material_deliveries IS 'توريد المواد للمشاريع';
COMMENT ON TABLE price_lists IS 'قوائم الأسعار العامة';
COMMENT ON TABLE client_price_lists IS 'أسعار العملاء الخاصة';
COMMENT ON TABLE project_payments IS 'مدفوعات المشاريع';
COMMENT ON TABLE units IS 'الوحدات (كيلوجرام، متر، متر مربع، متر مكعب)';

-- ============================================
-- انتهاء التحديث
-- ============================================

SELECT 'تم إنشاء نظام إدارة متجر المقاولين ومواد البناء بنجاح!' as status;

