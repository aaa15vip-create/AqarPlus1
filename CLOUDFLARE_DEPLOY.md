# دليل نشر AqarPlus على Cloudflare Workers (مجاني + رابط ثابت)

## البنية المعتمدة
يستخدم التطبيق على Cloudflare Workers:
- **Static Assets (`./dist`)**: واجهة React + Tailwind + PWA Service Worker (`vite-plugin-pwa`) للعمل دون إنترنت.
- **Durable Object SQLite (`AqarWorkspaceDO`)**: قاعدة بيانات SQLite مدمجة داخل Durable Object (`new_sqlite_classes` في `wrangler.toml`) لحفظ العقارات، العقود، السندات، الجلسات، الاعتمادات، وسجل العمليات (`operations_log`).
- **WebSocket Hibernation API**: مزامنة لحظية متعددة الأجهزة دون استهلاك CPU عند السكون.
- **المصادقة والتشفير**: دوال WebCrypto القياسية (`PBKDF2-SHA256`، `HMAC-SHA256`، `AES-256-GCM`) بدون أي اعتماديات Node-only.

## حدود الباقة المجانية (Cloudflare Workers Free Tier)
- متاح على الباقة المجانية (Workers + Durable Objects SQLite) ضمن حصص الاستهلاك اليومية المجانية (100,000 طلب/يوم).
- تخزين الملفات الكبيرة في **Cloudflare R2** (10 GB مجانية شهرياً) يتطلب إضافة وسيلة دفع في لوحة Cloudflare Billing حتى بدون رسوم، ولذلك تم إبقاؤه اختيارياً ومعلقاً في `wrangler.toml`.

## خطوات النشر من جهازك أو عبر CI
```bash
# 1. تثبيت Wrangler وتسجيل الدخول بحساب Cloudflare
npm install --save-dev wrangler
npx wrangler login

# 2. ضبط أسرار البيئة الآمنة
npx wrangler secret put AQAR_SESSION_SECRET
# (اختياري لميزة OCR)
npx wrangler secret put GEMINI_API_KEY

# 3. تعطيل أزرار الدخول التجريبي السريع في الإنتاج الفعلي (تعديل wrangler.toml):
# AQAR_DEMO_LOGIN = "false"

# 4. بناء الواجهة والـ Worker والنشر على رابط *.workers.dev الثابت
npm run build
npm run build:worker
npx wrangler deploy
```

## التحقق المحلي قبل النشر
```bash
npm run typecheck
npm run typecheck:worker
npm run build
npm run build:worker
```
