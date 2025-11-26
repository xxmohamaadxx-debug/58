# دليل إعداد النشر التلقائي على Vercel و Netlify

## 📦 إعداد Netlify

### 1. ربط المستودع
1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اضغط "Add new site" > "Import an existing project"
3. اختر GitHub واختر المستودع: `xxmohamaadxx-debug/ibrahem-`
4. تأكد من الإعدادات:
   - **Branch to deploy**: `main`
   - **Build command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (اتركه فارغ)

### 2. إضافة متغيرات البيئة
1. في Netlify Dashboard: Site settings > Environment variables
2. أضف:
   ```
   Key: VITE_NEON_DATABASE_URL
   Value: postgresql://neondb_owner:npg_TYtfnOlr2oW7@ep-holy-frog-ahulw0nk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   ✅ **Variable is shown**: يمكنك تفعيلها إذا أردت

### 3. إعدادات البناء المتقدمة
الملف `netlify.toml` موجود ويحتوي على جميع الإعدادات:
- Node.js 18
- Legacy peer deps
- Headers للتحسينات
- Redirects للـ SPA

### 4. نشر تلقائي
بعد ربط المستودع، أي push إلى `main` سيحدث نشر تلقائي!

---

## 🚀 إعداد Vercel

### 1. ربط المستودع
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط "Add New Project"
3. اختر المستودع: `xxmohamaadxx-debug/ibrahem-`
4. Vercel سيكتشف الإعدادات تلقائياً من `vercel.json`

### 2. إضافة متغيرات البيئة
1. في Vercel Dashboard: Settings > Environment Variables
2. أضف:
   ```
   Name: VITE_NEON_DATABASE_URL
   Value: postgresql://neondb_owner:npg_TYtfnOlr2oW7@ep-holy-frog-ahulw0nk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   ✅ **Environment**: Production, Preview, Development

### 3. الإعدادات التلقائية
الملف `vercel.json` موجود ويحتوي على:
- Build command
- Output directory
- Headers للتحسينات
- Rewrites للـ SPA

### 4. نشر تلقائي
بعد ربط المستودع، أي push إلى `main` سيحدث نشر تلقائي!

---

## ✅ التحقق من النشر

### بعد النشر الأول:

1. **تحقق من URL**
   - Netlify: `https://your-site.netlify.app`
   - Vercel: `https://your-site.vercel.app`

2. **اختبر التطبيق**
   - سجل دخول بحساب المدير
   - تحقق من جميع الأقسام
   - تأكد من الاتصال بقاعدة البيانات

3. **تحقق من Environment Variables**
   - تأكد من وجود `VITE_NEON_DATABASE_URL`
   - تأكد من أن القيمة صحيحة

---

## 🔧 استكشاف الأخطاء

### مشكلة: Build Failed

**الحل:**
1. تحقق من Build Logs في Netlify/Vercel
2. تأكد من أن `package.json` محدث
3. تأكد من وجود `node_modules` في `.gitignore`

### مشكلة: تطبيق لا يعمل

**الحل:**
1. تحقق من Console في المتصفح
2. تأكد من Environment Variables
3. تحقق من اتصال قاعدة البيانات

### مشكلة: Deploy logs unavailable

**الحل:**
1. انتظر 5-10 دقائق (مشكلة مؤقتة)
2. جرب Clear Build Cache
3. قم بنشر يدوي جديد

---

## 📝 ملاحظات مهمة

1. **لا تحذف `netlify.toml` أو `vercel.json`**
2. **تأكد من رفع `.npmrc`** (يحتوي على legacy-peer-deps)
3. **تأكد من أن `.env` في `.gitignore`**
4. **Environment Variables يجب إضافتها يدوياً** في Netlify/Vercel Dashboard

---

## 🔄 التحديثات التلقائية

بعد إعداد النشر:
- ✅ أي push إلى `main` = نشر تلقائي
- ✅ Pull Requests = Preview Deployments (Vercel فقط)
- ✅ الإشعارات تصل بريدياً (يمكن تفعيلها)

---

## 📞 الدعم

للمساعدة:
- راجع ملفات التوثيق في المشروع
- استخدم نظام Support Tickets في التطبيق

