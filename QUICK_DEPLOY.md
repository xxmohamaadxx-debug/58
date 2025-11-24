# نشر سريع على Vercel (5 دقائق) ⚡

## الخطوات السريعة:

### 1. رفع المشروع على GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. النشر على Vercel

1. اذهب إلى: https://vercel.com/new
2. سجل بحساب GitHub
3. اضغط "Import Project"
4. اختر المستودع الخاص بك
5. اضغط "Deploy" (لا حاجة لتغيير أي إعدادات)
6. انتظر دقيقتين...

### 3. النتيجة ✨
ستحصل على رابط مثل: `https://your-app.vercel.app`

**كل مرة تدفع كود جديد، سيتم التحديث تلقائياً!**

---

## إعداد Supabase

1. اذهب إلى Supabase Dashboard: https://app.supabase.com
2. Settings → API
3. أضف الدومين الجديد في:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

---

## ✅ تم!

تطبيقك الآن متاح على الإنترنت مجاناً بالكامل! 🎉

