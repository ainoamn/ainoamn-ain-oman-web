# tools/drive-sync/pull-from-drive.ps1
# يسحب (ينزّل) مشروعك من Google Drive إلى C:\dev\ain-oman-web
# يحدّث النسخة المحلية لتكون مطابقة لنسخة السحابة

# حمّل الإعدادات
. "$PSScriptRoot\config.ps1"

Write-Host "🔽 بدء السحب من Google Drive ..." -ForegroundColor Cyan
Write-Host "المصدر: $DriveFullPath"
Write-Host "الوجهة: $LocalPath"

# تأكد من وجود مسار المصدر على Google Drive
if (-not (Test-Path $DriveFullPath)) {
  Write-Host "❌ لم يتم العثور على مسار المشروع في Google Drive: $DriveFullPath" -ForegroundColor Red
  Write-Host "تحقق من حرف القرص أو اسم مجلد My Drive في config.ps1"
  exit 1
}

# أنشئ مجfolders الوجهة إن لزم
New-Item -ItemType Directory -Force $LocalPath | Out-Null

# جهّز استثناءات (تحاشيًا فقط)
$xdArgs = @()
foreach ($d in $ExcludeDirs) {
  $xdArgs += "/XD"
  $xdArgs += (Join-Path $LocalPath $d)
}

$xfArgs = @()
foreach ($f in $ExcludeFiles) {
  # هنا نمنع استبدال أسرارك المحلية إن وجدت
  $xfArgs += "/XF"
  $xfArgs += (Join-Path $LocalPath $f)
}

# ملف السجل
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $LogDir "pull-$timestamp.log"

# أوامر robocopy (من السحابة -> إلى المحلي)
$rcArgs = @(
  $DriveFullPath,
  $LocalPath,
  "/MIR",
  "/R:2",
  "/W:2",
  "/NFL",
  "/NDL",
  "/NP",
  "/LOG:$logFile"
) + $xdArgs + $xfArgs

Write-Host "⬅️  تشغيل robocopy ... قد يستغرق حسب حجم الملفات."
& robocopy @rcArgs | Out-Null
$code = $LASTEXITCODE

if ($code -le 7) {
  Write-Host "✅ تم السحب بنجاح. (رمز robocopy=$code)" -ForegroundColor Green
  Write-Host "📄 السجل: $logFile"
  Write-Host ""
  Write-Host "📌 تذكير بعد السحب على جهاز جديد:" -ForegroundColor Yellow
  Write-Host "    cd $LocalPath"
  Write-Host "    copy .env.example .env"
  Write-Host "    copy .env.example .env.local"
  Write-Host "    npm install"
  Write-Host "    npx prisma generate"
  Write-Host "    npx prisma migrate dev --name init"
  Write-Host "    npm run dev"
  exit 0
} else {
  Write-Host "❌ فشل السحب. (رمز robocopy=$code)" -ForegroundColor Red
  Write-Host "📄 راجع السجل: $logFile"
  exit $code
}
