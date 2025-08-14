# tools/sync/push.ps1
. "$PSScriptRoot\config.ps1"

Write-Host "🔼 بدء الدفع (Push)..." -ForegroundColor Cyan
Write-Host "📂 Local : $LocalPath"
Write-Host "☁️  Drive : $DriveFullPath"
Write-Host "🐙 GitHub: $GitRemote ($GitBranch)"

if (-not (Test-Path $LocalPath)) { Write-Host "❌ لا يوجد مجلد محلي: $LocalPath" -ForegroundColor Red; exit 1 }
Ensure-Dir $DriveFullPath

# استثناءات robocopy
$xd = @(); foreach ($d in $ExcludeDirs)  { $xd += "/XD"; $xd += (Join-Path $LocalPath $d) }
$xf = @(); foreach ($f in $ExcludeFiles) { $xf += "/XF"; $xf += (Join-Path $LocalPath $f) }

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPushDrive = Join-Path $LogDir "push-drive-$timestamp.log"

# محاولة 1: Robocopy (مرآة)
$rcArgs = @(
  $LocalPath, $DriveFullPath,
  "/MIR", "/COPY:DAT", "/DCOPY:T", "/FFT", "/J",
  "/R:2", "/W:2", "/NFL", "/NDL", "/NP",
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
  Write-Host "🧩 سيتم تشغيل خطة ZIP الاحتياطية الآن..." -ForegroundColor Yellow

  # خطة بديلة: إنشاء نسخة ZIP نظيفة ورفعها إلى Drive
  $staging = Join-Path $env:TEMP "ain-oman-web-staging"
  if (Test-Path $staging) { Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue }
  New-Item -ItemType Directory -Force $staging | Out-Null

  # انسخ إلى staging محليًا مع نفس الاستثناءات
  $logStage = Join-Path $LogDir "stage-$timestamp.log"
  $rcStageArgs = @(
    $LocalPath, $staging,
    "/MIR", "/COPY:DAT", "/DCOPY:T", "/FFT", "/J",
    "/R:2", "/W:2", "/NFL", "/NDL", "/NP", "/LOG:$logStage"
  ) + $xd + $xf
  & robocopy @rcStageArgs | Out-Null

  $zipName = "ain-oman-web-$timestamp.zip"
  $zipPath = Join-Path $DriveFullPath $zipName

  try {
    if (Test-Path $zipPath) { Remove-Item -Force $zipPath -ErrorAction SilentlyContinue }
    Compress-Archive -Path "$staging\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
    Write-Host "✅ تم إنشاء ورفع النسخة ZIP إلى Drive: $zipPath" -ForegroundColor Green
  } catch {
    Write-Host "❌ فشل إنشاء/رفع ZIP: $($_.Exception.Message)" -ForegroundColor Red
  } finally {
    # نظّف الستيجنج
    Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
  }

  # حافظ على آخر 5 نسخ ZIP فقط
  try {
    $zips = Get-ChildItem $DriveFullPath -Filter "*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($zips.Count -gt 5) { $zips | Select-Object -Skip 5 | Remove-Item -Force -ErrorAction SilentlyContinue }
  } catch {}
}

# ====== دفع إلى GitHub ======
if (-not (Test-Git)) { Write-Host "⚠️ Git غير متاح — تخطّي GitHub." -ForegroundColor DarkYellow; exit 0 }
if ([string]::IsNullOrWhiteSpace($GitRemote)) { Write-Host "⚠️ GitRemote غير مضبوط في config.ps1." -ForegroundColor DarkYellow; exit 0 }

Push-Location $LocalPath
try {
  if (-not (Test-Path (Join-Path $LocalPath ".git"))) {
    Write-Host "ℹ️ تهيئة Git محلي..." -ForegroundColor Yellow
    git init; git branch -M $GitBranch; git remote add origin $GitRemote
  }
  $status = git status --porcelain
  if ($status) { git add -A; git commit -m "[AUTO] Sync push at $timestamp" } else { Write-Host "ℹ️ لا تغييرات لِـ Git." -ForegroundColor Gray }
  Write-Host "⬆️ git push origin $GitBranch ..."; git push -u origin $GitBranch
  Write-Host "✅ تم الدفع إلى GitHub." -ForegroundColor Green
} finally { Pop-Location }

Write-Host "🎉 اكتمل الدفع." -ForegroundColor Cyan
