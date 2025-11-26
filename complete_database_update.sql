-- ============================================
-- ملف SQL شامل لتحديث قاعدة البيانات - جميع التحديثات
-- تاريخ التحديث: 2025
-- قم بتشغيل هذا الملف في Neon SQL Editor
-- ============================================

-- التحقق من وجود Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- القسم 1: تحديث جداول الواردات والصادرات (الفواتير)
-- ============================================

-- إضافة حقل partner_id للواردات
ALTER TABLE invoices_in
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- إضافة حقل partner_id للصادرات
ALTER TABLE invoices_out
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- إضافة حقل attachments للواردات (JSONB لحفظ روابط الملفات)
ALTER TABLE invoices_in
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- إضافة حقل attachments للصادرات
ALTER TABLE invoices_out
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- إضافة حقل invoice_number للواردات (رقم فاتورة تلقائي)
ALTER TABLE invoices_in
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- إضافة حقل invoice_number للصادرات
ALTER TABLE invoices_out
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_invoices_in_partner_id ON invoices_in(partner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_in_category ON invoices_in(category);
CREATE INDEX IF NOT EXISTS idx_invoices_in_currency ON invoices_in(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_in_date ON invoices_in(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_in_number ON invoices_in(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_out_partner_id ON invoices_out(partner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_out_category ON invoices_out(category);
CREATE INDEX IF NOT EXISTS idx_invoices_out_currency ON invoices_out(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_out_date ON invoices_out(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_out_number ON invoices_out(invoice_number);

-- ============================================
-- القسم 2: تحديث جدول المنتجات (inventory_items)
-- ============================================

-- التأكد من وجود جميع الحقول المطلوبة
ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS alert_sent BOOLEAN DEFAULT false;

-- إضافة فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_code ON inventory_items(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);

-- ============================================
-- القسم 3: إنشاء جدول حركات المخزون
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity NUMERIC(10, 2) NOT NULL,
    unit TEXT DEFAULT 'piece',
    related_invoice_id UUID,
    related_invoice_type TEXT CHECK (related_invoice_type IN ('invoice_in', 'invoice_out', NULL)),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس لحركات المخزون
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_tenant_id ON inventory_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_invoice ON inventory_transactions(related_invoice_id, related_invoice_type);

-- ============================================
-- القسم 4: إنشاء جدول إعدادات التنبيهات
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT NOT NULL DEFAULT 'low_stock',
    threshold_quantity NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_alert_sent TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_tenant_id ON inventory_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item_id ON inventory_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_active ON inventory_alerts(is_active) WHERE is_active = true;

-- ============================================
-- القسم 5: إنشاء جدول ملفات المرفقات
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    invoice_id UUID NOT NULL,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('invoice_in', 'invoice_out')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size NUMERIC(10, 2),
    file_type TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_attachments_tenant_id ON invoice_attachments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_attachments_invoice ON invoice_attachments(invoice_id, invoice_type);

-- ============================================
-- القسم 6: إنشاء Function لحساب المخزون الحالي
-- ============================================

CREATE OR REPLACE FUNCTION get_current_stock(inventory_item_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    base_quantity NUMERIC;
    total_in NUMERIC;
    total_out NUMERIC;
BEGIN
    SELECT COALESCE(quantity, 0) INTO base_quantity
    FROM inventory_items
    WHERE id = inventory_item_uuid;
    
    SELECT COALESCE(SUM(quantity), 0) INTO total_in
    FROM inventory_transactions
    WHERE inventory_item_id = inventory_item_uuid
    AND transaction_type IN ('in', 'adjustment')
    AND (transaction_type != 'adjustment' OR quantity > 0);
    
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO total_out
    FROM inventory_transactions
    WHERE inventory_item_id = inventory_item_uuid
    AND transaction_type IN ('out', 'adjustment')
    AND (transaction_type != 'adjustment' OR quantity < 0);
    
    RETURN base_quantity + total_in - total_out;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- القسم 7: إنشاء Trigger للتنبيه التلقائي عند انخفاض المخزون
-- ============================================

CREATE OR REPLACE FUNCTION check_inventory_low_stock()
RETURNS TRIGGER AS $$
DECLARE
    current_stock NUMERIC;
    min_stock_level NUMERIC;
    item_record RECORD;
BEGIN
    SELECT * INTO item_record
    FROM inventory_items
    WHERE id = NEW.inventory_item_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    current_stock := get_current_stock(NEW.inventory_item_id);
    min_stock_level := item_record.min_stock;
    
    IF current_stock <= min_stock_level AND NOT item_record.alert_sent THEN
        UPDATE inventory_items
        SET alert_sent = true
        WHERE id = NEW.inventory_item_id;
        
        INSERT INTO inventory_alerts (
            tenant_id,
            inventory_item_id,
            alert_type,
            threshold_quantity,
            last_alert_sent
        ) VALUES (
            item_record.tenant_id,
            item_record.id,
            'low_stock',
            min_stock_level,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_low_stock ON inventory_transactions;
CREATE TRIGGER trigger_check_low_stock
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION check_inventory_low_stock();

-- ============================================
-- القسم 8: إنشاء Function لإعادة تعيين حالة التنبيه
-- ============================================

CREATE OR REPLACE FUNCTION reset_alert_sent(inventory_item_uuid UUID)
RETURNS VOID AS $$
DECLARE
    current_stock NUMERIC;
    min_stock_level NUMERIC;
BEGIN
    current_stock := get_current_stock(inventory_item_uuid);
    
    SELECT min_stock INTO min_stock_level
    FROM inventory_items
    WHERE id = inventory_item_uuid;
    
    IF current_stock > min_stock_level THEN
        UPDATE inventory_items
        SET alert_sent = false
        WHERE id = inventory_item_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- القسم 9: تحديث جدول partners
-- ============================================

ALTER TABLE partners
ADD COLUMN IF NOT EXISTS tax_number TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- القسم 10: إنشاء View لتقارير الواردات والصادرات
-- ============================================

CREATE OR REPLACE VIEW invoices_summary_view AS
SELECT 
    'invoice_in' as invoice_type,
    i.id,
    i.tenant_id,
    i.amount,
    i.currency,
    i.description,
    i.date,
    i.category,
    i.status,
    i.invoice_number,
    p.name as partner_name,
    p.type as partner_type,
    i.created_at
FROM invoices_in i
LEFT JOIN partners p ON i.partner_id = p.id
UNION ALL
SELECT 
    'invoice_out' as invoice_type,
    o.id,
    o.tenant_id,
    o.amount,
    o.currency,
    o.description,
    o.date,
    o.category,
    o.status,
    o.invoice_number,
    p.name as partner_name,
    p.type as partner_type,
    o.created_at
FROM invoices_out o
LEFT JOIN partners p ON o.partner_id = p.id;

-- ============================================
-- القسم 11: نظام الإشعارات
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at);

-- ============================================
-- القسم 12: نظام الدعم والمراسلة
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    is_from_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    attachments JSONB,
    is_from_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant ON support_tickets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON support_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id, created_at);

-- ============================================
-- القسم 13: تحديث جدول users للصلاحيات المحسنة
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS can_be_edited_by_store_owner BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sound": true}'::jsonb;

-- ============================================
-- القسم 14: إنشاء جدول لتتبع قراءة الإشعارات
-- ============================================

CREATE TABLE IF NOT EXISTS notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(notification_id, user_id)
);

-- ============================================
-- القسم 15: دوال تحديث updated_at تلقائياً
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- القسم 16: دوال الإشعارات التلقائية
-- ============================================

CREATE OR REPLACE FUNCTION notify_new_support_ticket()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (tenant_id, user_id, type, title, message)
    SELECT 
        NULL,
        u.id,
        'support',
        'تذكرة دعم جديدة',
        'تم إنشاء تذكرة دعم جديدة: ' || NEW.subject
    FROM users u
    WHERE u.role = 'Super Admin' OR u.email = 'admin@ibrahim.com'
    LIMIT 10;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_notify_new_support_ticket ON support_tickets;
CREATE TRIGGER trigger_notify_new_support_ticket
    AFTER INSERT ON support_tickets
    FOR EACH ROW
    WHEN (NEW.is_from_admin = false)
    EXECUTE FUNCTION notify_new_support_ticket();

CREATE OR REPLACE FUNCTION notify_new_support_message()
RETURNS TRIGGER AS $$
DECLARE
    ticket_owner_id UUID;
    ticket_tenant_id UUID;
BEGIN
    SELECT user_id, tenant_id INTO ticket_owner_id, ticket_tenant_id
    FROM support_tickets
    WHERE id = NEW.ticket_id;
    
    IF NEW.is_from_admin THEN
        IF ticket_owner_id IS NOT NULL THEN
            INSERT INTO notifications (tenant_id, user_id, type, title, message)
            VALUES (
                ticket_tenant_id,
                ticket_owner_id,
                'support',
                'رد جديد على تذكرة الدعم',
                'تم إضافة رد جديد على تذكرتك: ' || substring(NEW.message from 1 for 50)
            );
        END IF;
    ELSE
        INSERT INTO notifications (tenant_id, user_id, type, title, message)
        SELECT 
            ticket_tenant_id,
            u.id,
            'support',
            'رد جديد على تذكرة الدعم',
            'تم إضافة رد جديد على التذكرة: ' || substring(NEW.message from 1 for 50)
        FROM users u
        WHERE (u.role = 'Super Admin' OR u.email = 'admin@ibrahim.com')
        LIMIT 10;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_notify_new_support_message ON support_messages;
CREATE TRIGGER trigger_notify_new_support_message
    AFTER INSERT ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_support_message();

-- ============================================
-- القسم 17: إنشاء Views مفيدة
-- ============================================

CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
    user_id,
    COUNT(*) as unread_count
FROM notifications
WHERE is_read = false
GROUP BY user_id;

-- ============================================
-- القسم 18: إضافة رقم فاتورة تلقائي
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_number(invoice_type TEXT, tenant_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    year_part TEXT;
    sequence_num INTEGER;
    invoice_num TEXT;
BEGIN
    -- البادئة حسب نوع الفاتورة
    IF invoice_type = 'in' THEN
        prefix := 'INV-IN';
    ELSE
        prefix := 'INV-OUT';
    END IF;
    
    -- السنة
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- رقم تسلسلي فريد
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_type = 'in' THEN 
                CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)
            ELSE 
                CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)
        END
    ), 0) + 1 INTO sequence_num
    FROM (
        SELECT invoice_number FROM invoices_in WHERE tenant_id = tenant_uuid
        UNION ALL
        SELECT invoice_number FROM invoices_out WHERE tenant_id = tenant_uuid
    ) all_invoices
    WHERE invoice_number IS NOT NULL
    AND invoice_number LIKE prefix || '-' || year_part || '%';
    
    -- إنشاء رقم الفاتورة
    invoice_num := prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger لإضافة رقم فاتورة تلقائياً عند الإنشاء
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number(
            CASE WHEN TG_TABLE_NAME = 'invoices_in' THEN 'in' ELSE 'out' END,
            NEW.tenant_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invoice_number_in ON invoices_in;
CREATE TRIGGER trigger_set_invoice_number_in
    BEFORE INSERT ON invoices_in
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

DROP TRIGGER IF EXISTS trigger_set_invoice_number_out ON invoices_out;
CREATE TRIGGER trigger_set_invoice_number_out
    BEFORE INSERT ON invoices_out
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- ============================================
-- القسم 19: إضافة تعليقات توضيحية
-- ============================================

COMMENT ON COLUMN users.can_be_edited_by_store_owner IS 'إذا كان true، يمكن لمدير المتجر تعديل بيانات هذا المستخدم حتى لو كان له صلاحيات';
COMMENT ON COLUMN invoices_in.partner_id IS 'رابط الفاتورة بالمورد/الشريك';
COMMENT ON COLUMN invoices_out.partner_id IS 'رابط الفاتورة بالعميل/الشريك';
COMMENT ON COLUMN invoices_in.attachments IS 'مرفقات الفاتورة كـ JSONB';
COMMENT ON COLUMN invoices_out.attachments IS 'مرفقات الفاتورة كـ JSONB';
COMMENT ON COLUMN invoices_in.invoice_number IS 'رقم فاتورة تلقائي فريد';
COMMENT ON COLUMN invoices_out.invoice_number IS 'رقم فاتورة تلقائي فريد';

-- ============================================
-- تأكيد نجاح التحديث
-- ============================================

SELECT 'تم تحديث قاعدة البيانات بنجاح! جميع الجداول والوظائف جاهزة.' as status;

