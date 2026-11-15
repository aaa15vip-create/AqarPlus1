# دليل بناء برنامج سطح المكتب لنظام Windows (EXE)

## البنية المعتمدة
- **Electron (`electron/main.cjs`)**: يفتح نافذة أصلية مع قفل النسخة الواحدة (`requestSingleInstanceLock`) وتخزين البيانات في `%APPDATA%/AqarPlus/data/`.
- **Embedded Express + SQLite WAL (`dist-server/server.mjs`)**: يعتمد على وحدة `node:sqlite` المدمجة في Node 22+ مع وضع `WAL` لضمان عدم تلف قاعدة البيانات عند انقطاع الكهرباء.
- **الواجهة (`./dist`)**: مبنية بمسارات نسبية (`base: './'`) لتعمل محلياً بشكل كامل دون إنترنت.

## متطلبات البناء لإصدار Windows (.exe)
- يجب تنفيذ التغليف النهائي عبر `electron-builder` على نظام **Windows** (أو عبر GitHub Actions runner `windows-latest`) مع تثبيت `electron` و `electron-builder`.

## أوامر البناء والتحقق
```bash
# 1. التحقق من الكود وبناء الواجهة والخادم المدمج (تم التحقق منه بنجاح محلياً)
npm run typecheck
npm run build:desktop

# 2. على جهاز Windows (بعد تثبيت electron و electron-builder):
npm install --save-dev electron electron-builder
npm run dist:win
```

تخرج حزم التثبيت داخل مجلد `release/`:
- `AqarPlus-<version>-x64.exe` (مثبّت NSIS كامل باللغتين العربية والإنجليزية)
- `AqarPlus-Portable-<version>-x64.exe` (نسخة محمولة بدون تثبيت)
