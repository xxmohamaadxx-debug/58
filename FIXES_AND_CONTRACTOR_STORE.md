# خطة إصلاح وإضافة متجر المقاولين

## المرحلة 1: إصلاحات أساسية

### 1. إصلاح تحذير DialogContent
- إضافة DialogDescription لكل Dialog component
- تحديث جميع ملفات Dialog في `src/components/`

### 2. إصلاح PDF العربي
- تحسين الخطوط العربية في PDF
- استخدام Cairo/Amiri fonts
- ضمان RTL صحيح

### 3. التحقق من UTF-8 و RTL
- التأكد من جميع الملفات تستخدم UTF-8
- التحقق من الخطوط العربية في CSS

## المرحلة 2: متجر المقاولين

### جداول قاعدة البيانات:
1. contractor_projects - المشاريع
2. project_items - بنود الكميات (BOQ)
3. material_deliveries - توريد المواد
4. client_price_lists - أسعار العملاء الخاصة
5. project_payments - مدفوعات المشاريع
6. units - الوحدات (كيلوجرام، متر، متر مربع، متر مكعب)

### الصفحات المطلوبة:
1. ContractorProjectsPage - إدارة المشاريع
2. ProjectItemsPage - بنود الكميات
3. MaterialDeliveriesPage - توريد المواد
4. ClientPricesPage - أسعار العملاء

### النماذج:
1. ProjectDialog - نموذج المشروع
2. ProjectItemDialog - نموذج بند الكمية
3. MaterialDeliveryDialog - نموذج توريد المواد
4. ClientPriceDialog - نموذج سعر العميل

