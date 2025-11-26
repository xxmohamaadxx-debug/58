-- ============================================
-- تحديث VAPID Keys للإشعارات الخارجية
-- ============================================
-- تم توليد هذه المفاتيح تلقائياً
-- تاريخ التوليد: 2025-11-26T16:25:31.640Z
-- ============================================

-- إضافة/تحديث VAPID Public Key
INSERT INTO system_settings (key, value, description, updated_by)
VALUES (
    'vapid_public_key',
    'BLTLp5pwZyDL8OCGuEv-occebm9Z7KB3UDS5KJ2VjBToYprIKMrtS2ZXob5uEArjkcECSGwKH8iWGWnpo8bTw9c',
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
    'hNoVtIuf9kOvXP5QmeWyu9bHMPQ9yCBY3Wn9V0CuQVE',
    'VAPID Private Key للإشعارات الخارجية - للخادم فقط - تم توليده تلقائياً',
    NULL
)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

SELECT 'تم تحديث VAPID Keys بنجاح!' AS result;
