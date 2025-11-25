// عميل Neon للاتصال بقاعدة البيانات مباشرة من المتصفح
import { neon } from '@neondatabase/serverless';

// الحصول على رابط الاتصال من متغيرات البيئة
const NEON_DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL;

// التحقق من وجود رابط الاتصال
if (!NEON_DATABASE_URL) {
  console.error('❌ خطأ: متغير البيئة VITE_NEON_DATABASE_URL غير موجود');
  console.error('يرجى إضافة رابط الاتصال في ملف .env');
  console.error('مثال: VITE_NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require');
  console.error('للحصول على رابط الاتصال الصحيح:');
  console.error('1. اذهب إلى https://console.neon.tech/');
  console.error('2. اختر مشروعك > Dashboard > Connection Details');
  console.error('3. اختر "Connection pooling" وانسخ الرابط');
}

// إنشاء عميل Neon
export const getNeonClient = () => {
  if (!NEON_DATABASE_URL) {
    const errorMsg = 'رابط اتصال قاعدة البيانات غير موجود. يرجى:\n' +
      '1. إنشاء ملف .env في جذر المشروع\n' +
      '2. إضافة VITE_NEON_DATABASE_URL برابط الاتصال من Neon Console\n' +
      '3. إعادة تشغيل الخادم\n' +
      'راجع ملف NEON_CONNECTION_SETUP.md للمزيد من التفاصيل';
    throw new Error(errorMsg);
  }
  
  // التحقق من تنسيق رابط الاتصال
  if (!NEON_DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️ تحذير: رابط الاتصال قد يكون غير صحيح. يجب أن يبدأ بـ postgresql://');
  }
  
  try {
    return neon(NEON_DATABASE_URL);
  } catch (error) {
    console.error('❌ خطأ في إنشاء عميل Neon:', error);
    throw new Error('فشل الاتصال بقاعدة البيانات. يرجى التحقق من رابط الاتصال.');
  }
};

// Helper للاستعلامات
let sqlClient = null;

try {
  if (NEON_DATABASE_URL) {
    sqlClient = getNeonClient();
  }
} catch (error) {
  console.error('❌ خطأ في تهيئة عميل Neon:', error);
}

export const sql = sqlClient;

export default sql;
