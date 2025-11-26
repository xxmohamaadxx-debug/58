# خطة الإصلاحات الشاملة - نظام إبراهيم للمحاسبة

## ✅ المرحلة 1: إصلاحات أساسية (قيد التنفيذ)

### 1.1 إصلاح تحذير DialogContent
**المشكلة:** `Warning: Missing Description or aria-describedby={undefined} for {DialogContent}`

**الحل:**
- إضافة `DialogDescription` لكل Dialog component
- الملفات المطلوبة (14 ملف):
  1. ✅ src/components/subscribers/SubscriberDialog.jsx
  2. src/components/store/StoreTypeDialog.jsx
  3. src/components/fuel/FuelTransactionDialog.jsx
  4. src/components/fuel/FuelTypeDialog.jsx
  5. src/components/internet/InternetUsageDialog.jsx
  6. src/components/customers/PaymentDialog.jsx
  7. src/components/customers/CustomerDialog.jsx
  8. src/components/invoices/InvoiceDialog.jsx
  9. src/components/inventory/InventoryDialog.jsx
  10. src/components/employees/EmployeeDialog.jsx
  11. src/components/users/UserDialog.jsx
  12. src/components/partners/PartnerDialog.jsx
  13. src/components/payroll/PayrollDialog.jsx
  14. src/pages/AdminPanel.jsx (Dialogs)

### 1.2 إصلاح PDF العربي
**المشكلة:** النصوص العربية مشوشة أو برموز غير مفهومة

**الحل:**
- إضافة خطوط عربية في `index.html` (Google Fonts: Amiri, Cairo, Noto Naskh Arabic)
- تحديث `pdfUtils.js` لاستخدام الخطوط العربية
- ضمان RTL صحيح في PDF

### 1.3 التحقق من UTF-8 و RTL
- ✅ `index.html` يستخدم `charset="UTF-8"`
- ✅ `dir="rtl"` مفعل
- إضافة الخطوط العربية

## ✅ المرحلة 2: متجر المقاولين (قيد التنفيذ)

### 2.1 SQL Script ✅
- ✅ `update_database_contractor_store.sql` - تم إنشاؤه

### 2.2 الصفحات المطلوبة:
1. ContractorProjectsPage - إدارة المشاريع
2. ProjectItemsPage - بنود الكميات (BOQ)
3. MaterialDeliveriesPage - توريد المواد
4. ClientPricesPage - أسعار العملاء الخاصة

### 2.3 النماذج:
1. ProjectDialog
2. ProjectItemDialog
3. MaterialDeliveryDialog
4. ClientPriceDialog

### 2.4 الخدمات (neonService):
- getUnits, createUnit, updateUnit, deleteUnit
- getContractorProjects, createContractorProject, updateContractorProject, deleteContractorProject
- getProjectItems, createProjectItem, updateProjectItem, deleteProjectItem
- getMaterialDeliveries, createMaterialDelivery, updateMaterialDelivery, deleteMaterialDelivery
- getClientPriceLists, createClientPriceList, updateClientPriceList, deleteClientPriceList
- getProjectPayments, createProjectPayment, updateProjectPayment, deleteProjectPayment

## ⚠️ المرحلة 3: عزل قاعدة البيانات

### 3.1 التحقق من عزل البيانات
- جميع الجداول تستخدم `tenant_id`
- جميع الاستعلامات تضمن `WHERE tenant_id = ?`
- الأدمن يمكنه تعديل حساب المتجر بالكامل

### 3.2 تحديث AdminPanel
- دعم تعديل نوع المتجر
- دعم تعديل بيانات المتجر كاملة

## 📋 قائمة الأولويات

1. ✅ إصلاح DialogContent warnings
2. ✅ إصلاح PDF العربي
3. ✅ إضافة متجر المقاولين (SQL)
4. ⏳ إضافة صفحات ونماذج متجر المقاولين
5. ⏳ التحقق من عزل البيانات

