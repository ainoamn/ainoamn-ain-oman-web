# /admin/notifications — دمج سريع
- القوالب واللوج مخزنة في:
  .data/notifications-templates.json
  .data/notifications-log.json
- لا حاجة لمفاتيح مزود الآن (إرسال اختباري محلي + سجل). لاحقًا يمكن ربط مزود فعلي.
- المسارات:
  GET/PUT  /api/admin/notifications/templates
  POST     /api/admin/notifications/send
  GET/DEL  /api/admin/notifications/log

تشغيل:
npm install
npm run dev
افتح /admin/notifications
