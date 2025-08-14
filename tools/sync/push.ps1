# tools/sync/push.ps1
. "$PSScriptRoot\config.ps1"

Write-Host "🔼 بدء الدفع (Push)..." -ForegroundColor Cyan
Write-Host "📂 Local : $LocalPath"
Write-Host "☁️  Drive : $DriveFullPath"
Write-Host "🐙 GitHub: $GitRemote ($GitBranch)"

# تأكد من وجود المسارات
if (-not (Test-Path $LocalPath)) {
  Write-Host "❌ لا يوجد مجلد محلي: $LocalPath" -ForegroundColor Red
  exit 1
}
Ensure-Dir $DriveFullPath

# بناء استثناءات robocopy
$xd = @(); foreach ($d in $ExcludeDirs)  { $xd += "/XD"; $xd += (Join-Path $LocalPath $d) }
$xf = @(); foreach ($f in $ExcludeFiles) { $xf += "/XF"; $xf += (Join-Path $LocalPath $f) }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPushDrive = Join-Path $LogDir "push-drive-$timestamp.log"

# ملاحظات خيارات النسخ:
# /MIR      : مرآة (ينسخ كل جديد ويحذف ما حُذف)
# /COPY:DAT : ينسخ البيانات/السمات/التوقيت (أنسب لـ Drive)
# /DCOPY:T  : يحافظ على أزمنة المجلدات
# /FFT      : توقيت بنمط FAT (سماحية ثواني) — مفيد مع درايفات سحابية
# /J        : نسخ غير مؤقت (أكثر ثباتًا أحيانًا)
# /R:2/W:2  : محاولتان وانتظار قصير
$rcArgs = @(
  $LocalPath,
  $DriveFullPath,
  "/MIR",
  "/COPY:DAT",
  "/DCOPY:T",
  "/FFT",
  "/J",
  "/R:2",
  "/W:2",
  "/NFL",
  "/NDL",
  "/NP",
  "/LOG:$logPushDrive"
) + $xd + $xf

Write-Host "➡️  مزامنة إلى Google Drive..." -ForegroundColor Yellow
& robocopy @rcArgs
$rcCode = $LASTEXITCODE

if ($rcCode -le 7) {
  Write-Host "✅ تم الدفع إلى Drive (robocopy=$rcCode). السجل: $logPushDrive" -ForegroundColor Green
} else {
  Write-Host "❌ فشل مزامنة Drive (robocopy=$rcCode)." -ForegroundColor Red
  Write-Host "📄 السجل: $logPushDrive"
  Write-Host "🧩 جرّب فتح السجل لمعرفة سبب الفشل (صلاحيات/ملفات مقفلة/مسار)." -ForegroundColor Yellow
  # نُكمل Git حتى لو فشل Drive
}

# ====== دفع إلى GitHub ======
if (-not (Test-Git)) {
  Write-Host "⚠️ Git غير مثبت/غير متاح. تخطّي GitHub." -ForegroundColor DarkYellow
  exit 0
}
if ([string]::IsNullOrWhiteSpace($GitRemote)) {
  Write-Host "⚠️ GitRemote غير مضبوط. عدّل config.ps1" -ForegroundColor DarkYellow
  exit 0
}

Push-Location $LocalPath
try {
  if (-not (Test-Path (Join-Path $LocalPath ".git"))) {
    Write-Host "ℹ️ تهيئة Git محلي..." -ForegroundColor Yellow
    git init
    git branch -M $GitBranch
    git remote add origin $GitRemote
  }

  $status = git status --porcelain
  if ($status) {
    git add -A
    git commit -m "[AUTO] Sync push at $timestamp"
  } else {
    Write-Host "ℹ️ لا تغييرات لِـ Git." -ForegroundColor Gray
  }

  Write-Host "⬆️ git push origin $GitBranch ..."
  git push -u origin $GitBranch
  Write-Host "✅ تم الدفع إلى GitHub." -ForegroundColor Green
}
finally { Pop-Location }

Write-Host "🎉 اكتمل الدفع." -ForegroundColor Cyan
