// Script to generate VAPID keys for Push Notifications
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔑 توليد VAPID Keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ تم توليد المفاتيح بنجاح!\n');
console.log('='.repeat(60));
console.log('Public Key (المفتاح العام):');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key (المفتاح الخاص):');
console.log(vapidKeys.privateKey);
console.log('='.repeat(60));

const keysFile = path.join(__dirname, '..', 'vapid-keys.json');
fs.writeFileSync(keysFile, JSON.stringify(vapidKeys, null, 2));

console.log(`\n💾 تم حفظ المفاتيح في: ${keysFile}`);
console.log('\n⚠️  تحذير: لا تشارك Private Key مع أي شخص!');

// إنشاء ملف SQL للتحديث
const sqlFile = path.join(__dirname, '..', 'update_vapid_keys.sql');
const sqlContent = `-- ============================================
-- تحديث VAPID Keys للإشعارات الخارجية
-- ============================================
-- تم توليد هذه المفاتيح تلقائياً
-- تاريخ التوليد: ${new Date().toISOString()}
-- ============================================

-- إضافة/تحديث VAPID Public Key
INSERT INTO system_settings (key, value, description, updated_by)
VALUES (
    'vapid_public_key',
    '${vapidKeys.publicKey}',
    'VAPID Public Key للإشعارات الخارجية - تم توليده تلقائياً',
    NULL
)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- إضافة/تحديث VAPID Private Key
INSERT INTO system_settings (key, value, description, updated_by)
VALUES (
    'vapid_private_key',
    '${vapidKeys.privateKey}',
    'VAPID Private Key للإشعارات الخارجية - للخادم فقط - تم توليده تلقائياً',
    NULL
)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

SELECT 'تم تحديث VAPID Keys بنجاح!' AS result;
`;

fs.writeFileSync(sqlFile, sqlContent);
console.log(`\n📄 تم إنشاء ملف SQL: ${sqlFile}`);
console.log('\n✅ اكتمل! يمكنك الآن تطبيق ملف SQL على قاعدة البيانات.');

