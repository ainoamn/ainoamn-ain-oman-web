# tools/drive-sync/push-to-drive.ps1
# يدفع (يرفع) مشروعك من C:\dev\ain-oman-web إلى Google Drive
# يستثني node_modules/.next/.env وما شابه لتقليل المشاكل والحجم

# حمّل الإعدادات
. "$PSScriptRoot\config.ps1"

Write-Host "🔼 بدء الدفع إلى Google Drive ..." -ForegroundColor Cyan
Write-Host "المصدر: $LocalPath"
Write-Host "الوجهة: $DriveFullPath"

# تأكد من وجود مسار المصدر
if (-not (Test-Path $LocalPath)) {
  Write-Host "❌ لم يتم العثور على مسار المشروع المحلي: $LocalPath" -ForegroundColor Red
  exit 1
}

# أنشئ مجfolders الوجهة إن لزم
New-Item -ItemType Directory -Force $DriveFullPath | Out-Null

# جهّز قوائم الاستثناءات لـ robocopy
$xdArgs = @()
foreach ($d in $ExcludeDirs) {
  $xdArgs += "/XD"
  $xdArgs += (Join-Path $LocalPath $d)
}

$xfArgs = @()
foreach ($f in $ExcludeFiles) {
  $full = (Join-Path $LocalPath $f)
  $xfArgs += "/XF"
  $xfArgs += $full
}

# ملف السجل
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $LogDir "push-$timestamp.log"

# بناء أوامر robocopy
$rcArgs = @(
  $LocalPath,
  $DriveFullPath,
  "/MIR",          # مرآة (يحذف من الوجهة ما حُذف من المصدر)
  "/R:2",          # عدد إعادة المحاولة
  "/W:2",          # الانتظار بين المحاولات
  "/NFL",          # عدم سرد أسماء الملفات
  "/NDL",          # عدم سرد أسماء المجلدات
  "/NP",           # بدون نسبة تقدم
  "/LOG:$logFile"  # حفظ السجل
) + $xdArgs + $xfArgs

Write-Host "➡️  تشغيل robocopy ... قد يستغرق حسب حجم الملفات."
# نفّذ robocopy
& robocopy @rcArgs | Out-Null
$code = $LASTEXITCODE

# رموز نجاح robocopy من 0 حتى 7
if ($code -le 7) {
  Write-Host "✅ تم الدفع بنجاح. (رمز robocopy=$code)" -ForegroundColor Green
  Write-Host "📄 السجل: $logFile"
  exit 0
} else {
  Write-Host "❌ فشل الدفع. (رمز robocopy=$code)" -ForegroundColor Red
  Write-Host "📄 راجع السجل: $logFile"
  exit $code
}
