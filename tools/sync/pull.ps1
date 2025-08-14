# tools/sync/pull.ps1
param(
  [switch]$GitOnly,
  [switch]$DriveOnly,
  [switch]$SkipGit,
  [switch]$SkipDrive
)

. "$PSScriptRoot\config.ps1"

Write-Host "🔽 بدء السحب (Pull)..." -ForegroundColor Cyan
Write-Host "📂 Local : $LocalPath"
Write-Host "☁️  Drive : $DriveFullPath"
Write-Host "🐙 GitHub: $GitRemote ($GitBranch)"

if ($GitOnly)   { $SkipDrive = $true;  $SkipGit = $false }
if ($DriveOnly) { $SkipGit   = $true;  $SkipDrive = $false }

# ----- GitHub -----
if (-not $SkipGit) {
  if (-not (Test-Git)) {
    Write-Host "⚠️ Git غير متاح. تخطّي GitHub." -ForegroundColor DarkYellow
  } elseif ([string]::IsNullOrWhiteSpace($GitRemote)) {
    Write-Host "⚠️ GitRemote غير مضبوط في config.ps1. تخطّي GitHub." -ForegroundColor DarkYellow
  } else {
    if (-not (Test-Path $LocalPath)) {
      Ensure-Dir (Split-Path $LocalPath -Parent)
      Write-Host "🧩 git clone أول مرة..." -ForegroundColor Yellow
      git clone $GitRemote $LocalPath
    } elseif (Test-Path (Join-Path $LocalPath ".git")) {
      Push-Location $LocalPath
      try { Write-Host "⬇️ git pull origin $GitBranch ..."; git pull origin $GitBranch } finally { Pop-Location }
    } else {
      Write-Host "ℹ️ المجلد موجود لكن ليس مستودع Git — تم تخطّي Git." -ForegroundColor Gray
    }
  }
}

# ----- Google Drive -----
if (-not $SkipDrive) {
  if (-not (Test-Path $DriveBase)) {
    Write-Host "⚠️ لم يتم العثور على قاعدة Google Drive: $DriveBase" -ForegroundColor DarkYellow
  } else {
    Ensure-Dir $LocalPath

    $xd = @(); foreach ($d in $ExcludeDirs)  { $xd += "/XD"; $xd += (Join-Path $LocalPath $d) }
    $xf = @(); foreach ($f in $ExcludeFiles) { $xf += "/XF"; $xf += (Join-Path $LocalPath $f) }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $logPull = Join-Path $LogDir "pull-drive-$timestamp.log"

    $rcArgs = @(
      $DriveFullPath, $LocalPath,
      "/MIR", "/COPY:DAT", "/DCOPY:T", "/FFT", "/J",
      "/R:2", "/W:2", "/NFL", "/NDL", "/NP", "/LOG:$logPull"
    ) + $xd + $xf

    $didMirror = $false
    if (Test-Path $DriveFullPath) {
      Write-Host "⬅️  مزامنة من Drive إلى المحلي (robocopy) ..."
      & robocopy @rcArgs
      $rc = $LASTEXITCODE
      if ($rc -le 7) { Write-Host "✅ تم السحب من Drive (robocopy=$rc). السجل: $logPull" -ForegroundColor Green; $didMirror = $true }
      else { Write-Host "⚠️ فشلت المزامنة (robocopy=$rc). السجل: $logPull" -ForegroundColor DarkYellow }
    } else {
      Write-Host "ℹ️ مجلد المشروع غير موجود في Drive بعد: $DriveFullPath" -ForegroundColor Gray
    }

    if (-not $didMirror) {
      # خطة بديلة: ابحث عن أحدث ZIP وفكّه
      $latestZip = Get-ChildItem $DriveFullPath -Filter "*.zip" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
      if ($latestZip) {
        Write-Host "🧩 العثور على أرشيف: $($latestZip.Name) — سيتم فكّه إلى $LocalPath" -ForegroundColor Yellow
        try {
          Expand-Archive -Path $latestZip.FullName -DestinationPath $LocalPath -Force
          Write-Host "✅ تم استخراج الأرشيف بنجاح." -ForegroundColor Green
        } catch {
          Write-Host "❌ فشل استخراج الأرشيف: $($_.Exception.Message)" -ForegroundColor Red
        }
      } else {
        Write-Host "ℹ️ لا توجد نسخة ZIP في Drive لاستخدامها كخطة بديلة." -ForegroundColor Gray
      }
    }
  }
}

Write-Host ""
Write-Host "📌 بعد أول سحب على جهاز جديد:" -ForegroundColor Yellow
Write-Host "    cd $LocalPath"
Write-Host "    copy .env.example .env"
Write-Host "    copy .env.example .env.local"
Write-Host "    npm install"
Write-Host "    npx prisma generate"
Write-Host "    npx prisma migrate dev --name init"
Write-Host "    npm run dev"
Write-Host ""
Write-Host "🎉 اكتمل السحب." -ForegroundColor Cyan
