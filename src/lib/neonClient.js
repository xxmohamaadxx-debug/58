// عميل Neon للاتصال بقاعدة البيانات مباشرة من المتصفح
import { neon } from '@neondatabase/serverless';

const NEON_DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_TYtfnOlr2oW7@ep-holy-frog-ahulw0nk-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// إنشاء عميل Neon
export const getNeonClient = () => {
  return neon(NEON_DATABASE_URL);
};

// Helper للاستعلامات
export const sql = getNeonClient();

export default sql;
